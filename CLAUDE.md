# CLAUDE.md — crtv_shelves

## Project Overview

CRTV_SHELVES is a T3 Stack web app for curating and sharing ranked media lists ("shelves") with friends. Users create shelves for TV, movies, music, books, etc., customize their appearance, and share them socially.

**Stack:** Next.js 15 (App Router) · TypeScript · Drizzle ORM · PostgreSQL (Vercel Postgres) · Tailwind CSS v4 · Framer Motion · Clerk (auth, planned)

**Package manager:** `pnpm`

---

## Local Development Setup

```bash
pnpm install
cp .env.example .env.local   # fill in POSTGRES_URL + Clerk keys
pnpm dev
```

The dev server uses Turbopack (`next dev --turbo`).

### Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | PostgreSQL connection string (use `POSTGRES_URL` from Vercel) |
| `NODE_ENV` | `development` / `test` / `production` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (add when wiring auth) |
| `CLERK_SECRET_KEY` | Clerk secret key (add when wiring auth) |
| `UPLOADTHING_TOKEN` | Optional. Image uploads. Without it, upload controls are hidden and the app degrades to auto-fetched artwork only. |

Env vars are validated at startup via `@t3-oss/env-nextjs` (see `src/env.js`). Skip with `SKIP_ENV_VALIDATION=1`.

---

## Database — Vercel Postgres + Drizzle ORM

### Connecting Vercel Postgres

1. In the Vercel dashboard → **Storage** → **Create Database** → **Postgres (Neon)**
2. Connect the database to your project (this auto-populates env vars in Vercel)
3. Pull env vars locally:
   ```bash
   vercel env pull .env.local
   ```
4. Vercel exposes several `POSTGRES_*` vars. Confirm `.env.local` ends up with a
   `POSTGRES_URL` line — that is the only one this project reads, from both the app
   (`src/server/db/index.ts`) and the Drizzle CLI (`drizzle.config.ts`). If Vercel only
   populated `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`, copy one into
   `POSTGRES_URL` yourself.

   > `drizzle-kit` does not auto-load `.env.local` — only `.env`. `drizzle.config.ts`
   > loads it explicitly, so a plain `vercel env pull .env.local` is enough. Note that
   > a `dotenv` call cannot go above the `~/env` import: ES imports are hoisted, so
   > validation would run first.

5. Push the schema:
   ```bash
   pnpm db:push
   ```

### Drizzle Workflow

| Command | What it does |
|---|---|
| `pnpm db:push` | Push schema changes directly to DB (no migration files) |
| `pnpm db:generate` | Generate SQL migration files from schema changes |
| `pnpm db:migrate` | Run pending migration files |
| `pnpm db:studio` | Open Drizzle Studio (local DB UI) |

Schema lives in `src/server/db/schema.ts`. All tables use the `crtv_shelves_` prefix.

### Schema Tables

| Table | Purpose |
|---|---|
| `crtv_shelves_user` | User profiles — populated by Clerk on first sign-in. Also holds the account privacy flags (`isPublic`, `shareByLink`, `showShelfCounts`) |
| `crtv_shelves_shelf` | Shelves (name, category, type, size, slug, `isPrivate`, `isCollaborative`, shareCount, displayOrder) |
| `crtv_shelves_shelf_item` | Items within a shelf (rank, name, sub, gradient colors, image) |
| `crtv_shelves_shelf_item_reaction` | Per-item reactions. `type` is one of `fire` / `skull` / `eyes` / `check`. Unique on (shelfItemId, userId, type) |
| `crtv_shelves_shelf_collaborator` | Users granted edit access to a shelf. Unique on (shelfId, userId) |
| `crtv_shelves_friendship` | Friend relationships (pending / accepted / declined) |

