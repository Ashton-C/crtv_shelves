# crtv_shelves — QA Run-Through

Pre-production manual testing guide. Work through each section top to bottom. Mark each item ✅ pass or ❌ fail with a note.

---

## 0. Environment Setup

Before testing, verify:

- [ ] `.env.local` contains `POSTGRES_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`
- [ ] `pnpm db:push` has been run (schema is up to date with all Phase 4 tables)
- [ ] `pnpm dev` starts without errors on `localhost:3000`
- [ ] DB Studio (`pnpm db:studio`) can connect and shows all tables:
  - `crtv_shelves_user`
  - `crtv_shelves_shelf`
  - `crtv_shelves_shelf_item`
  - `crtv_shelves_shelf_item_reaction`
  - `crtv_shelves_shelf_collaborator`
  - `crtv_shelves_friendship`

> **Tip:** Use two browser profiles (or Chrome + an incognito window) to test multi-user flows like friends and reactions.

---

## 1. Auth Flow

### 1.1 Sign Up

- [ ] Visit `/` — landing page loads
- [ ] Click "get started" — redirects to `/signup`
- [ ] Complete Clerk sign-up with a new email
- [ ] After sign-up, lands on `/dashboard` (not a 404 or error page)
- [ ] A `crtv_shelves_user` record was created in the DB (verify via `pnpm db:studio` or Studio)
- [ ] `handle` is auto-generated and is lowercase with no spaces

### 1.2 Sign In / Sign Out

- [ ] Sign out via the avatar button in the sidebar (desktop) or settings page
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] Sign back in — lands on `/dashboard`
- [ ] All `/dashboard/*` routes are protected (try visiting `/dashboard/settings` while signed out)

### 1.3 Second Account (needed for friend tests)

- [ ] Sign up a second account in a separate browser/incognito
- [ ] Note the handles of both accounts — you'll need them later

---

## 2. Create Shelf

### 2.1 Happy Path (4-step flow)

- [ ] Click "Create" in sidebar or FAB button on mobile
- [ ] **Step 1 — Format:** Select a category (e.g. Music), then a type (e.g. Artists). Step dots advance.
- [ ] **Step 2 — Size:** Select a size (Podium = 3, Focus = 5, Archive = 8). Preview updates slot count.
- [ ] **Step 3 — Name:** Type a shelf name (lowercase enforced, max 32 chars). Counter shows `n/32`.
- [ ] **Step 4 — Items:** Each slot has a search icon. Tap the icon → item search modal opens.
  - [ ] Search modal filters by the chosen category
  - [ ] Typing filters results in real-time
  - [ ] Selecting a suggestion fills the slot
  - [ ] Typing a custom name shows "add custom" option
  - [ ] Closing the modal without selecting leaves the slot empty
- [ ] Click "create shelf" → shelf appears in the profile feed
- [ ] Shelf appears in the DB (`crtv_shelves_shelf` and `crtv_shelves_shelf_item`)

### 2.2 Edge Cases

- [ ] Name field accepts only lowercase (uppercase typed → converted automatically)
- [ ] Cannot advance past Step 3 without a shelf name
- [ ] Creating a shelf with some empty slots — only filled slots are saved
- [ ] Shelf slug is unique even if two shelves share the same name

---

## 3. View Shelf

### 3.1 Layout

- [ ] Click a shelf card → `/dashboard/view_shelf/[slug]` loads
- [ ] Gradient header reflects the first item's color
- [ ] Category badge, shelf name (italic), and item/share count are visible
- [ ] Items are ranked 1–N with rank numbers; #1 is orange

### 3.2 Collaborative Attribution

- [ ] If the shelf has collaborators, the header shows "with @handle1, @handle2"
- [ ] If no collaborators, that text does not appear

### 3.3 Owner Controls

- [ ] Logged in as owner → pencil (edit) icon appears in the header overlay
- [ ] Logged in as a different account → no edit icon

### 3.4 Share Button

- [ ] Click "share" → URL is copied to clipboard
- [ ] Button text changes to "copied!" for ~1.8 s then reverts

---

## 4. Reactions

For this section, have **two accounts** open simultaneously.

