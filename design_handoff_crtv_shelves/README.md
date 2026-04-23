# Handoff: crtv_shelves — Mobile App

## Overview
**crtv_shelves** is a social ranking app where users build "shelves" of their favourite music, film, TV and more — ranked top-to-bottom — then share them via a public link. Others discover them through friends' profiles. Think "letterboxd for everything, shared by link."

---

## About the Design Files
The files bundled in this package are **high-fidelity HTML prototypes** — design references showing the intended look, typography, spacing, interactions and navigation flow. They are **not** production code to be copied directly.

The task is to **recreate these designs in your target codebase** using its established patterns, component libraries, navigation primitives and state management conventions. If no target environment exists yet, **React Native** (Expo) is recommended for the mobile design; **Next.js + Tailwind** for the web design.

---

## Fidelity
**High-fidelity.** All colours, type scales, spacing, border radii, shadow treatments, and micro-interactions are final. Recreate the UI pixel-precisely using your codebase's existing libraries and design system. Do not invent new patterns — match what you see.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#131313` | App background |
| `surface` | `#1C1B1B` | Cards, inputs |
| `surface-2` | `#242323` | Secondary surfaces, buttons |
| `border` | `#2E2D2D` | Dividers, borders |
| `text` | `#F0EEEC` | Primary text |
| `muted` | `#7A7775` | Secondary text, placeholders |
| `accent` | `#FF5F00` | Sonic Orange — primary CTA, active states, #1 rank |
| `gold` | `#FFBD00` | Secondary — rank badges, category labels |
| `violet` | `#6236FF` | Tertiary — available for future use |

### Typography
All text uses **Inter** (Google Fonts). Load all weights 400–900, including italic variants.

| Role | Size | Weight | Style | Letter Spacing |
|---|---|---|---|---|
| Brand name | 14px | 900 | italic | -0.5px |
| Screen title | 15px | 700 | — | -0.3px |
| Profile heading | 18px | 800 | — | -0.5px |
| Shelf name (hero) | 28px | 900 | italic | -1px |
| Shelf name (card) | 12px | 700 | italic | -0.3px |
| Shelf name (list) | 14px | 700 | italic | -0.3px |
| Item name | 14px | 700 | — | -0.3px |
| Item subtitle | 11px | 500 | — | 0 |
| Rank number | 13px | 900 | — | -0.5px |
| Category badge | 9px | 700 | — | +0.5px, uppercase |
| Body / meta | 12–13px | 500 | — | -0.2px |

### Spacing & Radii
| Token | Value |
|---|---|
| Screen horizontal padding | 16px |
| Card border radius | 16px |
| Input border radius | 14–16px |
| Button border radius | 18–20px |
| Thumb border radius | 8px |
| Badge border radius | 6–8px |
| Bottom nav height | 72px |
| Top bar height | 52px |

### Shadows / Blurs
- Bottom nav: `backdrop-filter: blur(20px)` with `rgba(19,19,19,0.95)` background
- Share button overlay: `backdrop-filter: blur(8px)`
- Accent CTA button: `box-shadow: 0 4px 20px rgba(255,95,0,0.4)`

---

## Screens / Views

### 1. Welcome
**Purpose:** First-launch landing. Entry point to sign up or sign in.

**Layout:** Full-screen. Vivid gradient background `linear-gradient(160deg, #FF5F00, #CC3A00 45%, #131313)`. Decorative grid of blurred shelf card thumbnails at 8% opacity in background. Content centered vertically with 32px horizontal padding.

**Components:**
- Logo mark: 4 vertical bars, heights [6, 10, 14, 18]px, width 8px, radius 2px, color `#FF5F00`, gap 3px
- Brand name: `crtv_shelves`, 34px, weight 900, italic, white, tracking -1.5px
- Tagline: `rank what you love.` — 15px, weight 500, `rgba(255,255,255,0.7)`
- Description: 13px, weight 400, `rgba(255,255,255,0.45)`, max-width 240px, centered, line-height 1.6
- Primary CTA: `get started` — full width (max 280px), 16px padding vertical, radius 20px, white background, `#131313` text, weight 800
- Secondary CTA: `sign in` — same width, transparent bg, `rgba(255,255,255,0.3)` border 1.5px
- Footer: `SOCIAL · BY · LINK` — 11px, weight 500, `rgba(255,255,255,0.3)`, tracking +0.3px

