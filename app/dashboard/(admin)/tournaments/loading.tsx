function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function TournamentRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-full max-w-xs" />
        <Skeleton className="h-3 w-full max-w-sm" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardTournamentsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading tournament management">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <TournamentRowSkeleton />
        <TournamentRowSkeleton />
        <TournamentRowSkeleton />
        <TournamentRowSkeleton />
      </div>
    </div>
  );
}
