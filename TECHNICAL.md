# TECHNICAL REFERENCE — Instant Tech-News Radar

This document is for AI assistants and developers who need to understand
the full implementation details of this project before making changes.

**GitHub:** https://github.com/YASHGUPTA11122004/Instant-tech-news-radar  
**Live:** https://itnr.pages.dev  
**Stack:** React 18 + Vite 5 + Tailwind CSS + Cloudflare Pages Functions

---

## CRITICAL RULES BEFORE MAKING ANY CHANGES

1. `NewsCard.jsx` — NEVER use `<a>` tags with `{dynamic}` content inside.
   GitHub web editor corrupts JSX tags when `{}` expressions are nested
   inside `<a>` tags. Use `<button onClick={() => openUrl(url)}>` or
   `<p onClick={() => openUrl(url)}>` instead. This has caused repeated
   build failures in the past.

2. All components use **Tailwind CSS utility classes only** — no inline
   style objects except for `animationDelay`.

3. Edge function (`functions/api/news.js`) uses **ES Module syntax**
   (`export async function onRequest`) — not CommonJS.

4. Do NOT use `localStorage` in edge functions — only in React components
   and hooks.

5. The project is deployed on **Cloudflare Pages** — not Vercel, not
   Netlify. Build output goes to `/dist`. Functions live in `/functions`.

---

## PROJECT STRUCTURE
```
instant-tech-news-radar/
│
├── functions/api/news.js       ← Cloudflare edge function (backend)
│
├── src/
│   ├── components/
│   │   ├── NewsCard.jsx
│   │   ├── SkeletonCard.jsx
│   │   ├── SystemHealth.jsx
│   │   ├── TabBar.jsx
│   │   ├── StatsDashboard.jsx
│   │   ├── TrendingGraph.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── OfflineBanner.jsx
│   │   ├── RefreshCountdown.jsx
│   │   └── SortDropdown.jsx
│   │
│   ├── hooks/
│   │   ├── useKeyboard.js
│   │   └── useBookmarks.js
│   │
│   ├── App.jsx                 ← Root component
│   ├── main.jsx                ← Entry point
│   └── index.css               ← Global styles + design system
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── wrangler.toml
├── postcss.config.js
└── .gitignore
```

---

## BACKEND — `functions/api/news.js`

**Type:** Cloudflare Pages Function (Edge Runtime)  
**Route:** `/api/news?feed=top|new|best|ask|show`  
**Method:** GET

### Constants
```js
const HN_API = "https://hacker-news.firebaseio.com/v0";
const FETCH_LIMIT = 60;
const FEED_MAP = {
  top:  "topstories",
  new:  "newstories",
  best: "beststories",
  ask:  "askstories",
  show: "showstories",
};
```

### Exported Function
```js
export async function onRequest({ request })
```

### Response Shape
```json
{
  "stories": [
    {
      "id": 12345,
      "title": "Story Title",
      "url": "https://example.com",
      "score": 342,
      "author": "username",
      "commentCount": 87,
      "timestamp": 1710000000000,
      "type": "story",
      "hnUrl": "https://news.ycombinator.com/item?id=12345"
    }
  ],
  "meta": {
    "colo": "BOM",
    "country": "IN",
    "city": "Mumbai",
    "region": "Maharashtra",
    "asOrganization": "Airtel",
    "tlsVersion": "TLSv1.3",
    "httpProtocol": "HTTP/3",
    "fetchedAt": 1710000000000,
    "count": 58,
    "feed": "top"
  }
}
```

### Cache Headers
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=30
```

### Flow
1. Parse `?feed=` query param (default: "top")
2. Fetch story IDs from HN Firebase API (5s timeout)
3. Slice to FETCH_LIMIT (60)
4. Promise.allSettled — fetch all 60 items concurrently (8s timeout)
5. Filter out failed/deleted items
6. Normalize and return JSON

---

## FRONTEND STATE — `src/App.jsx`

### Custom Hook: `useEdgeNews(feed)`
Lives inside `App.jsx` (not a separate file).

**Parameters:**
- `feed` — string: "top" | "new" | "best" | "ask" | "show"

**Returns:**
```js
{
  stories,      // array of story objects
  meta,         // edge metadata object or null
  status,       // "idle" | "loading" | "success" | "error"
  error,        // string or null
  lastUpdated,  // Date object or null
  latencyMs,    // number (ms) or null
  refetch,      // function () => void
}
```

**Behavior:**
- Fetches on mount and when `feed` changes
- Polls every 90,000ms (90 seconds)
- Measures RTT using `performance.now()`
- Uses `cache: "no-store"` to bypass browser cache

### App State Variables
```js
const [activeTab, setActiveTab]         // "top"|"new"|"best"|"ask"|"show"
const [filter, setFilter]               // search string
const [sortBy, setSortBy]               // "score"|"time"|"comments"
const [visibleCount, setVisibleCount]   // number, starts at 20, +20 on load more
const [tabKey, setTabKey]               // increments on tab change (triggers fade)
const [showStats, setShowStats]         // boolean — show/hide stats panel
const [showBookmarks, setShowBookmarks] // boolean — show bookmarks view
const [visited, setVisited]             // array of visited story IDs
const searchRef                         // ref attached to filter input
```

### Sort Function
```js
function sortStories(stories, sortBy)
// sortBy: "score" → sort by score desc
// sortBy: "time"  → sort by timestamp desc
// sortBy: "comments" → sort by commentCount desc
```

### Pagination
```js
const PAGE_SIZE = 20;
const visibleStories = filteredStories.slice(0, visibleCount);
const hasMore = visibleCount < filteredStories.length;
// "Load More" button increments visibleCount by PAGE_SIZE
```

---

## COMPONENTS

### `NewsCard.jsx`
**Props:**
```js
{
  story,        // story object from API
  index,        // number (0-based position)
  isBookmarked, // boolean
  onBookmark,   // function(story) => void
  isVisited,    // boolean
}
```

**Key behaviors:**
- Index 0 gets gold ring: `ring-1 ring-amber-400/30`
- Score >= 500 → TRENDING badge (amber)
- Score >= 200 → HOT badge (cyan)
- Score >= 50  → RISING badge (emerald)
- Visited stories get `opacity-60`
- Favicon loaded from Google's favicon service:
  `https://www.google.com/s2/favicons?domain=ORIGIN&sz=32`