All six tables are live in production as of 2026-08-21.

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing / welcome page
│   ├── layout.tsx              # Root layout (Inter font, ClerkProvider)
│   ├── middleware.ts           # Clerk route protection
│   ├── login/                  # Clerk SignIn
│   ├── signup/                 # Clerk SignUp
│   └── dashboard/
│       ├── layout.tsx          # 3-panel shell (sidebar + feed + content)
│       ├── page.tsx            # Profile grid (mobile) / empty state (desktop)
│       ├── create_shelf/       # 4-step shelf creation flow
│       ├── view_shelf/[slug]/  # Shelf detail view
│       ├── manage_friends/     # Friends list
│       ├── settings/           # Settings
│       └── search/             # Search (stub)
├── components/                 # Shared UI components
│   ├── badge.tsx               # Category/label badges
│   ├── bottom-nav.tsx          # Mobile bottom nav (5 tabs + FAB)
│   ├── item-thumb.tsx          # ItemThumb + CollageTile
│   ├── profile-feed.tsx        # Profile grid (used in layout + mobile page)
│   ├── shelf-card.tsx          # Shelf card with 2×2 collage
│   ├── sidebar-nav.tsx         # Desktop sidebar nav
│   └── step-dots.tsx           # Step progress dots
├── lib/
│   └── mock-data.ts            # Mock data + TypeScript types (Item, Shelf, etc.)
├── server/
│   ├── actions/
│   │   └── shelves.ts          # Server actions: createShelf, getUserShelves
│   └── db/
│       ├── index.ts            # Drizzle client instance
│       └── schema.ts           # Database schema + relations
├── styles/
│   └── globals.css             # Tailwind v4 + design tokens
└── env.js                      # Env var validation schema
```

---

## Key Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm check        # Lint + type check (run before committing)
pnpm format:write # Auto-format all files
pnpm db:push      # Sync schema to database
pnpm db:studio    # Open Drizzle Studio
```

---

## Design System

Custom CSS variables defined in `src/styles/globals.css` (Tailwind v4):

| Variable | Color | Use |
|---|---|---|
| `--color-bg` | `#131313` | Main app background |
| `--color-surface` | `#1c1b1b` | Cards, inputs |
| `--color-surface-2` | `#242323` | Secondary surfaces, buttons |
| `--color-border` | `#2e2d2d` | Dividers and borders |
| `--color-text` | `#f0eeec` | Primary text |
| `--color-muted` | `#7a7775` | Secondary text, placeholders |
| `--color-accent` | `#ff5f00` | Sonic Orange — primary CTA, active states, rank #1 |
| `--color-gold` | `#ffbd00` | Secondary — rank badges, category labels |
| `--color-violet` | `#6236ff` | Tertiary — reserved |
| `--color-amber` | `#f59e0b` | Create Format screen only |

Referenced in Tailwind via `bg-bg`, `text-accent`, `border-border`, etc.

Font: **Inter** (weights 400–900, variable `--font-inter`). Shelf names always italic.

---

## Auth — Clerk

**Status:** Live. Sign-up, sign-in, and route protection are verified in production.

