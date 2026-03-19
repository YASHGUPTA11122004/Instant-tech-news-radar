export default function TrendingGraph({ stories }) {
  if (!stories || stories.length === 0) return null;

  const top5 = [...stories]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const maxScore = top5[0]?.score ?? 1;

  const colors = [
    "bg-amber-400",
    "bg-cyan-400",
    "bg-emerald-400",
    "bg-purple-400",
    "bg-rose-400",
  ];

  const textColors = [
    "text-amber-400",
    "text-cyan-400",
    "text-emerald-400",
    "text-purple-400",
    "text-rose-400",
  ];

  return (
    <div className="glass-panel rounded-xl p-5 mb-8">
      <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-5 font-bold">
        Top 5 by Score
      </div>

      <div className="flex flex-col gap-4">
        {top5.map((story, i) => {
          const pct = Math.round((story.score / maxScore) * 100);
          const title = story.title.length > 60
            ? story.title.slice(0, 60) + "..."
            : story.title;

          return (
            <div key={story.id}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <span className={"text-[11px] truncate " + textColors[i]}>
                  {title}
                </span>
                <span className={"text-[11px] font-bold tabular-nums shrink-0 " + textColors[i]}>
                  {story.score.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={"h-full rounded-full transition-all duration-700 " + colors[i]}
                  style={{ width: pct + "%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
