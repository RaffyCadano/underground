function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-20" />
      <Skeleton className="mt-2 h-4 w-32" />
    </div>
  );
}

function ListCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-6">
      <Skeleton className="mb-4 h-6 w-44" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function PlayerDashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton />
        <ListCardSkeleton rows={4} />
      </div>
    </div>
  );
}
