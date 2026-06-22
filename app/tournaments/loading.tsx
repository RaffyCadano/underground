function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3.5 sm:flex-row sm:gap-3 sm:px-3 sm:py-4 sm:text-left md:px-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9" />
      <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
        <Skeleton className="mx-auto h-5 w-8 sm:mx-0 sm:h-6 sm:w-10" />
        <Skeleton className="mx-auto h-2.5 w-14 sm:mx-0 sm:h-3 sm:w-20" />
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-end">
      <Skeleton className="h-10 w-full rounded-lg lg:max-w-md lg:flex-1" />
      <Skeleton className="h-10 w-full rounded-lg sm:w-44 lg:w-44" />
      <Skeleton className="h-10 w-full rounded-lg sm:w-24" />
    </div>
  );
}

function TournamentCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-slate-900/60 ${
        featured ? 'border-brand-500/25' : 'border-slate-800'
      }`}
    >
      {featured && <Skeleton className="h-1 w-full rounded-none" />}
      <div className="flex h-full flex-col p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <div className="mt-3 space-y-2 sm:mt-4">
          <Skeleton className="h-6 w-full max-w-[16rem]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-4 space-y-2 sm:mt-5">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-4 w-32 max-w-full" />
        </div>
        <div className="mt-5 border-t border-slate-800/80 pt-4 sm:mt-6 sm:border-0 sm:pt-0">
          <Skeleton className="h-10 w-full rounded-lg sm:h-5 sm:w-28" />
        </div>
      </div>
    </article>
  );
}

function ArchiveRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-full max-w-xs" />
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg sm:h-5 sm:w-24" />
    </div>
  );
}

export default function TournamentsLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading tournaments">
      {/* Hero */}
      <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="grid min-w-0 gap-6 sm:gap-8 md:grid-cols-2 md:items-center md:gap-8 lg:gap-10">
            <div className="relative order-1 min-w-0 md:order-2">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 sm:aspect-[5/3] sm:rounded-2xl md:aspect-[4/3]">
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:p-5 md:p-6">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-48 sm:h-7 sm:w-56" />
                  <Skeleton className="h-4 w-full max-w-xs" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-7 w-16 rounded-lg" />
                    <Skeleton className="h-7 w-14 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 min-w-0 space-y-3 text-center sm:space-y-4 md:order-1 md:text-left">
              <Skeleton className="mx-auto h-7 w-36 rounded-full md:mx-0" />
              <Skeleton className="mx-auto h-9 w-48 min-[480px]:h-10 min-[480px]:w-56 sm:h-12 sm:w-64 md:mx-0" />
              <div className="mx-auto max-w-xl space-y-2 md:mx-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 sm:mt-6">
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 lg:py-16">
        <div className="mb-6 sm:mb-8">
          <SearchSkeleton />
        </div>

        <div className="space-y-10 sm:space-y-14">
          <div>
            <div className="mb-5 sm:mb-6">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-8 w-56 sm:h-9" />
            </div>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              <TournamentCardSkeleton featured />
              <TournamentCardSkeleton />
              <TournamentCardSkeleton />
            </div>
          </div>

          <div>
            <div className="mb-5 sm:mb-6">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-8 w-44 sm:h-9" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="divide-y divide-slate-800">
                <ArchiveRowSkeleton />
                <ArchiveRowSkeleton />
                <ArchiveRowSkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
