export default function SkeletonCard({ index }) {
  const delay = `${index * 60}ms`;

  return (
    <div
      className="news-card overflow-hidden"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <div className="p-5 flex flex-col gap-3">

        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="shimmer h-3 w-5 rounded" />
            <div className="shimmer h-4 w-16 rounded-sm" />
          </div>
          <div className="shimmer h-3 w-24 rounded" />
        </div>

        {/* Title lines */}
        <div className="flex flex-col gap-2">
          <div className="shimmer h-3.5 w-full rounded" />
          <div className="shimmer h-3.5 w-[90%] rounded" />
          <div className="shimmer h-3.5 w-[60%] rounded" />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shimmer h-3 w-10 rounded" />
            <div className="shimmer h-3 w-20 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="shimmer h-3 w-8 rounded" />
            <div className="shimmer h-3 w-10 rounded" />
          </div>
        </div>

      </div>
    </div>
  );
}
