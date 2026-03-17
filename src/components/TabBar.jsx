/**
 * TabBar — Underline tab navigation
 * Classic & professional style — GitHub/Linear/Vercel inspired
 */

const TABS = [
  { id: "top",  label: "Top Stories" },
  { id: "new",  label: "New" },
  { id: "best", label: "Best" },
  { id: "ask",  label: "Ask HN" },
  { id: "show", label: "Show HN" },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative px-5 py-3.5 text-sm whitespace-nowrap
                  transition-colors duration-200
                  ${isActive
                    ? "text-white font-medium"
                    : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                {tab.label}

                {/* Underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
