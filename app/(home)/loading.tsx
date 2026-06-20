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

function StepCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <Skeleton className="h-9 w-12" />
      <Skeleton className="mt-4 h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-5 h-4 w-24" />
    </div>
  );
}

function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="hidden h-3 w-20 shrink-0 sm:block" />
      </div>
      <div className="divide-y divide-slate-800">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
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
                    <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 sm:px-3">
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

      {/* How it works */}
      <section className="container py-10 sm:py-16">
        <div className="mb-8 max-w-xl sm:mb-10">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-8 w-64 sm:h-9" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StepCardSkeleton />
          <StepCardSkeleton />
          <StepCardSkeleton />
        </div>
      </section>

      {/* Leaderboard + matches */}
      <section className="border-y border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <PanelSkeleton />
            <PanelSkeleton rows={5} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-5 py-10 text-center sm:px-12 sm:py-12">
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
