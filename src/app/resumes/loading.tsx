export default function ResumesLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 rounded-xl shimmer" />
        <div className="h-9 w-32 rounded-xl shimmer" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 flex items-center gap-4">
          <div className="h-12 w-10 rounded-lg shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded shimmer" />
            <div className="h-3 w-24 rounded shimmer" />
          </div>
          <div className="h-8 w-8 rounded-lg shimmer" />
        </div>
      ))}
    </div>
  );
}
