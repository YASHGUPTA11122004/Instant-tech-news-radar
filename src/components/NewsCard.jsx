const TIME_THRESHOLDS = [
  { limit: 60,       unit: "s", divisor: 1 },
  { limit: 3600,     unit: "m", divisor: 60 },
  { limit: 86400,    unit: "h", divisor: 3600 },
  { limit: 604800,   unit: "d", divisor: 86400 },
  { limit: Infinity, unit: "w", divisor: 604800 },
];

function timeAgo(timestampMs) {
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
  const { divisor, unit } =
    TIME_THRESHOLDS.find(({ limit }) => diffSec < limit) ?? TIME_THRESHOLDS.at(-1);
  return `${Math.floor(diffSec / divisor)}${unit} ago`;
}

function getScoreBadge(score) {
  if (score >= 500) return { label: "TRENDING", className: "bg-amber-400/20 text-amber-300 border-amber-400/30" };
  if (score >= 200) return { label: "HOT", className: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30" };
  if (score >= 50)  return { label: "RISING", className: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" };
  return null;
}

function getScoreColor(score) {
  if (score >= 500) return "text-amber-300";
  if (score >= 200) return "text-cyan-300";
  if (score >= 50)  return "text-emerald-300";
  return "text-slate-400";
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

export default function NewsCard({ story, index }) {
  const badge = getScoreBadge(story.score);
  const scoreColor = getScoreColor(story.score);
  const domain = extractDomain(story.url);
  const delay = `${Math.min(index * 40, 400)}ms`;

  return (
    <article
      className="news-card group relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/30" />

      <div className="relative z-10 p-5 flex flex-col gap-3">

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 tabular-nums w-5 text-right">
              {String(index + 1).padStart(2, "0")}
            </span>
            {badge && (
              <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
            {domain}
          </span>
        </div>

        {/* FIXED */}
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-100 leading-snug group-hover:text-cyan-200 transition-colors duration-200 line-clamp-3"
        >
          {story.title}
        </a>

        <div className="h-px bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className={`font-bold tabular-nums ${scoreColor}`}>
              {story.score.toLocaleString()} pts
            </span>
            <span>
              by{" "}
              {/* FIXED */}
              <a
                href={`https://news.ycombinator.com/user?id=${story.author}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {story.author}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* FIXED */}
            <a
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
