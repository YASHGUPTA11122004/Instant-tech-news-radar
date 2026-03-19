<div align="center">

# ⚡ Instant Tech-News Radar

### Real-time tech news · Served from the edge · Zero latency compromise

[![Live](https://img.shields.io/badge/LIVE-itnr.pages.dev-22d3ee?style=for-the-badge&logo=cloudflare&logoColor=white)](https://itnr.pages.dev)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🌍 What Is This?

A real-time tech news aggregator built on Cloudflare's global edge network.
Instead of running on a single server, this app runs in **300+ datacenters
worldwide** — serving every user from the closest possible location.

> **Live Demo →** https://itnr.pages.dev

---

## 🤔 Why Edge Computing?

Traditional web apps run on a single server in one location:
```
❌ Traditional Server (us-east-1)

User in Mumbai ──────────────────────── 300ms ──→ Server in US
User in London ──────────────── 150ms ──────────→ Server in US
User in Tokyo  ─────────────────────── 200ms ───→ Server in US
```

This app runs on Cloudflare's edge network:
```
✅ Cloudflare Edge (300+ PoPs)

User in Mumbai → CF PoP BOM (Mumbai)  → ⚡ 15ms
User in London → CF PoP LHR (London)  → ⚡ 10ms
User in Tokyo  → CF PoP NRT (Tokyo)   → ⚡ 12ms
```

> The compute happens **inside the same datacenter** that handles the
> user's connection. No extra round trips. No central bottleneck.

---

## 🏗️ Architecture
```
Browser
  │
  ▼
Cloudflare Edge PoP  (nearest datacenter to user)
  │
  ├── 📦 Static Assets (React app) ──── served from edge cache
  │
  └── ⚙️  /api/news  (Edge Function)
        │
        ├── 1. Fetch top 60 story IDs from HackerNews
        │
        ├── 2. Promise.allSettled() → 60 concurrent requests
        │        fires all at once instead of one by one
        │
        └── 3. Response with smart cache headers
                 s-maxage=60            → CDN caches 60s
                 stale-while-revalidate → serve instantly,
                                          refresh in background
```

---

## ⚡ Caching Strategy
```
Request arrives at Cloudflare edge
        │
        ├── 🟢 Cache fresh  (< 60s)  → Return instantly · 0ms origin cost
        │
        ├── 🟡 Cache stale  (60-90s) → Return old data NOW
        │                               Fetch new data in background
        │                               User never waits ← this is the magic
        │
        └── 🔴 Cache miss   (> 90s)  → Fetch fresh · cache · return
```

> This is the **stale-while-revalidate** pattern — users always get
> a fast response, the cache quietly updates itself in the background.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| 🎨 Frontend | React 18 + Vite 5 | Fast builds, component model |
| 💅 Styling | Tailwind CSS | Utility-first, zero runtime cost |
| ⚙️ Backend | Cloudflare Pages Functions | Runs at the edge, not a server |
| 🚀 Runtime | V8 Isolates | Zero cold starts vs Lambda's 100ms+ |
| 📰 Data | HackerNews Firebase API | Free, reliable, no auth needed |
| 🌐 Deploy | Cloudflare Pages | Free tier, global CDN, auto-deploy |

---

## ✨ Features

### 📰 News Feeds
| Feed | Description |
|------|-------------|
| 🔥 Top Stories | Most upvoted right now |
| 🆕 New | Latest submitted stories |
| 🏆 Best | All-time highest rated |
| ❓ Ask HN | Community questions |
| 🛠️ Show HN | Projects and demos |

### 📊 Data Controls
- 🔃 Sort by **score**, **time**, or **comment count**
- 🔍 Filter stories by **title** or **author**
- 📄 Load up to **60 stories** per feed

### ⚡ Performance Indicators
- 🕐 **Edge RTT meter** — actual response time in milliseconds
- 🌍 **System Health badge** — which Cloudflare PoP is serving you
- ⏱️ **Refresh countdown** — time until next background refresh
- 📜 **Reading progress bar** — scroll position tracker

### 👤 User Features
- ⭐ **Bookmarks** — saved locally in browser
- 👁️ **Reading history** — visited stories are dimmed
- 📋 **Copy link** — one click to copy story URL
- 🌙 **Dark / Light mode** — persists across sessions

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `J` | Next story |
| `K` | Previous story |
| `O` | Open current story |
| `C` | Open comments |
| `/` | Focus search |
| `?` | Show shortcuts |

### 🔁 Resilience
- 📡 **Offline banner** — detects network loss and recovery
- 💀 **Skeleton loading** — content shape shown while fetching
- ⚠️ **Error states** — graceful fallback on API failure

### 📈 Analytics View
- 📊 **Stats dashboard** — avg score, top domain, most discussed
- 📉 **Trending graph** — top 5 stories as score bars

---

## 🔀 How Concurrent Fetching Works
```javascript
// ❌ Sequential — slow, blocks on each request
for (const id of ids) {
  const item = await fetch(id);   // waits for each one
}
// 60 items × 80ms = 4,800ms total 😬

// ✅ Concurrent — all requests fire simultaneously
const items = await Promise.allSettled(
  ids.map(id => fetch(id))
);
// 60 items, bottleneck = slowest single ~120ms 🚀
```

---

## 📁 Project Structure
```
instant-tech-news-radar/
│
├── 📂 functions/
│   └── 📂 api/
│       └── 📄 news.js              ← Edge function (fetch + cache)
│
├── 📂 src/
│   ├── 📂 components/
│   │   ├── 📄 NewsCard.jsx         ← Story card with badges + favicon
│   │   ├── 📄 SkeletonCard.jsx     ← Shimmer placeholder
│   │   ├── 📄 SystemHealth.jsx     ← Live Cloudflare edge badge
│   │   ├── 📄 TabBar.jsx           ← Feed category tabs
│   │   ├── 📄 StatsDashboard.jsx   ← Avg score, top domain stats
│   │   ├── 📄 TrendingGraph.jsx    ← Top 5 score bar chart
│   │   ├── 📄 ThemeToggle.jsx      ← Dark / light mode
│   │   ├── 📄 ProgressBar.jsx      ← Scroll progress
│   │   ├── 📄 OfflineBanner.jsx    ← Network status
│   │   ├── 📄 RefreshCountdown.jsx ← Background refresh timer
│   │   └── 📄 SortDropdown.jsx     ← Custom sort selector
│   │
│   ├── 📂 hooks/
│   │   ├── 📄 useKeyboard.js       ← Keyboard navigation
│   │   └── 📄 useBookmarks.js      ← localStorage bookmarks
│   │
│   ├── 📄 App.jsx                  ← Root component + state
│   ├── 📄 main.jsx                 ← React entry point
│   └── 📄 index.css                ← Design system + animations
│
├── 📄 index.html
├── 📄 package.json
├── 📄 tailwind.config.js           ← Cyber Monochrome palette
├── 📄 vite.config.js               ← Build config + dev proxy
└── 📄 wrangler.toml                ← Cloudflare Pages config
```

---

## 🚀 Local Development
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

> Open **http://localhost:8788**

---

## 📦 Deployment
```bash
# Build and deploy to Cloudflare Pages
npm run deploy
```

Or connect the GitHub repo to Cloudflare Pages for **automatic deployment**
on every push to `main`.

**Build settings:**
```
Framework preset : Vite
Build command    : npm run build
Output directory : dist
```

---

## 💰 Cost Breakdown

| Resource | Cloudflare Free Limit | This Project |
|----------|----------------------|--------------|
| Requests | 100,000 / day | ~1 per page load |
| CPU time | 10ms / invocation | ~5ms actual |
| Builds | 500 min / month | ~30s per build |
| Bandwidth | Unlimited | Unlimited |
| **Total cost** | — | **$0 / month** |

---

## 🧠 Key Concepts Demonstrated
```
✅ Edge computing vs traditional server hosting
✅ Concurrent async fetching with Promise.allSettled
✅ HTTP cache headers for CDN optimization
✅ Stale-while-revalidate for perceived performance
✅ Cloudflare Pages Functions as serverless edge compute
✅ React custom hooks for separation of concerns
✅ localStorage for client-side persistence
✅ Progressive enhancement with offline support
✅ V8 Isolates — zero cold start serverless runtime
✅ request.cf metadata for edge-aware applications
```

---

<div align="center">

**Built with ⚡ by [Yash Gupta](https://github.com/YASHGUPTA11122004)**

*Final Year B.Tech · Computer Science · Edge Computing & Distributed Systems*

</div>
