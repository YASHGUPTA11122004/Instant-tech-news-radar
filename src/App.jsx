import { useState, useEffect, useCallback, useRef } from "react";
import NewsCard from "./components/NewsCard";
import SkeletonCard from "./components/SkeletonCard";
import SystemHealth from "./components/SystemHealth";
import TabBar from "./components/TabBar";

// ── Constants ────────────────────────────────────────────────────────────────
const API_ENDPOINT = "/api/news";
const POLL_INTERVAL_MS = 90_000;

// ── Custom Hook: useEdgeNews ─────────────────────────────────────────────────
// All async logic separated from render tree — clean, testable, composable.
function useEdgeNews(feed) {
  const [stories, setStories]       = useState([]);
  const [meta, setMeta]             = useState(null);
  const [status, setStatus]         = useState("idle");
  const [error, setError]           = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef                 = useRef(null);

  const fetchNews = useCallback(async (isBackground = false) => {
    if (!isBackground) setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`${API_ENDPOINT}?feed=${feed}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { stories: fetched, meta: fetchedMeta } = await res.json();

      setStories(fetched);
      setMeta(fetchedMeta);
      setLastUpdated(new Date());
      setStatus("success");
    } catch (err) {
      console.error("[Radar]", err);
      setError(err.message);
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  }, [feed]);

  // Fetch on feed change + setup polling
  useEffect(() => {
    fetchNews();
    intervalRef.current = setInterval(() => fetchNews(true), POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchNews]);

  return { stories, meta, status, error, lastUpdated, refetch: fetchNews };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("top");
  const [filter, setFilter]       = useState("");

  const { stories, meta, status, error, lastUpdated, refetch } =
    useEdgeNews(activeTab);

  // Reset filter when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilter("");
  };

  const filteredStories = stories.filter((s) =>
    filter
      ? s.title.toLowerCase().includes(filter.toLowerCase()) ||
        s.author.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-grid font-mono text-slate-100">

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4
                        flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="pulse-dot" />
            <div>
              <h1 className="text-lg font-bold tracking-widest uppercase">
                <span className="text-cyan-300">Instant</span>
                <span className="text-white"> Tech-News Radar</span>
              </h1>
              <p className="text-[10px] tracking-[0.25em] text-slate-500 uppercase">
                Cloudflare Edge · Real-Time · HackerNews
              </p>
            </div>
          </div>

          {/* System Health */}
          <SystemHealth
            meta={meta}
            lastUpdated={lastUpdated}
            onRefresh={refetch}
          />
        </div>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Search */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <input
            type="text"
            placeholder="Filter stories by title or author..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full glass-input text-sm text-slate-200
                       placeholder-slate-600 focus:outline-none
                       focus:ring-1 focus:ring-cyan-400/40"
          />
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Error */}
        {status === "error" && (
          <div className="glass-panel border border-red-400/30 text-red-300
                          px-5 py-4 mb-6 text-sm rounded-lg">
            <span className="font-bold text-red-400">⚠ Edge Error: </span>
            {error}
          </div>
        )}

        {/* Stats bar */}
        {status === "success" && (
          <div className="flex items-center gap-4 mb-6 text-xs
                          text-slate-500 tracking-widest uppercase">
            <span>
              <span className="text-cyan-400 font-bold">
                {filteredStories.length}
              </span>{" "}stories
            </span>
            {filter && (
              <span>
                filtered from{" "}
                <span className="text-cyan-400 font-bold">{stories.length}</span>
              </span>
            )}
          </div>
        )}

        {/* Story grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 10 }, (_, i) => (
                <SkeletonCard key={i} index={i} />
              ))
            : filteredStories.map((story, idx) => (
                <NewsCard key={story.id} story={story} index={idx} />
              ))}
        </div>

        {/* Empty state */}
        {status === "success" && filteredStories.length === 0 && (
          <div className="text-center py-20 text-slate-600 text-sm
                          tracking-widest uppercase">
            No stories match "{filter}"
          </div>
        )}

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6
                         border-t border-white/5 text-[11px] text-slate-600
                         tracking-widest flex justify-between">
        <span>Instant Tech-News Radar · Cloudflare Pages</span>
        <span className="hidden sm:block">
          Cache: s-maxage=60, stale-while-revalidate=30
        </span>
      </footer>

    </div>
  );
}
