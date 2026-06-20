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

function ClubCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-slate-900/60 ${
        featured ? 'border-brand-500/25' : 'border-slate-800'
      }`}
    >
      {featured && <Skeleton className="h-1 w-full rounded-none" />}
      <div className="flex h-full flex-col p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl sm:h-12 sm:w-12" />
          <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
        </div>

        <Skeleton className="mt-3 h-6 w-full max-w-[14rem] sm:mt-4" />
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-1 py-2 sm:rounded-xl sm:py-2.5"
            >
              <Skeleton className="mx-auto h-5 w-8 sm:h-6" />
              <Skeleton className="mx-auto mt-1.5 h-2 w-10" />
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-800 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-28" />
        </div>
      </div>
    </article>
  );
}

function CtaSkeleton() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-5 py-8 sm:mt-14 sm:px-10 sm:py-10">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-56 sm:h-9 md:w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
          <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
        </div>
      </div>
    </div>
  );
}

export default function TeamsLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading teams">
      {/* Hero */}
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-9 w-32 sm:h-10 sm:w-40 md:h-12 md:w-44" />
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
            <Skeleton className="h-8 w-44 sm:h-9" />
          </div>
          <div className="w-full lg:max-w-md lg:shrink-0">
            <SearchSkeleton />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          <ClubCardSkeleton featured />
          <ClubCardSkeleton />
          <ClubCardSkeleton />
          <ClubCardSkeleton />
          <ClubCardSkeleton />
          <ClubCardSkeleton />
        </div>

        <CtaSkeleton />
      </section>
    </div>
  );
}