**Interactions:**
- Both CTAs navigate to Profile Feed
- Fade + slide-up entrance animation on mount (opacity 0→1, translateY 16→0, 600ms cubic-bezier(0.22,1,0.36,1), 80ms delay)

---

### 2. Profile Feed
**Purpose:** The user's own profile showing all their shelves in a grid.

**Layout:** Fixed top header (52px), scrollable shelf grid below, bottom nav (72px).

**Header:**
- Avatar: 40×40px, radius 14px, `linear-gradient(135deg, #FF5F00, #CC3A00)`, initials "jd" weight 900 16px white
- Username: `jd.taste`, 16px weight 800, tracking -0.5px
- Meta: `4 shelves · 142 views`, 11px weight 500, muted
- Reorder button: top-right, `surface-2` bg, border `border`, radius 10px, padding 6×12px, 11px weight 600

**Shelf Grid:**
- 2-column grid (default), gap 12px, 16px screen padding
- Each shelf card: 156×~190px, radius 16px, `surface` bg, `border` border
  - 2×2 image collage (4 items), 2px gaps, 2px outer padding, each tile radius 6px
  - Footer: 8px top, 10px horizontal, 10px bottom
  - Shelf name: italic, 12px weight 700
  - Category badge: `rgba(255,95,0,0.15)` bg, accent text, 9px weight 700, uppercase, +0.5px tracking
- "New shelf" card: dashed border, centered plus icon + label, opacity 0.5 (hover 0.8)
- Scale to 0.97 on hover/press

**Interactions:**
- Tapping a shelf card → Shelf View (passing shelf data)
- Tapping "reorder" → Reorder screen
- Tapping "new shelf" or FAB → Create flow

---

### 3. Shelf View
**Purpose:** Full ranked list for a single shelf.

**Layout:** Scrollable. No separate top bar — back/share buttons float over gradient header.

**Gradient Header (dynamic):**
- Background: `linear-gradient(180deg, {items[0].c1} 0%, {items[0].c1}CC 40%, #131313 100%)` — color is derived from the #1 ranked item's primary color
- Height: ~200px total (gradient fades into page bg)
- Back button: top-left, 36×36px, radius 10px, `rgba(0,0,0,0.3)` bg, backdrop-blur 8px
- Share button: top-right, similar treatment, `share` label + share icon. On tap → copies link, transitions to `rgba(255,95,0,0.3)` bg, accent border, shows "copied!"
- Positioned at `padding-top: 48px`

**Shelf Hero:**
- Category badge: accent style (`rgba(255,95,0,0.2)` bg + border)
- Shelf name: 28px weight 900 italic, tracking -1px
- Meta: `jd.taste · {n} views`, 12px muted

**Ranked List:**
Each item row (border-bottom `border`):
- Giant ghost rank: absolute positioned, 80px weight 900, `rgba(255,255,255,0.04)`, behind content
- Rank number: 13px weight 900, accent if #1, muted otherwise, 20px wide
- Item thumbnail: 52×52px, radius 8px. If image available, show it with `rgba(0,0,0,0.25)` tint overlay. Translucent rank number overlaid bottom-right: 40px weight 900, `rgba(255,255,255,0.18)`
- Item name: 14px weight 700, tracking -0.3px, ellipsis overflow
- Item sub: 11px weight 500, muted

---

### 4. Friends List
**Purpose:** Directory of followed users + quick access to their top shelf.

**Layout:** Top bar, search bar, scrollable list, bottom nav.

