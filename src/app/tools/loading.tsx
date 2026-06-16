export default function ToolsLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-7 w-24 rounded-xl shimmer" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 h-28 shimmer" />
        ))}
      </div>
      <div className="card p-4 h-20 shimmer" />
    </div>
  );
}
