import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveArtwork, upsizeItunesArtwork } from "../artwork";

// These providers are unreachable from CI/dev (egress-blocked), so every test
// stubs fetch. The fixtures below mirror the documented response shapes.

const realFetch = global.fetch;

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

/** Routes a stubbed fetch by URL substring. */
function stubFetch(routes: { match: string; body: unknown; ok?: boolean }[]) {
  const spy = vi.fn((input: string | URL | Request) => {
    const url = String(input);
    for (const r of routes) {
      if (url.includes(r.match)) {
        return Promise.resolve(jsonResponse(r.body, r.ok ?? true));
      }
    }
    return Promise.resolve(jsonResponse({}, false, 404));
  });
  global.fetch = spy as unknown as typeof fetch;
  return spy;
}

const ITUNES_ALBUM = {
  resultCount: 1,
  results: [
    {
      wrapperType: "collection",
      collectionName: "good kid, m.A.A.d city",
      artistName: "Kendrick Lamar",
      artworkUrl100:
        "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/ab/cd/ef/abcdef.png/100x100bb.jpg",
    },
  ],
};

function wikiPages(pages: unknown[]) {
  return { batchcomplete: true, query: { pages } };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  global.fetch = realFetch;
});

describe("upsizeItunesArtwork", () => {
  it("replaces the trailing size token", () => {
    expect(
      upsizeItunesArtwork("https://x/image/thumb/a/b.png/100x100bb.jpg"),
    ).toBe("https://x/image/thumb/a/b.png/600x600bb.jpg");
  });

  it("anchors to the END so an earlier .jpg in the path is untouched", () => {
    // Movie artwork embeds `pr_source.jpg/` before the size token; a naive
    // replace on the first match would corrupt the path.
    const url =
      "https://is2-ssl.mzstatic.com/image/thumb/Video122/v4/99/pr_source.jpg/100x100bb.jpg";
    expect(upsizeItunesArtwork(url)).toBe(
      "https://is2-ssl.mzstatic.com/image/thumb/Video122/v4/99/pr_source.jpg/600x600bb.jpg",
    );
  });

  it("accepts a custom size", () => {
    expect(upsizeItunesArtwork("https://x/a/100x100bb.jpg", 1200)).toBe(
      "https://x/a/1200x1200bb.jpg",
    );
  });

  it("leaves a non-matching URL alone", () => {
    const url = "https://upload.wikimedia.org/foo/600px-Bar.jpg";
    expect(upsizeItunesArtwork(url)).toBe(url);
  });
});

