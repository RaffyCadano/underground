function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function HeroStatsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 sm:rounded-none sm:border-0 sm:bg-transparent">
      <div className="grid grid-cols-3 divide-x divide-slate-800 sm:flex sm:gap-6 sm:divide-x-0 sm:border-t sm:border-slate-800/80 sm:pt-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-4 sm:flex-row sm:gap-3 sm:px-0 sm:py-0"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg sm:h-10 sm:w-10 sm:rounded-xl" />
            <div className="flex flex-col items-center gap-1.5 sm:items-start">
              <Skeleton className="h-5 w-8 sm:h-6 sm:w-10" />
              <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="space-y-4 p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-7 w-full max-w-xs sm:h-8" />
        <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5 sm:px-4 sm:py-3">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function StepTimelineSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <li className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-10 bottom-0 w-px bg-slate-800 sm:left-[19px]"
        />
      )}
      <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-10 sm:w-10" />
      <div className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-28 rounded-lg" />
      </div>
    </li>
  );
}

function FormatCardSkeleton() {
  return (
    <div className="flex min-w-[260px] snap-start flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 sm:min-w-0">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function HowItWorksSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="container relative py-12 sm:py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-x-12 xl:gap-x-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="mt-4 h-9 w-full max-w-xs sm:h-10 lg:h-12" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-6 hidden rounded-xl border border-slate-800 bg-slate-950/50 p-4 lg:block">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
          </div>

          <div className="mt-10 lg:mt-0">
            <Skeleton className="mb-6 h-3 w-44 lg:hidden" />
            <ol className="list-none">
              <StepTimelineSkeleton />
              <StepTimelineSkeleton />
              <StepTimelineSkeleton isLast />
            </ol>
          </div>
        </div>

        <div className="mt-14 sm:mt-16 lg:mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-52 sm:h-9" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-4/5 max-w-lg" />
            </div>
            <Skeleton className="h-11 w-36 shrink-0 rounded-lg" />
          </div>

          <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-8 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <FormatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PodiumCardSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`relative flex min-w-0 flex-1 flex-col items-center rounded-xl border p-3 sm:p-4 ${
        highlight
          ? 'border-slate-700 bg-slate-900/60 sm:-mt-3 sm:pb-5'
          : 'border-slate-800 bg-slate-950/50'
      }`}
    >
      {highlight && <Skeleton className="absolute inset-x-0 top-0 h-0.5 rounded-none" />}
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="mt-2 h-12 w-12 rounded-full sm:mt-3 sm:h-14 sm:w-14" />
      <Skeleton className="mt-2 h-4 w-24 sm:mt-3" />
      <Skeleton className="mt-2 h-6 w-16" />
      <Skeleton className="mt-1 h-3 w-20" />
    </div>
  );
}

function LeaderboardRowSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-2.5 w-6" />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-11">
        <Skeleton className="h-1 min-w-0 flex-1 rounded-full" />
        <Skeleton className="h-3 w-8 shrink-0" />
      </div>
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
      <Skeleton className="h-8 w-full rounded-none" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        <div className="flex items-center justify-end px-3 py-3 sm:px-4">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex flex-col items-center justify-center border-x border-slate-800/80 px-2.5 py-2 sm:px-3">
          <Skeleton className="h-2 w-8" />
          <Skeleton className="mt-1 h-5 w-10" />
        </div>
        <div className="flex items-center px-3 py-3 sm:px-4">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

function CircuitPanelSkeleton({ variant }: { variant: 'leaderboard' | 'matches' }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      {variant === 'leaderboard' ? (
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-end gap-2 sm:gap-3">
            <PodiumCardSkeleton />
            <PodiumCardSkeleton highlight />
            <PodiumCardSkeleton />
          </div>
          <div className="space-y-2">
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 5 }, (_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function CircuitSectionSkeleton() {
  return (
    <section className="border-y border-slate-800 bg-slate-950/40">
      <div className="container py-10 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-64 sm:h-10" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <CircuitPanelSkeleton variant="leaderboard" />
          <CircuitPanelSkeleton variant="matches" />
        </div>
      </div>
    </section>
  );
}

export default function HomeLoading() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading home page">
      {/* Hero */}
      <section className="relative overflow-x-hidden border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="container relative py-8 sm:py-12 md:py-14 lg:py-20">
          <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-8 md:items-start lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
            <div className="order-2 min-w-0 space-y-6 sm:space-y-8 md:order-1 lg:order-none">
              <div className="space-y-4 text-center sm:space-y-5 md:text-left">
                <Skeleton className="mx-auto h-7 w-40 rounded-full md:mx-0" />
                <div className="mx-auto max-w-2xl space-y-3 md:mx-0">
                  <Skeleton className="h-9 w-full min-[480px]:h-10 sm:h-12 lg:h-14" />
                  <Skeleton className="h-9 w-4/5 min-[480px]:h-10 sm:h-12 lg:hidden" />
                </div>
                <div className="mx-auto max-w-xl space-y-2 md:mx-0">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-start">
                <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
                <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
              </div>

              <HeroStatsSkeleton />
            </div>

            <div className="order-1 min-w-0 space-y-4 md:order-2 lg:order-none">
              <FeaturedCardSkeleton />
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 sm:px-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-full max-w-[12rem]" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSkeleton />

      <CircuitSectionSkeleton />

      {/* CTA */}
      <section className="container py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-5 py-10 text-center sm:border-brand-500/20 sm:px-12 sm:py-12">
          <div className="relative mx-auto max-w-lg space-y-3">
            <Skeleton className="mx-auto h-3 w-32" />
            <Skeleton className="mx-auto h-9 w-full max-w-sm sm:h-10" />
            <Skeleton className="mx-auto h-4 w-full" />
            <Skeleton className="mx-auto h-4 w-4/5" />
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-center">
              <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
              <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
