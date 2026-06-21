function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function TournamentRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48 max-w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
    </div>
  );
}

function AsideRowSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

function ExploreLinkSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3.5 w-3.5 rounded" />
    </div>
  );
}

export default function PlayerProfileLoading() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading player profile">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-10 lg:py-14">
          <Skeleton className="mb-6 h-4 w-24" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-40 sm:h-10 sm:w-48" />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>

            <Skeleton className="h-10 w-full shrink-0 rounded-lg sm:w-40" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
          </div>
        </div>
      </section>

      <section className="container py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="hidden h-3 w-24 sm:block" />
              </div>
              <div className="divide-y divide-slate-800">
                {Array.from({ length: 5 }, (_, i) => (
                  <TournamentRowSkeleton key={i} />
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="border-b border-slate-800 px-6 py-5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1.5 h-3 w-48" />
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                    <Skeleton className="mt-2 h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <Skeleton className="h-3 w-16" />
              <div className="mt-4 space-y-4">
                <AsideRowSkeleton />
                <div>
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="mt-1 h-8 w-10" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1 h-8 w-10" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <Skeleton className="h-3 w-14" />
              <div className="mt-4 space-y-2">
                <ExploreLinkSkeleton />
                <ExploreLinkSkeleton />
                <ExploreLinkSkeleton />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
