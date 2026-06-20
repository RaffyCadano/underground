function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function RecoveryFormSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl sm:h-11 sm:w-11" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-32 sm:h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-4 w-44" />
          <Skeleton className="mx-auto h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

function StepCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <Skeleton className="h-7 w-8 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

function DesktopBrandingSkeleton() {
  return (
    <div className="hidden min-w-0 lg:block">
      <Skeleton className="h-7 w-36 rounded-full" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-10 w-4/5 max-w-md" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-5 w-5/6 max-w-sm" />
      </div>

      <div className="mt-10 space-y-4">
        <StepCardSkeleton />
        <StepCardSkeleton />
        <StepCardSkeleton />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

function MobileHeaderSkeleton() {
  return (
    <div className="mb-5 text-center sm:mb-6 lg:hidden">
      <Skeleton className="mx-auto h-7 w-32 rounded-full" />
      <Skeleton className="mx-auto mt-3 h-8 w-56 sm:mt-4 sm:h-9" />
      <Skeleton className="mx-auto mt-2 h-4 w-64 max-w-sm" />
    </div>
  );
}

function MobileTipsSkeleton() {
  return (
    <div className="mt-6 space-y-4 sm:mt-8 lg:hidden">
      <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:flex-col sm:items-start sm:gap-2 sm:p-3"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9" />
            <div className="min-w-0 flex-1 space-y-1.5 sm:w-full">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="hidden h-3 w-4/5 sm:block" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ForgotPasswordLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading password recovery">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 hidden h-96 w-96 rounded-full bg-brand-500/5 blur-3xl sm:block" />

        <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
          <div className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <DesktopBrandingSkeleton />

            <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <MobileHeaderSkeleton />
              <RecoveryFormSkeleton />
              <MobileTipsSkeleton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