describe("resolveArtwork — routing", () => {
  it("returns null for a blank name without hitting the network", async () => {
    const spy = stubFetch([]);
    expect(await resolveArtwork("   ", "music", "Albums")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("uses iTunes album search for music/Albums and upsizes the art", async () => {
    stubFetch([{ match: "itunes.apple.com", body: ITUNES_ALBUM }]);
    const hit = await resolveArtwork("good kid", "music", "Albums");
    expect(hit?.source).toBe("itunes");
    expect(hit?.url).toContain("600x600bb.jpg");
  });

  it("routes ARTISTS to Wikipedia first — iTunes artist results carry no artwork", async () => {
    const spy = stubFetch([
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          {
            index: 1,
            title: "Kendrick Lamar",
            thumbnail: { source: "https://upload.wikimedia.org/kendrick.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("Kendrick Lamar", "music", "Artists");
    expect(hit?.source).toBe("wikipedia");
    // First call must be Wikipedia, not iTunes.
    expect(String(spy.mock.calls[0]?.[0])).toContain("en.wikipedia.org");
  });

  it("sends pilicense=any — the default 'free' returns nothing for cover art", async () => {
    const spy = stubFetch([
      { match: "en.wikipedia.org", body: wikiPages([]) },
    ]);
    await resolveArtwork("Apex Legends", "games", "Games");
    expect(String(spy.mock.calls[0]?.[0])).toContain("pilicense=any");
  });

  it("appends a disambiguation hint for games", async () => {
    const spy = stubFetch([{ match: "en.wikipedia.org", body: wikiPages([]) }]);
    await resolveArtwork("Noita", "games", "Games");
    // URLSearchParams encodes spaces as "+", which is what iTunes' docs
    // specify and Wikipedia also accepts.
    expect(String(spy.mock.calls[0]?.[0])).toContain(
      "gsrsearch=Noita+video+game",
    );
  });

  it("tries Open Library before iTunes for books", async () => {
    const spy = stubFetch([
      { match: "openlibrary.org/search.json", body: { docs: [{ cover_i: 42 }] } },
    ]);
    const hit = await resolveArtwork("Dune", "books", "Books");
    expect(hit?.source).toBe("openlibrary");
    expect(hit?.url).toContain("/b/id/42-L.jpg");
    // default=false so a missing cover 404s instead of returning a blank image.
    expect(hit?.url).toContain("default=false");
    expect(String(spy.mock.calls[0]?.[0])).toContain("openlibrary.org");
  });
});

describe("resolveArtwork — Open Library", () => {
  it("treats cover_i of -1 as no cover and moves on", async () => {
    // Open Library uses -1 rather than omitting the field on some records; a
    // presence-only check would build a guaranteed-404 cover URL.
    stubFetch([
      {
        match: "openlibrary.org/search.json",
        body: { docs: [{ cover_i: -1 }, { cover_i: 77 }] },
      },
    ]);
    const hit = await resolveArtwork("Dune", "books", "Books");
    expect(hit?.url).toContain("/b/id/77-L.jpg");
  });

  it("falls back to the OLID cover path when cover_i is unusable", async () => {
    stubFetch([
      {
        match: "openlibrary.org/search.json",
        body: { docs: [{ cover_i: -1, cover_edition_key: "OL123M" }] },
      },
    ]);
    const hit = await resolveArtwork("Dune", "books", "Books");
    expect(hit?.url).toContain("/b/olid/OL123M-L.jpg");
  });

  it("falls through to the next provider when no doc has any cover", async () => {
    stubFetch([
      { match: "openlibrary.org/search.json", body: { docs: [{ title: "x" }] } },
      { match: "itunes.apple.com", body: { resultCount: 0, results: [] } },
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          {
            index: 1,
            title: "Dune",
            thumbnail: { source: "https://upload.wikimedia.org/dune.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("Dune", "books", "Books");
    expect(hit?.source).toBe("wikipedia");
  });
});

describe("resolveArtwork — Wikipedia parsing", () => {
  it("sorts by `index`, because page order is NOT relevance order", async () => {
    stubFetch([
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          {
            index: 2,
            title: "Wrong Page",
            thumbnail: { source: "https://upload.wikimedia.org/wrong.jpg" },
          },
          {
            index: 1,
            title: "Right Page",
            thumbnail: { source: "https://upload.wikimedia.org/right.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("Apex Legends", "games", "Games");
    expect(hit?.url).toBe("https://upload.wikimedia.org/right.jpg");
  });

  it("skips higher-ranked pages that have no thumbnail", async () => {
    // The top hit is frequently a list or disambiguation page with no image.
    stubFetch([
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          { index: 1, title: "List of games" },
          {
            index: 2,
            title: "Noita",
            thumbnail: { source: "https://upload.wikimedia.org/noita.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("Noita", "games", "Games");
    expect(hit?.url).toBe("https://upload.wikimedia.org/noita.jpg");
  });

  it("handles the formatversion=1 object-keyed page shape too", async () => {
    stubFetch([
      {
        match: "en.wikipedia.org",
        body: {
          query: {
            pages: {
              "12345": {
                index: 1,
                title: "Noita",
                thumbnail: { source: "https://upload.wikimedia.org/obj.jpg" },
              },
            },
          },
        },
      },
    ]);
    const hit = await resolveArtwork("Noita", "games", "Games");
    expect(hit?.url).toBe("https://upload.wikimedia.org/obj.jpg");
  });

  it("returns null when no page has an image", async () => {
    stubFetch([
      {
        match: "en.wikipedia.org",
        body: wikiPages([{ index: 1, title: "Nothing" }]),
      },
    ]);
    expect(await resolveArtwork("zzz", "games", "Games")).toBeNull();
  });
});

describe("resolveArtwork — failure handling", () => {
  it("treats a non-2xx as failure, so a 403 rate-limit is not read as 'no results'", async () => {
    // iTunes answers a rate-limited request with 403 AND a body that parses as
    // an empty result set, which a naive client would accept as a valid miss.
    const spy = stubFetch([
      {
        match: "itunes.apple.com",
        body: { resultCount: 0, results: [] },
        ok: false,
      },
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          {
            index: 1,
            title: "Fallback",
            thumbnail: { source: "https://upload.wikimedia.org/fallback.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("something", "music", "Albums");
    // It fell through to Wikipedia rather than stopping at the 403.
    expect(hit?.source).toBe("wikipedia");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("falls through to the next provider when the first returns nothing", async () => {
    stubFetch([
      { match: "itunes.apple.com", body: { resultCount: 0, results: [] } },
      {
        match: "en.wikipedia.org",
        body: wikiPages([
          {
            index: 1,
            title: "X",
            thumbnail: { source: "https://upload.wikimedia.org/x.jpg" },
          },
        ]),
      },
    ]);
    const hit = await resolveArtwork("obscure album", "music", "Albums");
    expect(hit?.source).toBe("wikipedia");
  });

  it("returns null instead of throwing when fetch rejects", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("network down")),
    ) as unknown as typeof fetch;
    await expect(
      resolveArtwork("anything", "games", "Games"),
    ).resolves.toBeNull();
  });

  it("returns null instead of throwing when the body is not valid JSON", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("bad json")),
      } as unknown as Response),
    ) as unknown as typeof fetch;
    await expect(
      resolveArtwork("anything", "games", "Games"),
    ).resolves.toBeNull();
  });
});
