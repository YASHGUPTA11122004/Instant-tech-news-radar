export default function StatsDashboard({ stories }) {
  if (!stories || stories.length === 0) return null;

  const avgScore = Math.round(
    stories.reduce((sum, s) => sum + s.score, 0) / stories.length
  );

  const avgComments = Math.round(
    stories.reduce((sum, s) => sum + s.commentCount, 0) / stories.length
  );

  const topStory = stories.reduce((a, b) => (a.score > b.score ? a : b));

  const mostDiscussed = stories.reduce((a, b) =>
    a.commentCount > b.commentCount ? a : b
  );

  const domains = stories
    .map((s) => {
      try { return new URL(s.url).hostname.replace(/^www\./, ""); }
      catch { return "hn"; }
    });

  const domainCount = domains.reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const topDomain = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: "Avg Score",    value: avgScore.toLocaleString(),    color: "text-cyan-400" },
    { label: "Avg Comments", value: avgComments.toLocaleString(), color: "text-emerald-400" },
    { label: "Top Domain",   value: topDomain?.[0] ?? "—",        color: "text-amber-400" },
    { label: "Total Stories",value: stories.length.toString(),    color: "text-purple-400" },
  ];

  return (
    <div className="mb-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              {stat.label}
            </div>
            <div className={"text-lg font-bold tabular-nums truncate " + stat.color}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Top Story */}
      <div className="glass-panel rounded-xl p-4 mb-3 border border-amber-400/10">
        <div className="text-[10px] text-amber-400 uppercase tracking-widest mb-2 font-bold">
          🏆 Top Story
        </div>
        <p className="text-sm text-slate-200 line-clamp-1">{topStory.title}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
          <span className="text-amber-300 font-bold">{topStory.score.toLocaleString()} pts</span>
          <span>by {topStory.author}</span>
          <span>{topStory.commentCount} comments</span>
        </div>
      </div>

      {/* Most Discussed */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-400/10">
        <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-bold">
          💬 Most Discussed
        </div>
        <p className="text-sm text-slate-200 line-clamp-1">{mostDiscussed.title}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
          <span className="text-cyan-300 font-bold">{mostDiscussed.commentCount} comments</span>
          <span>by {mostDiscussed.author}</span>
          <span>{mostDiscussed.score.toLocaleString()} pts</span>
        </div>
      </div>
    </div>
  );
}