### Setup Steps (for a fresh environment)
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy keys to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```
3. Add both to Vercel environment variables

> Both keys are `.optional()` in `src/env.js`, so a build **succeeds without them** and
> then fails at runtime on every `/dashboard/*` route. If auth breaks with a green
> deploy, check these first.

### Implementation Notes
- `ClerkProvider` wraps `<body>` in `src/app/layout.tsx`
- `src/middleware.ts` protects all `/dashboard/*` routes
- Dashboard layout uses `<UserButton>` from `@clerk/nextjs`
- Server actions call `auth()` to get `userId`; no Clerk webhook needed for MVP — user ID stored directly in `shelves.userId`

---

## Implementation Status

Last verified 2026-08-21 against production. See [README.md](./README.md) for the
milestone-level roadmap.

| Feature | Status |
|---|---|
| Landing / welcome page | Done |
| Dashboard 3-panel layout (sidebar + feed + detail) | Done |
| Mobile layout (bottom nav) | Done |
| Auth (Clerk) | Done — live |
| Database schema | Done — pushed to production |
| DB persistence for shelves | Done |
| 4-step shelf creation UI | Done — persists via `createShelf` |
| Item search modal (create + edit flows) | Done |
| Shelf view page | Done — real data |
| Shelf editing / deletion | Done |
| Reorder shelves | Done — `@hello-pangea/dnd` |
| Public profile (`/u/[handle]`) | Done — works signed out |
| OG share cards | Done — `next/og` |
| Search / discover | Done |
| Settings screen | Done — persists to DB |
| Send friend request | Done |
| Accept / decline friend request | Done |
| Taste compatibility score | Done |
| Activity feed | Done |
| Wrapped stats | Done |
| Item reactions | Done |
| Collaborative shelves | Done |
| Per-shelf privacy toggle | Done — enforced on view + OG routes |
| Rich shelf customization (themes, fonts) | Not started |
| File uploads (UploadThing) | Done — optional, per shelf item |
| Auto-fetched cover art | Done — see Artwork below |

### Known Gaps

- **Artwork cannot be verified locally.** See Artwork below.
- Rich shelf customization (themes, fonts) is not started.
- `getFriends` issues a few queries per friend. Fine at current scale; worth a
  join if a user ever has many friends.

---

## Artwork — auto-fetched cover images

`src/server/services/artwork.ts` resolves a cover image per shelf item from
keyless public APIs. Chain by category and type:

| Shelf type | Provider order |
|---|---|
| Artists / Directors / Authors / Characters | Wikipedia → (music only) iTunes album |
| Albums / Songs | iTunes → Wikipedia |
| Films | iTunes (`movie`) → Wikipedia |
| Shows | iTunes (`tvSeason`) → Wikipedia |
| Books | Open Library → iTunes (`ebook`) → Wikipedia |
| Games / Franchises | Wikipedia |

Non-obvious constraints, each of which is load-bearing and has a test:

- **iTunes returns no artwork at all for `entity=musicArtist`.** Artist results
  carry only name/id fields. That is why person-type shelves go to Wikipedia
  first — and it matters, since "top N artists" is a common shelf.
- **Wikipedia's `pilicense` defaults to `free`.** Box art, film posters and
  album covers are non-free uploads, so the default returns nothing for exactly
  this app's content. `pilicense=any` is required.
- **Wikipedia page order is not relevance order.** Rank lives in the per-page
  `index` field; results are sorted by it. The request asks for 5 results and
  takes the first that actually has a thumbnail, because the top hit is often a
  list or disambiguation page with no image.
- **iTunes signals rate limiting with HTTP 403 plus a body that parses as an
  empty result set.** Any non-2xx is treated as failure so it falls through
  rather than being read as a genuine miss.
- **Open Library uses `cover_i: -1` for "no cover"** on some records, and
  without `?default=false` a missing cover returns 200 with a blank image.
- Games use Wikipedia rather than Steam: Steam has no console exclusives
  (Zelda, Mario) and its search endpoints are undocumented with no terms grant.

Lookups run **in series** — Wikimedia asks for serial requests and iTunes allows
roughly 20 calls/minute per IP.

Resolution happens **after** a shelf is written, not during: `ArtworkBackfill`
renders on the shelf view for an owner/collaborator when any item lacks art,
calls `backfillShelfArtwork`, then refreshes. Creation and saving stay fast, and
art fills in progressively. Only rows where `imageUrl IS NULL` are touched, so an
uploaded image is never overwritten.

> **These hosts are blocked by the dev container's egress proxy**, so the
> providers cannot be exercised locally — `curl` to itunes/wikipedia/openlibrary
> returns `CONNECT tunnel failed, 403`. The contracts were researched, not run.
> Coverage comes from `src/server/services/__tests__/artwork.test.ts`, which
> stubs `fetch`. **First real verification happens on Vercel.**

A note on licensing: `pilicense=any` returns images that are fair-use *on
Wikipedia*. Hotlinking non-free cover art is normal for hobby projects but is not
a license grant — worth a look before any public launch.

---

## Testing

```bash
pnpm test        # vitest run — 80 tests
pnpm test:watch  # watch mode
```

Tests live in `src/**/__tests__/`. Server-action tests mock `@clerk/nextjs/server`
and `~/server/db`; `src/test/setup.ts` mocks `nanoid` for deterministic slugs.

`tsconfig.json` includes `**/*.ts`, so test files are covered by `pnpm typecheck`.
They are **not** a deploy gate, however: `next.config.js` currently sets
`typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, so
`next build` ships regardless of type or lint errors. Run `pnpm check` yourself
before pushing — a green Vercel deploy does not mean the types are sound.

(Turning those two flags off would make the deploy catch this automatically.
`pnpm typecheck` is clean as of this writing, so it would be safe to do.)

[QA_RUNTHROUGH.md](./QA_RUNTHROUGH.md) is the manual pass: 16 sections, sign-off
checklist at the end.
