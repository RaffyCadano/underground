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
      <Skeleton className="h-10 w-full rounded-lg sm:w-44 lg:w-44" />
      <Skeleton className="h-10 w-full rounded-lg sm:w-24" />
    </div>
  );
}

function TournamentCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-2xl border bg-slate-900/60 ${
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
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-9 w-48 sm:h-10 sm:w-56 md:h-12 md:w-64" />
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
        <div className="mb-6 sm:mb-8">
          <SearchSkeleton />
        </div>

        <div className="space-y-10 sm:space-y-14">
          <div>
            <div className="mb-5 sm:mb-6">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-8 w-56 sm:h-9" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
