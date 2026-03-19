import { useState, useEffect, useCallback, useRef } from "react";
import NewsCard from "./components/NewsCard";
import SkeletonCard from "./components/SkeletonCard";
import SystemHealth from "./components/SystemHealth";
import TabBar from "./components/TabBar";
import OfflineBanner from "./components/OfflineBanner";
import ThemeToggle from "./components/ThemeToggle";
import ProgressBar from "./components/ProgressBar";
import StatsDashboard from "./components/StatsDashboard";
import TrendingGraph from "./components/TrendingGraph";
import useKeyboard from "./hooks/useKeyboard";

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
      setLatencyMs(Math.round(performance.now() - startTime));
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

function sortStories(stories, sortBy) {
  const sorted = [...stories];
  if (sortBy === "score")    return sorted.sort((a, b) => b.score - a.score);
  if (sortBy === "time")     return sorted.sort((a, b) => b.timestamp - a.timestamp);
  if (sortBy === "comments") return sorted.sort((a, b) => b.commentCount - a.commentCount);
  return sorted;
}

export default function App() {
  const [activeTab, setActiveTab]       = useState("top");
  const [filter, setFilter]             = useState("");
  const [sortBy, setSortBy]             = useState("score");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [tabKey, setTabKey]             = useState(0);
  const [showStats, setShowStats]       = useState(false);
  const searchRef                       = useRef(null);

  const { stories, meta, status, error, lastUpdated, latencyMs, refetch } =
    useEdgeNews(activeTab);

  useKeyboard(stories, searchRef);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilter("");
    setVisibleCount(PAGE_SIZE);
    setTabKey((k) => k + 1);
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

      <ProgressBar />
      <OfflineBanner />

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
            {latencyMs !== null && (
              <div className="glass-panel rounded-lg px-3 py-2 text-center ring-1 ring-white/10">
                <div className={"text-sm font-bold tabular-nums " + (
                  latencyMs < 100 ? "text-emerald-400" :
                  latencyMs < 300 ? "text-amber-400" : "text-red-400"
                )}>
                  {latencyMs}ms
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                  Edge RTT
                </div>
              </div>
            )}
            <ThemeToggle />
            <SystemHealth meta={meta} lastUpdated={lastUpdated} onRefresh={refetch} />
          </div>
        </div>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-3">
          <input
            ref={searchRef}
            type="text"
            placeholder="Filter stories by title or author..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 glass-input text-sm text-slate-200
                       placeholder-slate-600 focus:outline-none
                       focus:ring-1 focus:ring-cyan-400/40"
          />
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
          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats((v) => !v)}
            className={"glass-input text-sm px-4 transition-colors duration-200 " + (
              showStats
                ? "text-cyan-400 border-cyan-400/40"
                : "text-slate-400 hover:text-cyan-400"
            )}
          >
            {showStats ? "Hide Stats" : "Stats"}
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {status === "error" && (
          <div className="glass-panel border border-red-400/30 text-red-300
                          px-5 py-4 mb-6 text-sm rounded-lg">
            <span className="font-bold text-red-400">⚠ Edge Error: </span>
            {error}
          </div>
        )}

        {/* Stats Dashboard */}
        {showStats && status === "success" && (
          <div className="tab-content-enter">
            <StatsDashboard stories={stories} />
            <TrendingGraph stories={stories} />
          </div>
        )}

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

        <div key={tabKey} className="tab-content-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading
              ? Array.from({ length: 10 }, (_, i) => (
                  <SkeletonCard key={i} index={i} />
                ))
              : visibleStories.map((story, idx) => (
                  <NewsCard key={story.id} story={story} index={idx} />
                ))}
          </div>
        </div>

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

        {status === "success" && filteredStories.length === 0 && (
          <div className="text-center py-20 text-slate-600 text-sm
                          tracking-widest uppercase">
            No stories match "{filter}"
          </div>
        )}

      </main>

      {/* ── Keyboard Shortcut Help ──────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button className="w-9 h-9 rounded-full glass-panel border border-white/20
                           text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40
                           transition-all duration-200 flex items-center justify-center
                           text-sm font-bold">
          ?
        </button>
        <div className="absolute bottom-12 right-0 w-56 glass-panel rounded-lg p-4
                        border border-white/10 opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 pointer-events-none">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">
            Keyboard Shortcuts
          </p>
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Navigate</span>
              <span className="text-cyan-400 font-bold">J / K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Open story</span>
              <span className="text-cyan-400 font-bold">O</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Comments</span>
              <span className="text-cyan-400 font-bold">C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Search</span>
              <span className="text-cyan-400 font-bold">/</span>
            </div>
          </div>
        </div>
      </div>

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
