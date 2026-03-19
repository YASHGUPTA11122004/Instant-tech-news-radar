import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { value: "score",    label: "Score" },
  { value: "time",     label: "Time" },
  { value: "comments", label: "Comments" },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={"glass-input text-sm px-4 py-2 flex items-center gap-2 min-w-[120px] justify-between transition-colors duration-200 " + (
          open ? "text-cyan-400 border-cyan-400/40" : "text-slate-300 hover:text-cyan-400"
        )}
      >
        <span>↑ {selected.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className={"transition-transform duration-200 " + (open ? "rotate-180" : "")}
        >
          <path d="M2 3.5L5 6.5L8 3.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-full z-50
                        glass-panel rounded-lg border border-white/10
                        overflow-hidden shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={"w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 " + (
                opt.value === value
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
              )}
            >
              ↑ {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