- [ ] View a shelf while logged in as Account A → four reaction buttons appear below each item: 🔥 💀 👀 ✅
- [ ] Click 🔥 on an item → button highlights orange, count increments to 1 (optimistic)
- [ ] Reload the page → reaction persists (DB write was successful)
- [ ] Click 🔥 again → button deactivates, count decrements (toggle off)
- [ ] Reload → reaction is gone
- [ ] Log in as Account B in incognito → view the same shelf → react to same item with 💀
- [ ] Switch back to Account A's tab → reload → both 🔥 and 💀 counts show (if A had reacted)
- [ ] Non-logged-in visitor (sign out) → reaction buttons are visible but clicking does nothing

---

## 5. Edit Shelf

### 5.1 Owner Editing

- [ ] On a shelf you own, click the pencil icon → `/dashboard/edit_shelf/[slug]` loads
- [ ] Change the shelf name → "save changes" persists it, redirects to shelf view
- [ ] Use the search icon on any item slot to pick a different item via modal
- [ ] Edit item name / subtitle directly in the text input
- [ ] Save → updated items appear in the shelf view in correct rank order

### 5.2 Delete

- [ ] Click "delete" once → button changes to red "sure?"
- [ ] Click "sure?" → shelf is deleted, redirects to `/dashboard`
- [ ] Verify the shelf and its items are gone from the DB

### 5.3 Collaborative Settings (owner only)

- [ ] Toggle "allow collaborators" → switch turns orange
- [ ] Save → `isCollaborative` is true in DB
- [ ] Add a collaborator by handle → "invited!" appears, collaborator list updates
- [ ] Try an invalid handle (e.g. `@nobody`) → error message appears
- [ ] Try your own handle → error "Cannot invite yourself"
- [ ] Remove a collaborator → they disappear from the list after refresh

### 5.4 Collaborator Access

- [ ] Log in as the collaborator account → navigate to the collaborative shelf's URL
- [ ] `/dashboard/edit_shelf/[slug]` loads (not a 404)
- [ ] Name field is hidden (collaborators cannot rename)
- [ ] Delete button is hidden (collaborators cannot delete)
- [ ] Collaborative settings section is hidden
- [ ] Items can be edited and saved successfully
- [ ] As owner: verify updates by the collaborator appear on the shelf view

### 5.5 Unauthorized Access

- [ ] Log in as a third account that is neither owner nor collaborator
- [ ] Navigate directly to `/dashboard/edit_shelf/[slug]` → 404 page

---

## 6. Reorder Shelves

- [ ] Profile feed shows a list icon (⟺) in the header when you have more than 1 shelf
- [ ] Click it → `/dashboard/reorder` loads with your shelves as draggable cards
- [ ] Drag shelf cards to reorder
- [ ] Click "save order" → new order persists after navigating back to the profile

---

## 7. Search / Discover

- [ ] Click "Search" in nav → search page loads with trending shelves
- [ ] Type a query → results filter in real-time (debounced ~300 ms)
- [ ] Click a category tab → results filter by that category
- [ ] Click "All" tab → all public shelves shown
- [ ] No match → "no shelves found" empty state appears
- [ ] Private shelves do not appear in results
- [ ] Click a shelf card → navigates to `/dashboard/view_shelf/[slug]`

---

## 8. Friends

### 8.1 Adding a Friend

- [ ] Go to `/dashboard/manage_friends` → "no friends yet" empty state
- [ ] In the handle input, type the handle of Account B (with or without `@`)
- [ ] Click "add" → "sent!" feedback appears
- [ ] Switch to Account B → go to manage_friends → a pending request should appear (if implemented)
- [ ] If `respondToRequest` is wired to a UI, accept the request; otherwise accept via DB directly
- [ ] Back to Account A → friend appears in the list with username, handle, and mini shelf collage
- [ ] If both accounts have overlapping items, "X% taste match" badge appears

### 8.2 Compatibility Score

- [ ] Create shelves with shared item names on both accounts (exact lowercase match required)
- [ ] Verify the compatibility % reflects the overlap correctly

### 8.3 Edge Cases

- [ ] Adding yourself → error "Cannot add yourself"
- [ ] Adding a non-existent handle → "not found" feedback
- [ ] Adding the same person twice → no duplicate (onConflictDoNothing)

---

## 9. Activity Feed

