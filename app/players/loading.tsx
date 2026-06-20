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

function SpotlightCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 p-4 sm:p-5 ${
        highlight ? 'border-brand-500/25' : 'border-slate-800'
      }`}
    >
      {highlight && <Skeleton className="mb-3 h-0.5 w-full rounded-none sm:mb-4" />}
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl sm:h-12 sm:w-12" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="hidden h-4 w-4 shrink-0 sm:block" />
      </div>
      <Skeleton className="mt-2.5 h-3 w-40 sm:mt-3" />
    </div>
  );
}

function PlayerRowSkeleton() {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-2.5 w-6" />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-11">
        <Skeleton className="h-1.5 flex-1 rounded-full" />
        <Skeleton className="h-3 w-10 shrink-0" />
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
      <td className="px-4 py-4 text-right sm:px-6">
        <Skeleton className="ml-auto h-4 w-10" />
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

function CtaSkeleton() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-5 py-8 sm:mt-14 sm:px-10 sm:py-10">
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-52 sm:h-9" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
          <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
        </div>
      </div>
    </div>
  );
}

export default function PlayersLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading players">
      {/* Hero */}
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-9 w-36 sm:h-10 sm:w-44 md:h-12 md:w-48" />
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
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32 sm:h-9" />
          </div>
          <div className="w-full lg:max-w-md lg:shrink-0">
            <SearchSkeleton />
          </div>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {/* Featured spotlight */}
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-44 sm:h-8" />
              </div>
              <Skeleton className="h-3 w-28 shrink-0" />
            </div>

            <div className="grid gap-3 sm:hidden">
              <SpotlightCardSkeleton highlight />
              <SpotlightCardSkeleton />
              <SpotlightCardSkeleton />
            </div>

            <div className="hidden gap-4 sm:grid sm:grid-cols-3">
              <SpotlightCardSkeleton />
              <SpotlightCardSkeleton highlight />
              <SpotlightCardSkeleton />
            </div>
          </div>

          {/* Player directory */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
            <div className="divide-y divide-slate-800 md:hidden">
              {Array.from({ length: 8 }, (_, i) => (
                <PlayerRowSkeleton key={i} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80">
                  <tr>
                    {Array.from({ length: 6 }, (_, i) => (
                      <th key={i} className="px-4 py-4 sm:px-6">
                        <Skeleton className={`h-3 ${i === 5 ? 'ml-auto w-12' : 'w-12'}`} />
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

        <CtaSkeleton />
      </section>
    </div>
  );
}
