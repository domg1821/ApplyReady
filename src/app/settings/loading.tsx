export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-2xl mx-auto">
      {/* Profile section */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-14 w-14 rounded-2xl shimmer flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-lg shimmer" />
          <div className="h-3 w-48 rounded shimmer" />
        </div>
      </div>
      {/* Sections */}
      {[1, 2, 3].map((s) => (
        <div key={s} className="space-y-2">
          <div className="h-3 w-20 rounded shimmer" />
          <div className="card divide-y divide-[rgb(var(--border))]">
            {[1, 2, 3].map((r) => (
              <div key={r} className="flex items-center justify-between px-4 py-3.5">
                <div className="h-4 w-32 rounded shimmer" />
                <div className="h-4 w-4 rounded shimmer" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
