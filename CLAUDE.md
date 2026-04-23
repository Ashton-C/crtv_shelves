# CLAUDE.md — crtv_shelves

## Project Overview

CRTV_SHELVES is a T3 Stack web app for curating and sharing ranked media lists ("shelves") with friends. Users create shelves for TV, movies, music, books, etc., customize their appearance, and share them socially.

**Stack:** Next.js 15 (App Router) · TypeScript · Drizzle ORM · PostgreSQL (Vercel Postgres) · Tailwind CSS v4 · Framer Motion

**Package manager:** `pnpm`

---

## Local Development Setup

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL
pnpm dev
```

The dev server uses Turbopack (`next dev --turbo`).

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` / `test` / `production` |

Env vars are validated at startup via `@t3-oss/env-nextjs` (see `src/env.js`). The build will fail if required vars are missing. Skip with `SKIP_ENV_VALIDATION=1`.

---

## Database — Vercel Postgres + Drizzle ORM

### Connecting Vercel Postgres

1. In the Vercel dashboard → **Storage** → **Create Database** → **Postgres (Neon)**
2. Connect the database to your project (this auto-populates env vars in Vercel)
3. Pull env vars locally:
   ```bash
   vercel env pull .env.local
   ```
4. Vercel exposes several `POSTGRES_*` vars. Map the right one to `DATABASE_URL` in `.env.local`:
   - For the **app** (pooled): use `POSTGRES_URL`
   - For **migrations** (non-pooled): Drizzle Kit needs a direct connection — see `drizzle.config.ts`

   ```
   DATABASE_URL="<value of POSTGRES_URL>"
   ```

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

Schema lives in `src/server/db/schema.ts`. All tables use the `crtv_shelves_` prefix (multi-project support).

DB instance is in `src/server/db/index.ts`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / splash page
│   ├── layout.tsx          # Root layout
│   ├── login/
│   ├── signup/
│   ├── about/
│   └── dashboard/
│       ├── layout.tsx      # Dashboard shell (nav + sidebar)
│       ├── page.tsx        # Dashboard home
│       ├── create_shelf/   # Shelf creation flow (most complete feature)
│       ├── display/        # User's shelf list
│       ├── view_shelf/[slug]/  # Public shelf view
│       ├── manage_friends/
│       └── settings/
├── server/
│   └── db/
│       ├── index.ts        # Drizzle client instance
│       └── schema.ts       # Database schema (expand this)
├── styles/
│   └── globals.css         # Tailwind v4 + CSS custom properties
└── env.js                  # Env var validation schema
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

Custom CSS variables defined in `src/styles/globals.css`:

| Variable | Color | Use |
|---|---|---|
| `--color-1` | `#fa0ffa` | Magenta — primary accent |
| `--color-2` | `#fafa0f` | Yellow — secondary accent |
| `--color-3` | `#0ffafa` | Cyan |
| `--color-4` | `#fa850f` | Orange |
| `--color-5` | `#0ffa85` | Green |

Referenced in Tailwind via `bg-1`, `bg-5/80`, etc. (Tailwind v4 CSS variable syntax).

Fonts: **Montserrat** (body), **Rubik Broken Fax** (display/hero text).

---

## Auth — Clerk (Planned)

Authentication is not yet wired up. Plan: use Clerk for auth.

When adding Clerk:
1. `pnpm add @clerk/nextjs`
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `src/env.js`
3. Add `ClerkProvider` to `src/app/layout.tsx`
4. Protect dashboard routes via middleware (`src/middleware.ts`)
5. Replace the placeholder user button in `src/app/dashboard/layout.tsx`

---

## Implementation Status

| Feature | Status |
|---|---|
| Landing page | Done (static) |
| Dashboard shell (nav/sidebar) | Done (static) |
| Shelf creation UI + live preview | Done (no DB persistence yet) |
| Database schema | Placeholder only — needs real schema |
| Auth (Clerk) | Not started |
| DB persistence for shelves | Not started |
| File uploads (Uploadthing) | Not started |
| Friend system | UI scaffolded, no backend |
| Public shelf view (`/view_shelf/[slug]`) | Route exists, no data |
| API routes / server actions | Not started |
