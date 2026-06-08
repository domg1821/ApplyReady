export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-xl shimmer" />
          <div className="h-4 w-36 rounded-lg shimmer" />
        </div>
        <div className="h-9 w-20 rounded-xl shimmer" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="card p-3 text-center space-y-1.5">
            <div className="h-6 w-8 rounded-lg shimmer mx-auto" />
            <div className="h-3 w-12 rounded shimmer mx-auto" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 h-28 shimmer" />
        <div className="card p-4 h-28 shimmer" />
      </div>

      {/* Banner */}
      <div className="h-16 rounded-2xl shimmer" />

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 h-14 shimmer" />
        <div className="card p-3 h-14 shimmer" />
      </div>

      {/* Recent resumes */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded shimmer" />
        <div className="card p-4 h-16 shimmer" />
      </div>
    </div>
  );
}
