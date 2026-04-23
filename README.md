# CRTV_SHELVES

A social media curation app. Create ranked "shelves" for your favorite TV shows, movies, music, books, and more — then share them with friends.

Built on the T3 Stack: **Next.js 15 · TypeScript · Drizzle ORM · Vercel Postgres · Tailwind CSS v4**

---

## Roadmap

### Milestone 1 — Foundation (In Progress)
- [x] Vercel deploy
- [x] T3 Stack scaffolding (Next.js, Drizzle, Tailwind, env validation)
- [x] Dashboard shell (nav + sidebar layout)
- [x] Shelf creation UI with live preview and color customization
- [ ] `.env.example` file
- [ ] Vercel Postgres connected
- [ ] Real database schema (users, shelves, shelf items)
- [ ] Drizzle migrations pushed to production

### Milestone 2 — Auth & Persistence
- [ ] Clerk authentication (sign up, log in, session)
- [ ] Protect dashboard routes via middleware
- [ ] Server actions: create shelf, fetch shelves
- [ ] Display page shows user's actual shelves
- [ ] Public shelf view (`/view_shelf/[slug]`) loads real data

### Milestone 3 — Social
- [ ] Friend requests (send, accept, decline)
- [ ] View a friend's shelves
- [ ] Privacy controls (hide shelf from friends)
- [ ] User profiles

### Milestone 4 — Media & Polish
- [ ] Uploadthing integration for shelf cover images
- [ ] Rich shelf customization (themes, fonts)
- [ ] Search / discover public shelves
- [ ] Mobile-responsive polish pass

### Milestone 5 — Revamp (Design)
- [ ] Apply new design system from Claude Design notes
- [ ] Updated landing page
- [ ] Updated dashboard layout
- [ ] Component library / design tokens finalized

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Turbopack in dev |
| Language | TypeScript 5 | Strict mode |
| ORM | Drizzle ORM | Schema in `src/server/db/schema.ts` |
| Database | Vercel Postgres (Neon) | `DATABASE_URL` env var |
| Styling | Tailwind CSS v4 | CSS variable-based design tokens |
| Animation | Framer Motion | Shelf creation flow |
| Auth | Clerk | Planned |
| File uploads | Uploadthing | Planned |
| Package manager | pnpm | Required |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Vercel account (for Postgres)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Vercel Postgres

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → **Storage** → **Create Database** → **Postgres**
2. Connect the database to your project
3. Pull the env vars locally:
   ```bash
   vercel env pull .env.local
   ```
4. In `.env.local`, ensure `DATABASE_URL` is set to the `POSTGRES_URL` value from Vercel

### 3. Push the database schema

```bash
pnpm db:push
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/            # Pages (Next.js App Router)
│   ├── dashboard/  # Authenticated app shell
│   └── ...         # Landing, login, signup, about
├── server/
│   └── db/         # Drizzle schema + client
├── styles/         # Global CSS + Tailwind config
└── env.js          # Environment variable validation
```

See [CLAUDE.md](./CLAUDE.md) for the full developer reference.

---

## Scripts

```bash
pnpm dev            # Dev server
pnpm build          # Production build
pnpm check          # Lint + type check
pnpm format:write   # Auto-format
pnpm db:push        # Sync schema to DB
pnpm db:studio      # Open Drizzle Studio
```