**Search bar:** `surface` bg, radius 12px, border `border`, search icon + placeholder text

**Friend Row:**
- Avatar: 44×44px, radius 15px, gradient from friend's color
- Username: 14px weight 700
- Shelf preview: `{shelf.name} · {n} views`, 11px weight 500, muted, shelf name italic
- Mini 2×2 collage: 44×44px, radius 10px — right side

**Interactions:** Tapping a row → opens that friend's Shelf View

---

### 5. Create Flow — Step 1: Category
**Purpose:** Pick what type of media the shelf is for.

**Layout:** Top bar with back, step dots (4 total), 2-col grid of category cards.

**Step Dots:** 4 dots. Active dot: 20px wide, accent color. Inactive: 6px wide, `border` color. Radius 3px, 6px gap. Animated width transition 0.3s.

**Category Cards:** 2-col grid, gap 10px. On select: gradient background (`c1`→`c2` of category). Unselected: `surface` bg, `border` border. Radius 16px, padding 16px.

**Type Selector:** Appears below grid after category selection. Pill buttons: selected = accent bg, unselected = `surface-2`. 8px padding vertical, 16px horizontal, radius 12px.

**CTA:** `continue →` — disabled (surface-2/muted) until type selected; active = accent bg.

---

### 6. Create Flow — Step 2: Name
**Purpose:** Name the shelf.

**Input:** Full-width, `surface` bg, radius 16px, padding 14×16px. Border transitions from `border` → accent when text is present. Font 18px weight 700 italic tracking -0.5px. Character counter (32 max) shown right-aligned when typing. Input converts to lowercase automatically.

**Suggestions:** Pill chips for pre-filled names. Selected chip: `rgba(0,204,136,0.12)` bg, accent border + text. Unselected: `surface-2`, muted text.

---

### 7. Create Flow — Step 3: Format (Size)
**Purpose:** Choose Podium (3), Focus (5), or Archive (8).

**Size Cards:** Full-width stacked. On select: `rgba(245,158,11,0.08)` bg, `#F59E0B` border (amber — distinct from main accent). Slot preview: a row of mini numbered tiles, amber-tinted when selected. Count number: 24px weight 900, amber when active.

> ⚠️ This screen specifically uses amber `#F59E0B` as the selection color — intentionally different from the main `#FF5F00` accent.

---

### 8. Create Flow — Step 4: Curation
**Purpose:** Fill each numbered slot with an item.

**Slot Rows:** Numbered 1–N. Empty slots: dashed `rgba(0,204,136,0.2)` border, plus icon. Filled slots: `surface` bg, `border` border, thumbnail + name + sub.

**Interactions:** Tapping a slot → navigates to Search screen (in "modal" mode). On item selection in Search → returns and fills that slot. Save button disabled until ≥1 slot filled.

---

### 9. Item Search
**Purpose:** Search and browse items to add to a shelf.

**Two modes:**
1. **Standalone** (from bottom nav) — full search with no slot context
2. **Modal** (from Create Curation) — shows an "+ add" button per result; tapping fills the slot and returns

**Filter tabs:** Artists / Albums / Films / Shows. Active = accent bg white text. Inactive = surface-2 muted.

**Result Row:** Thumbnail (48px) + name + sub. In modal mode: small add button (28×28px radius 8px, `rgba(255,95,0,0.15)` bg).

---

### 10. Reorder Shelves
**Purpose:** Drag-and-drop reorder of shelf display order.

**Row:** Grip icon (left) + 2×2 mini collage (44×44px) + shelf name italic + category + `#{n}` rank right. Drag state: opacity 0.4. Drop target: `rgba(255,95,0,0.08)` bg, accent border.

---

### 11. Settings
**Purpose:** Edit profile, manage sharing, account actions.

**Sections:** Profile / Sharing / Account — each a `surface` card with `border` dividers.

**Toggle Switch:** 44×26px pill, radius 13px. Active: accent bg, knob slides right. Inactive: `surface-2`, `border` border.

