import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light-mode");
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      className="glass-panel w-9 h-9 rounded-lg border border-white/10
                 hover:border-cyan-400/30 flex items-center justify-center
                 text-slate-400 hover:text-cyan-400 transition-all duration-200"
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
             stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="7" cy="7" r="3" />
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
             stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12 7.5A5.5 5.5 0 0 1 6.5 2a5.5 5.5 0 1 0 5.5 5.5z" />
        </svg>
      )}
    </button>
  );
}
