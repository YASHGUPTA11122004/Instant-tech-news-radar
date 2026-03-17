function formatTime(date) {
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SystemHealth({ meta, lastUpdated, onRefresh }) {
  const hasData = !!meta;

  return (
    <div className="flex items-center gap-3 glass-panel rounded-lg px-4 py-2
                    ring-1 ring-white/10 text-xs">

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          hasData ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                  : "bg-amber-400 animate-pulse"
        }`} />
        <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">
          {hasData ? "Edge Live" : "Connecting"}
        </span>
      </div>

      {/* Colo / Datacenter */}
      {hasData && (
        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
               className="text-cyan-500" stroke="currentColor" strokeWidth="1.2">
            <circle cx="5.5" cy="5.5" r="4.5" />
            <path d="M5.5 1v9M1 5.5h9" strokeLinecap="round" />
            <path d="M2 3Q3.5 1.5 5.5 1Q7.5 1.5 9 3M2 8Q3.5 9.5 5.5 10Q7.5 9.5 9 8"
                  strokeLinecap="round" />
          </svg>
          <div>
            <div className="text-cyan-300 font-bold tracking-widest text-[11px]">
              {meta.colo}
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">
              {meta.city}{meta.region ? `, ${meta.region}` : ""} · {meta.country}
            </div>
          </div>
        </div>
      )}

      {/* Protocol */}
      {hasData && (
        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
          <div>
            <div className="text-emerald-400 font-bold tracking-wider text-[11px]">
              {meta.httpProtocol}
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">
              {meta.tlsVersion}
            </div>
          </div>
        </div>
      )}

      {/* Last updated + Refresh */}
      <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3">
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">
            Updated
          </div>
          <div className="text-slate-300 tabular-nums text-[11px]">
            {formatTime(lastUpdated)}
          </div>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh"
          className="text-slate-500 hover:text-cyan-400 transition-colors
                     p-1 rounded hover:bg-white/5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
               stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M10 6A4 4 0 1 1 7 2.1" />
            <path d="M7 1v3h3" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

    </div>
  );
}
