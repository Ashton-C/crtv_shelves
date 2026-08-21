/**
 * Resolves cover art for a shelf item from keyless public APIs.
 *
 * IMPORTANT: none of these hosts are reachable from the dev container (the
 * egress proxy blocks them), so this module is covered by tests that stub
 * `fetch` rather than by live calls. The contracts below were researched
 * rather than executed — see the notes on each provider.
 */

export type ArtworkSource = "itunes" | "wikipedia" | "openlibrary";
export type ArtworkHit = { url: string; source: ArtworkSource };

const TIMEOUT_MS = 6000;

/**
 * Wikimedia's User-Agent policy is enforced — a generic or absent UA gets 403
 * or throttled. Format: <client>/<version> (<contact>).
 */
const USER_AGENT =
  "crtv_shelves/1.0 (+https://github.com/Ashton-C/crtv_shelves)";

// ── helpers ───────────────────────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** GETs JSON with a timeout. Returns null for any failure, never throws. */
async function getJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        // Browsers forbid setting User-Agent; Wikimedia accepts this instead.
        "Api-User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      // Cache at the framework layer: the same title resolves to the same art.
      next: { revalidate: 86400 },
    });

    // iTunes signals rate limiting with 403 and a body that still parses as
    // {"resultCount":0,"results":[]} — so a naive caller reads it as "no
    // results" and silently stops retrying. Treat any non-2xx as a failure.
    if (!res.ok) return null;

    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * iTunes artwork URLs end with a size token as the FINAL path segment, e.g.
 * `.../100x100bb.jpg`. The preceding path can itself contain `.jpg`
 * (`.../pr_source.jpg/100x100bb.jpg`), so the replacement is anchored to the
 * end of the string rather than matching the first occurrence.
 */
export function upsizeItunesArtwork(url: string, size = 600): string {
  // The token carries a variable format suffix — `100x100bb.jpg`, plain
  // `100x100.jpg`, `100x100bb-60.jpg`, and `.png` all occur. Matching only the
  // `bb.jpg` form silently no-ops on the rest and leaves a blurry 100px image
  // with no error anywhere, so the suffix and extension are preserved rather
  // than assumed. A non-match returns the original URL: degraded, not broken.
  return url.replace(
    /\/(\d+)x(\d+)([a-z0-9-]*)\.(jpg|png)$/i,
    (_match, _w: string, _h: string, suffix: string, ext: string) =>
      `/${size}x${size}${suffix}.${ext}`,
  );
}

/**
 * shelf_item.imageUrl is varchar(512), and Postgres ERRORS on overflow rather
 * than truncating — an over-long URL would abort the whole backfill. Anything
 * longer is treated as a miss so the item keeps its gradient placeholder.
 */
export const MAX_ARTWORK_URL_LENGTH = 512;

function withinColumnLimit(hit: ArtworkHit | null): ArtworkHit | null {
  if (!hit) return null;
  return hit.url.length <= MAX_ARTWORK_URL_LENGTH ? hit : null;
}

// ── iTunes ────────────────────────────────────────────────────────────────────

type ItunesEntity = "album" | "song" | "movie" | "tvSeason" | "ebook";

/**
 * NOTE: `entity=musicArtist` is deliberately absent. Artist results carry no
 * artwork fields at all, so artists are routed to Wikipedia instead.
 */
async function fromItunes(
  term: string,
  entity: ItunesEntity,
  media: string,
): Promise<ArtworkHit | null> {
  const params = new URLSearchParams({
    term,
    media,
    entity,
    limit: "5",
    country: "US",
  });

  const json = await getJson(`https://itunes.apple.com/search?${params.toString()}`);
  const results = asArray(asRecord(json)?.results);

  for (const raw of results) {
    const item = asRecord(raw);
    const art = str(item?.artworkUrl100);
    if (art) return { url: upsizeItunesArtwork(art), source: "itunes" };
  }
  return null;
}

// ── Wikipedia ─────────────────────────────────────────────────────────────────

/**
 * Resolves a fuzzy query to a page AND fetches its image in one request.
 *
 * Three researched details are load-bearing here:
 *  - `pilicense=any` is REQUIRED. It defaults to `free`, and box art, film
 *    posters and album covers are non-free local uploads — the default returns
 *    no thumbnail for exactly the media this app is about.
 *  - `formatversion=2` makes `query.pages` an ARRAY rather than an object
 *    keyed by pageid. Both shapes are handled defensively.
 *  - Page order is NOT relevance order; rank lives in the per-page `index`.
 *    Results are sorted by it, and the first page that actually HAS a
 *    thumbnail wins — the top hit is often a list or disambiguation page with
 *    no image, which is why the limit is 5 rather than 1.
 */
