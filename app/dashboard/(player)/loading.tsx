function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

export default function PlayerDashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 sm:p-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-4 h-7 w-40" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <Skeleton className="mt-6 h-10 w-44 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-6 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
        <div className="space-y-0 divide-y divide-slate-800">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="px-6 py-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
