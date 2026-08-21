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
| **Accept / decline friend request** | **Server actions only — no UI wired up** |
| Taste compatibility score | Done |
| Activity feed | Done |
| Wrapped stats | Done |
| Item reactions | Done |
| Collaborative shelves | Done |
| **Per-shelf privacy toggle** | **Not started — `isPrivate` is hardcoded `false` on create** |
| Rich shelf customization (themes, fonts) | Not started |
| File uploads (Uploadthing) | Not started |

### Known Gaps

Two items above are load-bearing and worth understanding before picking up new work:

1. **Friend requests cannot be accepted in-app.** `respondToRequest()` and
   `getPendingRequests()` exist in `src/server/actions/friends.ts`, but nothing calls
   them. Friendships can only be completed by editing the DB directly, which in turn
   makes the activity feed and taste-match scores unreachable for a normal user.
2. **Every shelf is permanently public.** `createShelf()` hardcodes `isPrivate: false`
   and `updateShelf()` does not accept the field, so there is no write path. Five read
   queries already honor the column — only the toggle is missing.

---

## Testing

```bash
pnpm test        # vitest run — 46 tests
pnpm test:watch  # watch mode
```

Tests live in `src/**/__tests__/`. Server-action tests mock `@clerk/nextjs/server`
and `~/server/db`; `src/test/setup.ts` mocks `nanoid` for deterministic slugs.

Note that `tsconfig.json` includes `**/*.ts`, so **test files are typechecked during
`next build`** — a type error in a test will fail the Vercel deploy.

[QA_RUNTHROUGH.md](./QA_RUNTHROUGH.md) is the manual pass: 16 sections, sign-off
checklist at the end.