---

## Navigation Architecture

```
Welcome
  └→ Profile Feed (main hub)
       ├→ Shelf View
       ├→ Reorder
       └→ Create Step 1 (Category)
            └→ Create Step 2 (Name)
                 └→ Create Step 3 (Format)
                      └→ Create Step 4 (Curation)
                           └→ Search [modal]

Bottom Nav:
  Profile Feed | Friends List | [Create FAB] | Search | Settings
```

**Bottom Nav FAB:** 48×48px, radius 16px, `linear-gradient(135deg, #FF5F00, #FF8C00)`, `box-shadow: 0 4px 20px rgba(255,95,0,0.4)`.

---

## Interactions & Transitions

| Transition | Duration | Easing |
|---|---|---|
| Screen transition | 120ms | opacity fade |
| Welcome entrance | 600ms | cubic-bezier(0.22, 1, 0.36, 1) |
| Card hover/press | 150ms | ease |
| Step dot expand | 300ms | ease |
| Toggle slide | 200ms | ease |
| Category card select | 200ms | ease |
| Share "copied" feedback | 1800ms timeout then revert |

---

## Item Artwork
Each item has a `img` property pointing to `https://picsum.photos/seed/{seed}/200/200`. In production, replace with real artwork from a music/film/TV metadata API (e.g. Spotify API for music, TMDB for film/TV). The gradient fallback (`c1`/`c2` per item) should remain as a loading placeholder.

Rank number overlay on thumbnails: absolute positioned, `rgba(255,255,255,0.18)` color, bottom-right corner, partially clipped. Bottom: -2px, right: -2px, font-size ~75% of thumb size.

---

## Data Shape

```ts
type Item = {
  id: number
  name: string
  sub: string       // e.g. "Hip-Hop · Compton" or "Kendrick Lamar · 2012"
  c1: string        // gradient start (hex)
  c2: string        // gradient end (hex)
  init: string      // 2-letter fallback initials
  img: string       // artwork URL
}

type Shelf = {
  id: number
  name: string      // always lowercase, italic in UI
  category: string  // "Music" | "Film" | "TV" | "Books" | "Games"
  type: string      // "Artists" | "Albums" | "Films" | "Shows" | etc.
  items: Item[]     // ordered #1 first
  size: "podium" | "focus" | "archive"   // 3 | 5 | 8 slots
  shareCount: number
}
```

---

## Assets
- **Font:** Inter — https://fonts.google.com/specimen/Inter (weights 400–900 + italic)
- **Artwork images:** picsum.photos seeds (replace with real API in production)
- **Icons:** All custom inline SVG — no icon library required. See `crtv-components.jsx` for full set: Profile, Friends, Plus, Search, Settings, Share, Grip

---

## Files in This Package

| File | Description |
|---|---|
| `crtv_shelves.html` | Main mobile prototype (iPhone frame + desktop sidebar nav) |
| `crtv_shelves_web.html` | Web desktop prototype (browser chrome, 3-panel layout) |
| `crtv-data.js` | All mock data, design tokens, item/shelf/friend arrays |
| `crtv-components.jsx` | Shared UI components: ItemThumb, ShelfCard, BottomNav, TopBar, icons |
| `crtv-screens.jsx` | All 11 screen components |
| `ios-frame.jsx` | iOS device frame (starter component, not part of production build) |
| `browser-window.jsx` | Chrome browser frame (starter component, not part of production build) |

---

## Notes for Developers
- Shelf names are **always italic** wherever displayed — this is a brand-level choice, not a style accident
- The gradient header on Shelf View **derives its color dynamically** from `items[0].c1` — this should be computed at render time, not hardcoded per shelf
- The web design is a **separate surface** from mobile — it has its own 3-panel layout (left nav / profile grid / shelf detail) and is not a responsive version of the mobile UI
- `#F59E0B` amber is intentionally used **only** on the Create → Format screen selection state. All other selection/active states use `#FF5F00`
