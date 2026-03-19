# Instant Tech-News Radar

A real-time tech news aggregator built on Cloudflare's global edge network.
Instead of running on a single server, this app runs in 300+ datacenters
worldwide — serving every user from the closest possible location.

**Live:** https://itnr.pages.dev

---

## What It Does

Fetches the top stories from HackerNews and displays them in a clean,
fast dashboard. Users can browse 5 different feeds, filter stories,
sort by score or time, bookmark favorites, and see exactly which
Cloudflare datacenter is serving them.

---

## Why Edge Computing

Traditional web apps run on a single server in one location:

```
User in Mumbai → Server in US → 300ms delay
User in London → Server in US → 150ms delay
User in Tokyo  → Server in US → 200ms delay
```

This app runs on Cloudflare's edge network:

```
User in Mumbai → Cloudflare BOM (Mumbai)   → 15ms
User in London → Cloudflare LHR (London)   → 10ms
User in Tokyo  → Cloudflare NRT (Tokyo)    → 12ms
```

The compute happens inside the same datacenter that handles the user's
connection. No extra round trips. No central bottleneck.

---

## Architecture

```
Browser
  │
  ▼
Cloudflare Edge PoP (nearest datacenter)
  │
  ├── Static Assets (React app) ──────── served from edge cache
  │
  └── /api/news (Edge Function)
        │
        ├── Fetch top 60 story IDs from HackerNews
        │
        ├── Promise.all (60 concurrent requests)
        │     Fetches all stories simultaneously
        │     instead of one by one
        │
        └── Response with Cache headers
              s-maxage=60 → CDN caches for 60 seconds
              stale-while-revalidate=30 → serve old data
              instantly while fetching fresh data
              in the background
```

---

## Caching Strategy

```
Request arrives at edge
        │
        ├── Cache fresh (< 60s)?  → Return instantly, 0ms
        │
        ├── Cache stale (60-90s)? → Return old data NOW
        │                           Fetch new data in background
        │                           User never waits
        │
        └── Cache expired (> 90s)? → Fetch fresh, cache, return
```

This is called "stale-while-revalidate" — users always get a fast
response, and the cache quietly updates itself in the background.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Fast builds, component model |
| Styling | Tailwind CSS | Utility-first, no runtime cost |
| Backend | Cloudflare Pages Functions | Runs at the edge, not a server |
| Runtime | V8 Isolates | Zero cold starts vs Lambda's 100ms+ |
| API | HackerNews Firebase API | Free, reliable, no auth needed |
| Deployment | Cloudflare Pages | Free tier, global CDN, auto-deploy |

---

## Features

**News Feeds**
- Top Stories — most upvoted right now
- New — latest submitted stories
- Best — all-time highest rated
- Ask HN — community questions
- Show HN — projects and demos

**Data Controls**
- Sort by score, time, or comment count
- Filter stories by title or author
- Load up to 60 stories per feed

**Performance Indicators**
- Edge RTT meter — shows actual response time in milliseconds
- System Health badge — shows which Cloudflare datacenter (PoP) is serving you
- Refresh countdown — shows when next background refresh happens
- Reading progress bar — tracks scroll position

**User Features**
- Bookmark stories — saved locally in browser
- Reading history — visited stories are visually dimmed
- Copy link button — one click to copy story URL
- Dark and light mode — persists across sessions

**Accessibility**
- Full keyboard navigation
- J / K — move between stories
- O — open current story
- C — open comments
- / — focus search bar
- ? button — shows shortcut reference

**Resilience**
- Offline banner — detects network loss and recovery
- Skeleton loading — shows content shape while fetching
- Error states — graceful fallback on API failure

**Analytics View**
- Stats dashboard — average score, top domain, most discussed
- Trending graph — top 5 stories visualized as score bars

---

## How Concurrent Fetching Works

```javascript
// Sequential — slow, blocks on each request
for (const id of ids) {
  const item = await fetch(id);  // waits for each one
}
// 60 items × 80ms = 4,800ms total

// Concurrent — all requests fire simultaneously
const items = await Promise.allSettled(
  ids.map(id => fetch(id))
);
// 60 items, bottleneck = slowest single request ~120ms
```

The edge function fires all 60 HackerNews item requests at the same
time. Total time equals the slowest single response, not the sum of all.

---

## Project Structure

```
instant-tech-news-radar/
│
├── functions/
│   └── api/
│       └── news.js              Edge function — fetches and caches HN data
│
├── src/
│   ├── components/
│   │   ├── NewsCard.jsx         Story card with badges, favicon, bookmark
│   │   ├── SkeletonCard.jsx     Shimmer placeholder during loading
│   │   ├── SystemHealth.jsx     Live Cloudflare edge metadata badge
│   │   ├── TabBar.jsx           Feed category navigation
│   │   ├── StatsDashboard.jsx   Avg score, top domain, most discussed
│   │   ├── TrendingGraph.jsx    Top 5 stories score bar chart
│   │   ├── ThemeToggle.jsx      Dark and light mode switch
│   │   ├── ProgressBar.jsx      Scroll progress indicator
│   │   ├── OfflineBanner.jsx    Network status detection
│   │   ├── RefreshCountdown.jsx Live countdown to next background refresh
│   │   └── SortDropdown.jsx     Custom themed sort selector
│   │
│   ├── hooks/
│   │   ├── useKeyboard.js       J/K/O/C/slash keyboard shortcuts
│   │   └── useBookmarks.js      localStorage bookmark management
│   │
│   ├── App.jsx                  Root component and state management
│   ├── main.jsx                 React entry point
│   └── index.css                Design system, glassmorphism, animations
│
├── index.html
├── package.json
├── tailwind.config.js           Cyber Monochrome color palette
├── vite.config.js               Build config and dev proxy
└── wrangler.toml                Cloudflare Pages configuration
```

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/YASHGUPTA11122004/Instant-tech-news-radar.git
cd Instant-tech-news-radar

# Install dependencies
npm install

# Build the frontend
npm run build

# Run with Cloudflare's local edge simulator
npx wrangler pages dev dist --compatibility-date=2024-09-23
```

Open http://localhost:8788

---

## Deployment

```bash
# Build and deploy to Cloudflare Pages
npm run deploy
```

Or connect the GitHub repository to Cloudflare Pages for automatic
deployment on every push to main.

Build settings:
- Framework preset: Vite
- Build command: npm run build
- Output directory: dist

---

## Free Tier Usage

| Resource | Cloudflare Free Limit | This Project |
|----------|----------------------|--------------|
| Requests | 100,000 per day | ~1 per page load |
| Functions CPU | 10ms per invocation | ~5ms actual |
| Build minutes | 500 per month | ~30s per build |
| Bandwidth | Unlimited | Unlimited |

Total monthly cost: $0

---

## Key Concepts Demonstrated

- Edge computing vs traditional server hosting
- Concurrent async fetching with Promise.allSettled
- HTTP cache headers for CDN optimization
- Stale-while-revalidate pattern for perceived performance
- Cloudflare Pages Functions as serverless edge compute
- React custom hooks for separation of concerns
- localStorage for client-side persistence
- Progressive enhancement with offline support

---

Built by Yash Gupta
