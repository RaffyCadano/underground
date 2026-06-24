function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function OverviewCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
      <Skeleton className="mt-3 h-2.5 w-16" />
      <Skeleton className="mt-2 h-8 w-10" />
      <Skeleton className="mt-2 h-3 w-full max-w-[11rem]" />
    </div>
  );
}

export default function DashboardOverviewLoading() {
  return (
    <div aria-busy="true" aria-label="Loading overview" className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-7 w-28 sm:h-8" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
          <Skeleton className="h-4 w-44 max-w-full" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-52 max-w-full" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="h-9 w-8" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <OverviewCardSkeleton key={i} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-[7.25rem] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
