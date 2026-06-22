function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-5 w-8 sm:h-6 sm:w-10" />
        <Skeleton className="h-2.5 w-14 sm:h-3 sm:w-20" />
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-end">
      <Skeleton className="h-10 w-full rounded-lg lg:max-w-md lg:flex-1" />
      <Skeleton className="h-10 w-full rounded-lg sm:w-24 lg:w-24" />
    </div>
  );
}

function PodiumCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 p-4 sm:p-6 ${
        highlight ? 'border-brand-500/30 lg:-mt-4 lg:pb-8' : 'border-slate-800'
      }`}
    >
      {highlight && <Skeleton className="absolute inset-x-0 top-0 h-1 rounded-none" />}
      <div className="flex flex-col items-center text-center">
        <Skeleton className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
        <Skeleton className="mt-2 h-12 w-12 rounded-full sm:mt-3 sm:h-14 sm:w-14" />
        <Skeleton className="mt-2 h-5 w-28 sm:mt-3" />
        <Skeleton className="mt-2 h-7 w-20 sm:h-8" />
        <div className="mt-3 flex gap-3 sm:mt-4 sm:gap-4">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

function LeaderboardRowSkeleton() {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-2.5 w-6" />
        </div>
        <div className="col-span-4 flex items-center gap-2">
          <Skeleton className="h-1.5 min-w-0 flex-1 rounded-full" />
          <Skeleton className="h-3 w-9 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-4 sm:px-6">
        <Skeleton className="h-8 w-8 rounded-full" />
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-10" />
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex min-w-[100px] items-center gap-3 sm:min-w-[120px]">
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-4 w-10 shrink-0" />
        </div>
      </td>
    </tr>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export default function RankingsLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading rankings">
      {/* Hero */}
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-9 w-44 sm:h-10 sm:w-52 md:h-12 md:w-56" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-5/6 max-w-lg" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <div className="space-y-10 sm:space-y-12">
          {/* Podium */}
          <div>
            <div className="mb-5 text-center sm:mb-6">
              <Skeleton className="mx-auto h-3 w-16" />
              <Skeleton className="mx-auto mt-2 h-8 w-36 sm:h-9" />
            </div>

            <div className="mx-auto grid gap-3 sm:hidden">
              <PodiumCardSkeleton highlight />
              <PodiumCardSkeleton />
              <PodiumCardSkeleton />
            </div>

            <div className="mx-auto hidden max-w-lg gap-4 sm:grid sm:grid-cols-1 lg:max-w-4xl lg:grid-cols-3 lg:items-end">
              <PodiumCardSkeleton />
              <PodiumCardSkeleton highlight />
              <PodiumCardSkeleton />
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32 sm:h-9" />
              </div>
              <div className="w-full lg:max-w-md lg:shrink-0">
                <SearchSkeleton />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="divide-y divide-slate-800 lg:hidden">
                {Array.from({ length: 8 }, (_, i) => (
                  <LeaderboardRowSkeleton key={i} />
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80">
                    <tr>
                      {Array.from({ length: 5 }, (_, i) => (
                        <th key={i} className="px-4 py-4 sm:px-6">
                          <Skeleton className="h-3 w-12" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Array.from({ length: 8 }, (_, i) => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationSkeleton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