async function fromWikipedia(query: string): Promise<ArtworkHit | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "0",
    gsrlimit: "5",
    prop: "pageimages",
    piprop: "thumbnail|original|name",
    pithumbsize: "600",
    pilicense: "any",
    pilimit: "50",
    redirects: "1",
    maxage: "86400",
    smaxage: "86400",
  });

  const json = await getJson(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
  const rawPages = asRecord(asRecord(json)?.query)?.pages;
  const pages = Array.isArray(rawPages)
    ? rawPages
    : Object.values(asRecord(rawPages) ?? {});
  if (pages.length === 0) return null;

  const sorted = [...pages].sort((a, b) => {
    const ai = Number(asRecord(a)?.index ?? Number.MAX_SAFE_INTEGER);
    const bi = Number(asRecord(b)?.index ?? Number.MAX_SAFE_INTEGER);
    return ai - bi;
  });

  for (const raw of sorted) {
    const page = asRecord(raw);
    const thumb = str(asRecord(page?.thumbnail)?.source);
    if (thumb) return { url: thumb, source: "wikipedia" };
  }
  return null;
}

// ── Open Library ──────────────────────────────────────────────────────────────

/**
 * `default=false` matters: without it a missing cover returns a blank
 * placeholder image rather than a 404, which would render as a silently broken
 * tile instead of falling through to the next provider.
 */
async function fromOpenLibrary(title: string): Promise<ArtworkHit | null> {
  const params = new URLSearchParams({ q: title, limit: "5" });
  const json = await getJson(`https://openlibrary.org/search.json?${params.toString()}`);

  for (const raw of asArray(asRecord(json)?.docs)) {
    const doc = asRecord(raw);

    // cover_i is sometimes -1 (meaning "no cover") rather than absent, so a
    // presence check alone would yield a guaranteed-404 URL.
    const coverId = doc?.cover_i;
    if (typeof coverId === "number" && coverId > 0) {
      return {
        url: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`,
        source: "openlibrary",
      };
    }

    // The OLID path is the other un-rate-limited variant. (Covers by ISBN are
    // capped at 100 requests per IP per 5 minutes, so that path is avoided.)
    const olid = str(doc?.cover_edition_key);
    if (olid) {
      return {
        url: `https://covers.openlibrary.org/b/olid/${olid}-L.jpg?default=false`,
        source: "openlibrary",
      };
    }
  }
  return null;
}

// ── dispatch ──────────────────────────────────────────────────────────────────

/**
 * Types that name a PERSON or fictional character rather than a product.
 * These go to Wikipedia first: iTunes has no artwork for artists at all, and
 * photographs of people are usually freely licensed on Commons.
 */
const PERSON_TYPES = new Set([
  "artists",
  "directors",
  "authors",
  "characters",
]);

/** Disambiguation hints appended to Wikipedia queries. */
const WIKI_HINT: Record<string, string> = {
  games: "video game",
  film: "film",
  tv: "television series",
  books: "book",
  music: "music",
};

type Provider = () => Promise<ArtworkHit | null>;

function providerChain(
  name: string,
  category: string,
  type: string,
): Provider[] {
  const cat = category.toLowerCase();
  const kind = type.toLowerCase();
  const wikiQuery = `${name} ${WIKI_HINT[cat] ?? ""}`.trim();
  const wiki: Provider = () => fromWikipedia(wikiQuery);

  // People: Wikipedia first, then a representative album cover for musicians.
  if (PERSON_TYPES.has(kind)) {
    return cat === "music"
      ? [wiki, () => fromItunes(name, "album", "music")]
      : [wiki];
  }

  switch (cat) {
    case "music":
      return [
        () => fromItunes(name, kind === "songs" ? "song" : "album", "music"),
        wiki,
      ];
    case "film":
      return [() => fromItunes(name, "movie", "movie"), wiki];
    case "tv":
      return [() => fromItunes(name, "tvSeason", "tvShow"), wiki];
    case "books":
      return [
        () => fromOpenLibrary(name),
        () => fromItunes(name, "ebook", "ebook"),
        wiki,
      ];
    // Games deliberately use Wikipedia rather than Steam's storesearch. Steam
    // only covers PC titles — console exclusives (Zelda, Mario) are absent
    // entirely — and its search/appdetails endpoints are undocumented with no
    // terms grant or stability guarantee. Wikipedia covers every platform once
    // the "video game" hint is appended.
    case "games":
    default:
      return [wiki];
  }
}

/**
 * Best-effort artwork lookup. Returns null rather than throwing so a failed
 * lookup degrades to the existing gradient placeholder.
 */
export async function resolveArtwork(
  name: string,
  category: string,
  type: string,
): Promise<ArtworkHit | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  for (const provider of providerChain(trimmed, category, type)) {
    const hit = withinColumnLimit(await provider());
    if (hit) return hit;
  }
  return null;
}

/**
 * Resolves several items. Runs in SERIES on purpose: Wikimedia's etiquette
 * guidance asks for serial requests, and iTunes allows only ~20 calls/minute
 * per IP, so a parallel burst across a shelf would risk tripping the limit.
 */
export async function resolveArtworkForItems(
  items: { name: string }[],
  category: string,
  type: string,
): Promise<(string | null)[]> {
  const out: (string | null)[] = [];
  for (const item of items) {
    const hit = await resolveArtwork(item.name, category, type);
    out.push(hit?.url ?? null);
  }
  return out;
}
