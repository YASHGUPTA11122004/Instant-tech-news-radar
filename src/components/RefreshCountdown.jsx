import { useState, useEffect } from "react";

const REFRESH_INTERVAL = 90;

export default function RefreshCountdown({ lastUpdated, onRefresh }) {
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL);

  useEffect(() => {
    setSecondsLeft(REFRESH_INTERVAL);
  }, [lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return REFRESH_INTERVAL;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pct = ((REFRESH_INTERVAL - secondsLeft) / REFRESH_INTERVAL) * 100;

  return (
    <div className="flex items-center gap-2 glass-panel rounded-lg px-3 py-2 ring-1 ring-white/10">
      <div className="relative w-6 h-6">
        <svg viewBox="0 0 24 24" className="w-6 h-6 -rotate-90">
          <circle cx="12" cy="12" r="10" fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <circle cx="12" cy="12" r="10" fill="none"
            stroke="#22d3ee" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
      </div>
      <div>
        <div className="text-[11px] font-bold tabular-nums text-cyan-400">
          {secondsLeft}s
        </div>
        <div className="text-[9px] text-slate-500 uppercase tracking-widest">
          Refresh
        </div>
      </div>
    </div>
  );
}
