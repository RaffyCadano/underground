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

function ValueCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-4 h-6 w-36" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
    </div>
  );
}

function OfferingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-4 h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-4 h-4 w-28" />
    </div>
  );
}

function FormatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mt-3 h-5 w-36" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
    </div>
  );
}

export default function AboutLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading about page">
      <section className="relative border-b border-slate-800 py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-10 w-48 sm:h-12 sm:w-56" />
            <Skeleton className="h-5 w-72 max-w-full" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full max-w-lg sm:h-10" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
          <ValueCardSkeleton />
          <ValueCardSkeleton />
          <ValueCardSkeleton />
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/40">
        <div className="container py-10 sm:py-14 lg:py-16">
          <div className="max-w-2xl space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-64 sm:h-10" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <OfferingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-52 sm:h-10" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-10 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <FormatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="container pb-10 sm:pb-14 lg:pb-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-10 text-center sm:px-12 sm:py-12">
          <div className="mx-auto max-w-lg space-y-3">
            <Skeleton className="mx-auto h-3 w-28" />
            <Skeleton className="mx-auto h-9 w-48 sm:h-10" />
            <Skeleton className="mx-auto h-4 w-full" />
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
