import { useState, useEffect, useCallback, useRef } from "react";
import NewsCard from "./components/NewsCard";
import SkeletonCard from "./components/SkeletonCard";
import SystemHealth from "./components/SystemHealth";
import TabBar from "./components/TabBar";

const API_ENDPOINT = "/api/news";
const POLL_INTERVAL_MS = 90_000;
const PAGE_SIZE = 20;

function useEdgeNews(feed) {
  const [stories, setStories]         = useState([]);
  const [meta, setMeta]               = useState(null);
  const [status, setStatus]           = useState("idle");
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [latencyMs, setLatencyMs]     = useState(null);
  const intervalRef                   = useRef(null);

  const fetchNews = useCallback(async (isBackground = false) => {
    if (!isBackground) setStatus("loading");
    setError(null);

    const startTime = performance.now();

    try {
      const res = await fetch(`${API_ENDPOINT}?feed=${feed}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { stories: fetched, meta: fetchedMeta } = await res.json();

      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

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

  useEffect(() => {
    fetchNews();
    intervalRef.current = setInterval(() => fetchNews(true), POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchNews]);

  return { stories, meta, status, error, lastUpdated, latencyMs, refetch: fetchNews };
}

// Sort utility
function sortStories(stories, sortBy) {
  const sorted = [...stories];
  if (sortBy === "score")    return sorted.sort((a, b) => b.score - a.score);
  if (sortBy === "time")     return sorted.sort((a, b) => b.timestamp - a.timestamp);
  if (sortBy === "comments") return sorted.sort((a, b) => b.commentCount - a.commentCount);
  return sorted;
}

export default function App() {
  const [activeTab, setActiveTab]   = useState("top");
  const [filter, setFilter]         = useState("");
  const [sortBy, setSortBy]         = useState("score");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { stories, meta, status, error, lastUpdated, latencyMs, refetch } =
    useEdgeNews(activeTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilter("");
    setVisibleCount(PAGE_SIZE);
  };

  const filteredStories = sortStories(
    stories.filter((s) =>
      filter
        ? s.title.toLowerCase().includes(filter.toLowerCase()) ||
          s.author.toLowerCase().includes(filter.toLowerCase())
        : true
    ),
    sortBy
  );

  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;
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

          <div className="flex items-center gap-3">
            {/* Latency Meter */}
            {latencyMs !== null && (
              <div className="glass-panel rounded-lg px-3 py-2 text-center
                              ring-1 ring-white/10">
                <div className={`text-sm font-bold tabular-nums ${
                  latencyMs < 100 ? "text-emerald-400" :
                  latencyMs < 300 ? "text-amber-400" : "text-red-400"
                }`}>
                  {latencyMs}ms
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                  Edge RTT
                </div>
              </div>
            )}

            {/* System Health */}
            <SystemHealth
              meta={meta}
              lastUpdated={lastUpdated}
              onRefresh={refetch}
            />
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Search + Sort */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-3">
          <input
            type="text"
            placeholder="Filter stories by title or author..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 glass-input text-sm text-slate-200
                       placeholder-slate-600 focus:outline-none
                       focus:ring-1 focus:ring-cyan-400/40"
          />
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input text-sm text-slate-300 focus:outline-none
                       focus:ring-1 focus:ring-cyan-400/40 cursor-pointer"
          >
            <option value="score">↑ Score</option>
            <option value="time">↑ Time</option>
            <option value="comments">↑ Comments</option>
          </select>
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
            : visibleStories.map((story, idx) => (
                <NewsCard key={story.id} story={story} index={idx} />
              ))}
        </div>

        {/* Load More */}
        {!isLoading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="glass-panel px-8 py-3 text-sm text-slate-300
                         hover:text-cyan-300 border border-white/10
                         hover:border-cyan-400/30 rounded-lg
                         transition-all duration-200 tracking-widest uppercase"
            >
              Load {Math.min(PAGE_SIZE, filteredStories.length - visibleCount)} More
            </button>
          </div>
        )}

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
          Built by <span className="text-cyan-500">Yash Gupta</span>
        </span>
      </footer>

    </div>
  );
}