- `openUrl(url)` uses `window.open(url, "_blank", "noopener,noreferrer")`
- Copy button uses `navigator.clipboard.writeText()`
- NEVER use `<a href={dynamic}>` — use `<button onClick={() => openUrl()}>` instead

### `SkeletonCard.jsx`
**Props:** `{ index }` — used for staggered animation delay  
**Purpose:** Shimmer placeholder shown during loading  
**CSS class used:** `.shimmer` (defined in index.css)

### `SystemHealth.jsx`
**Props:**
```js
{
  meta,         // edge metadata object or null
  lastUpdated,  // Date object or null
  onRefresh,    // function () => void
}
```
**Shows:** colo code, city, country, HTTP protocol, TLS version, last updated time

### `TabBar.jsx`
**Props:** `{ activeTab, onTabChange }`  
**Tabs:** Top Stories, New, Best, Ask HN, Show HN  
**Style:** Underline tabs — active tab has `h-px bg-cyan-400` bottom border

### `StatsDashboard.jsx`
**Props:** `{ stories }` — array of story objects  
**Shows:** avg score, avg comments, top domain, total count, top story, most discussed  
**Returns null** if stories is empty

### `TrendingGraph.jsx`
**Props:** `{ stories }`  
**Shows:** Top 5 stories by score as horizontal bar chart (pure CSS, no library)  
**Returns null** if stories is empty  
**IMPORTANT:** Does NOT use `<a>` tags — uses `<span>` for titles to avoid build errors

### `ThemeToggle.jsx`
**Props:** none  
**Storage:** `localStorage.getItem("theme")` — "dark" | "light"  
**DOM manipulation:** adds/removes `"light-mode"` class on `document.documentElement`  
**Icons:** Sun SVG for dark mode, Moon SVG for light mode

### `ProgressBar.jsx`
**Props:** none  
**Behavior:** Listens to `window.scroll` event (passive)  
**Calculates:** `scrollY / (scrollHeight - innerHeight) * 100`  
**Style:** Fixed top-0, h-0.5, cyan-to-emerald gradient

### `OfflineBanner.jsx`
**Props:** none  
**Listens to:** `window online` and `window offline` events  
**States:** offline (red banner), back online (green banner for 3s), hidden  
**Returns null** when online and no recent offline event

### `RefreshCountdown.jsx`
**Props:** `{ lastUpdated, onRefresh }`  
**Behavior:** Counts down from 90 to 0, resets when `lastUpdated` changes  
**Shows:** Circular SVG progress ring + seconds remaining  
**Interval:** 1 second tick

### `SortDropdown.jsx`
**Props:** `{ value, onChange }`  
**Options:** score | time | comments  
**Behavior:** Custom dropdown (NOT native `<select>`) — themed to match glassmorphism  
**Closes on:** outside click via `mousedown` event listener on document

---

## HOOKS

### `useKeyboard.js` — `src/hooks/useKeyboard.js`
**Parameters:** `(stories, searchRef)`  
**Shortcuts:**
```
J / j → currentIndex++ → scroll to card, add .keyboard-active class
K / k → currentIndex-- → scroll to card
O / o → window.open(stories[currentIndex].url)
C / c → window.open(stories[currentIndex].hnUrl)
/     → e.preventDefault(), searchRef.current.focus()
```
**Skips:** when `e.target.tagName === "INPUT"` or `"TEXTAREA"`  
**Effect:** Adds `keyboard-active` class for 800ms (CSS handles highlight)