- [ ] Go to `/dashboard/activity` (sidebar link on desktop)
- [ ] If Account B (a friend) has created shelves, they appear here
- [ ] Each entry shows: friend's avatar, "username added shelf name", category, time ago, mini collage
- [ ] Clicking an entry navigates to that shelf
- [ ] No friends yet → "no activity yet" empty state with a "find friends" link
- [ ] Private shelves from friends do NOT appear in the feed

---

## 10. Wrapped

- [ ] Go to `/dashboard/wrapped` (sidebar link on desktop)
- [ ] Two stat cards show total shelves and total items curated
- [ ] "Your main vibe" shows the most-frequent category badge
- [ ] "Most shared" shows the shelf with the highest shareCount (only if > 0)
- [ ] "Your #1 picks" lists the rank-1 item from your top shelves (up to 5)
- [ ] "Breakdown" shows a per-category shelf count, sorted by count descending
- [ ] "View my profile" link navigates to `/dashboard`
- [ ] New account with no shelves → "nothing to wrap yet" empty state with create CTA

---

## 11. Public Profile

- [ ] Visit `/u/[your-handle]` while **signed out** → public profile loads (no auth required)
- [ ] Shows username, handle, and a grid of public shelves
- [ ] Private shelves do not appear
- [ ] Clicking a shelf card → navigates to `/dashboard/view_shelf/[slug]`
- [ ] Footer shows a sign-up CTA
- [ ] Invalid handle (`/u/doesnotexist`) → 404

---

## 12. Settings

- [ ] Go to `/dashboard/settings`
- [ ] Toggle "public profile" off → `isPublic` updates in DB
- [ ] Toggle "share by link" off → `shareByLink` updates in DB
- [ ] Toggle "show shelf counts" → `showShelfCounts` updates in DB
- [ ] Reload page → toggle states persist (loaded from DB, not localStorage)

---

## 13. OG Share Cards

- [ ] Share a shelf URL (e.g. on Slack or a Telegram link preview)
- [ ] The preview shows a branded 1200×628 image with:
  - Logo bars + "crtv_shelves" text
  - Category pill
  - Shelf name (italic)
  - Up to 5 ranked items with gradient thumbnails
- [ ] Can also be tested locally at:
  `http://localhost:3000/dashboard/view_shelf/[slug]/opengraph-image`

---

## 14. Mobile Responsiveness

Test on a real device or using Chrome DevTools mobile emulation (375 px width):

- [ ] Bottom nav is visible and all 5 tabs are tappable
- [ ] FAB (orange +) triggers create shelf flow
- [ ] Profile feed scrolls vertically; shelf cards fit within screen width
- [ ] Shelf view: gradient header, ranked list, and reaction row are readable
- [ ] Edit shelf: all inputs are accessible; keyboard does not cover content
- [ ] Item search modal slides up from bottom, is dismissible by tapping outside
- [ ] Drag-to-reorder handles are large enough to tap comfortably

---

## 15. Error States and Edge Cases

- [ ] Navigate to a shelf slug that doesn't exist → `notFound()` → 404 page
- [ ] Navigate to `/dashboard/edit_shelf/fake-slug` → 404 page
- [ ] DB is unreachable (simulate by using a bad POSTGRES_URL) → meaningful error, not a crash
- [ ] Clerk session expires mid-session → redirected to `/login` on next server action call
- [ ] Rapid-clicking a reaction button → optimistic state is consistent (no double-increment)
- [ ] Create shelf with a name that would produce a duplicate slug → slug suffix ensures uniqueness

---

## 16. Performance Smoke Test

- [ ] Profile feed with 10+ shelves loads in under 2 seconds (cold start)
- [ ] Search with an empty query returns trending results quickly
- [ ] Shelf view with reactions loads without noticeable lag
- [ ] No visible layout shift (CLS) on any main page

---

## Sign-Off Checklist

Before marking a release as ready:

- [ ] All sections above completed with no ❌ items
- [ ] `pnpm check` (lint + typecheck) passes with no errors
- [ ] `pnpm test` — all 46 unit/integration tests pass
- [ ] `pnpm build` completes successfully with no build errors
- [ ] Vercel preview deployment is live and environment variables are set
- [ ] `pnpm db:push` has been run against the production DB (or migrations applied)
