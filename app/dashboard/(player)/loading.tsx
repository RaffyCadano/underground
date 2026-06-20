function StatCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="h-3 w-28 animate-pulse rounded bg-slate-800" />
      <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-800" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-800" />
    </div>
  );
}

function ListCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-6">
      <div className="mb-4 h-6 w-44 animate-pulse rounded bg-slate-800" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl border border-slate-800 bg-slate-950"
          />
        ))}
      </div>
    </div>
  );
}

export default function PlayerDashboardLoading() {
  return (
    <section className="container" aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-8">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-800" />
        <div className="mt-3 h-10 w-40 animate-pulse rounded-lg bg-slate-800 sm:w-48" />
        <div className="mt-2 h-5 w-56 max-w-full animate-pulse rounded bg-slate-800" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton />
        <ListCardSkeleton rows={4} />
      </div>
    </section>
  );
}