### `useBookmarks.js` — `src/hooks/useBookmarks.js`
**Storage key:** `"itnr_bookmarks"` in localStorage  
**Returns:**
```js
{
  bookmarks,    // array of story objects
  toggle,       // function(story) — add if not exists, remove if exists
  isBookmarked, // function(id) → boolean
}
```
**Persistence:** useEffect syncs to localStorage on every change

---

## STYLES — `src/index.css`

### CSS Custom Properties
```css
--color-bg:           #060812     /* dark background */
--color-glass-bg:     rgba(12, 18, 38, 0.55)
--color-glass-border: rgba(255, 255, 255, 0.07)
--color-glass-hover:  rgba(16, 26, 52, 0.75)
--shimmer-base:       rgba(255, 255, 255, 0.04)
--shimmer-highlight:  rgba(255, 255, 255, 0.09)
```

### Key CSS Classes
```
.bg-grid        → dot grid background pattern
.glass-panel    → glassmorphism (backdrop-filter + bg + border)
.glass-input    → glass-panel variant for inputs
.news-card      → glass-panel + hover lift + cardIn animation
.shimmer        → animated gradient for skeleton loading
.pulse-dot      → cyan pulsing dot in header
.scrollbar-hide → hides scrollbar cross-browser
.tab-content-enter → fade+slide animation on tab change
.keyboard-active   → cyan ring highlight for keyboard navigation
.ambient-orb    → blurred gradient orb (orb-1, orb-2, orb-3)
```

### Light Mode
Triggered by `html.light-mode` class on `document.documentElement`.
Overrides CSS variables and slate color utilities.

---

## CONFIG FILES

### `tailwind.config.js`
**Custom colors:**
- `void` — dark background palette (void-950 = #060812)
- `neon` — cyan accent (neon-400 = #22d3ee)
- `signal` — amber for trending
- `matrix` — emerald for rising

**Custom fonts:**
- `mono` — JetBrains Mono (primary)
- `sans` — DM Sans (secondary)

### `vite.config.js`
**Dev proxy:** `/api` → `http://localhost:8788` (wrangler dev server)  
**Build output:** `dist/`  
**Manual chunks:** `react` and `react-dom` split into separate chunk

### `wrangler.toml`
```toml
name = "instant-tech-news-radar"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"
[vars]
ENVIRONMENT = "production"
APP_VERSION = "1.0.0"
```

---

## KNOWN ISSUES & GOTCHAS

### 1. JSX Tag Corruption (MOST IMPORTANT)
When editing files through GitHub's web editor, JSX `<a>` tags with
`{dynamic}` expressions inside get corrupted. This causes esbuild errors:
```
Unexpected closing "a" tag does not match opening "div" tag
```
**Fix:** Replace `<a>` tags with `<button onClick={() => openUrl()}>` 
or `<p onClick={() => openUrl()}>`. See NewsCard.jsx for reference.

### 2. Favicon Loading
Favicons use Google's favicon service. Some domains return broken images.
`onError={() => setFaviconErr(true)}` hides broken favicons.

### 3. Edge Metadata in Dev
`request.cf` is only populated on real Cloudflare edge.
In local dev (`wrangler pages dev`), all cf values default to
"DEV", "XX", "Local" etc.

### 4. HackerNews API Rate
No rate limit on HackerNews API but the function has hard timeouts:
- 5s for fetching story IDs
- 8s for fetching all 60 items concurrently

### 5. localStorage in SSR
Not applicable here (CSR only), but `useBookmarks` and visited history
both use try/catch around localStorage to prevent errors.

---

## HOW TO MAKE CHANGES SAFELY

### Adding a new component
1. Create file in `src/components/ComponentName.jsx`
2. Use only Tailwind classes + existing CSS variables
3. Do NOT use `<a href={dynamic}>` — use button + openUrl()
4. Import and use in `App.jsx`

### Modifying the edge function
1. Edit `functions/api/news.js`
2. Keep ES Module syntax (`export async function onRequest`)
3. Test locally: `npx wrangler pages dev dist`
4. Commit → Cloudflare auto-deploys

### Adding a new feed type
1. Add to `FEED_MAP` in `functions/api/news.js`
2. Add to `TABS` array in `src/components/TabBar.jsx`

### Changing fetch limit
```js
// functions/api/news.js
const FETCH_LIMIT = 60;  // change this number
```

### Changing poll interval
```js
// src/App.jsx
const POLL_INTERVAL_MS = 90_000;  // milliseconds
```

### Changing page size (stories per load)
```js
// src/App.jsx
const PAGE_SIZE = 20;  // stories shown initially and per "Load More"
```

---

## DEPLOYMENT CHECKLIST

- [ ] All files committed to `main` branch
- [ ] `functions/api/news.js` has correct ES Module export
- [ ] `wrangler.toml` has correct project name
- [ ] Cloudflare Pages build settings:
  - Framework: Vite
  - Build command: `npm run build`
  - Output: `dist`
- [ ] Check build logs for esbuild JSX errors

---

*Last updated: March 2026*  
*Maintained by: Yash Gupta*  
*GitHub: https://github.com/YASHGUPTA11122004/Instant-tech-news-radar*
