import { useState } from "react";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return Math.floor(s / 604800) + "w ago";
}

function badge(score) {
  if (score >= 500) return ["TRENDING", "bg-amber-400/20 text-amber-300 border-amber-400/30"];
  if (score >= 200) return ["HOT", "bg-cyan-400/20 text-cyan-300 border-cyan-400/30"];
  if (score >= 50)  return ["RISING", "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"];
  return null;
}

function scoreColor(score) {
  if (score >= 500) return "text-amber-300";
  if (score >= 200) return "text-cyan-300";
  if (score >= 50)  return "text-emerald-300";
  return "text-slate-400";
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return "news.ycombinator.com"; }
}

function getFaviconUrl(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return "https://www.google.com/s2/favicons?domain=" + protocol + "//" + hostname + "&sz=32";
  } catch {
    return null;
  }
}

export default function NewsCard({ story, index, isBookmarked, onBookmark, isVisited }) {
  const [copied, setCopied] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const b = badge(story.score);
  const delay = Math.min(index * 40, 400) + "ms";
  const domain = getDomain(story.url);
  const faviconUrl = getFaviconUrl(story.url);

  function copy(e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(story.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function bookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    onBookmark(story);
  }

  return (
    <article
      className={"news-card group relative overflow-hidden " + (isVisited ? "opacity-60" : "")}
      style={{ animationDelay: delay }}
    >
      {/* Top rank glow for #1 */}
      {index === 0 && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-amber-400/30 pointer-events-none" />
      )}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/30" />

      <div className="relative z-10 p-5 flex flex-col gap-3">

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 tabular-nums w-5 text-right">
              {String(index + 1).padStart(2, "0")}
            </span>
            {b && (
              <span className={"text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border " + b[1]}>
                {b[0]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Favicon */}
            {faviconUrl && !faviconError && (
              <img
                src={faviconUrl}
                alt=""
                width={12}
                height={12}
                className="rounded-sm opacity-60"
                onError={() => setFaviconError(true)}
              />
            )}
            <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
              {domain}
            </span>

            {/* Bookmark */}
            <button
              onClick={bookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              className={"transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100 " + (
                isBookmarked ? "text-amber-400" : "text-slate-600 hover:text-amber-400"
              )}
            >
              {isBookmarked ? "★" : "☆"}
            </button>

            {/* Copy */}
            <button
              onClick={copy}
              title="Copy link"
              className="text-slate-600 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded"
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        </div>

        
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className={"text-sm font-medium leading-snug transition-colors duration-200 line-clamp-3 " + (
            isVisited ? "text-slate-400" : "text-slate-100 group-hover:text-cyan-200"
          )}
        >
          {story.title}
        </a>

        <div className="h-px bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className={"font-bold tabular-nums " + scoreColor(story.score)}>
              {story.score.toLocaleString()} pts
            </span>
            <span>
              by 
                href={"https://news.ycombinator.com/user?id=" + story.author}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >{story.author}</a>
            </span>
          </div>
          <div className="flex items-center gap-3">
            
              href={story.hnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              {story.commentCount} comments
            </a>
            <span className="tabular-nums">{timeAgo(story.timestamp)}</span>
          </div>
        </div>

      </div>
    </article>
  );
}
