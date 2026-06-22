function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function AccountFieldSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-40 max-w-full" />
      </div>
    </div>
  );
}

export default function PlayerProfileSettingsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile settings">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
        <div className="flex flex-col items-center px-5 py-8 sm:px-6">
          <Skeleton className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
          <Skeleton className="mt-4 h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
          <Skeleton className="mt-6 h-36 w-full max-w-md rounded-xl" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="ml-auto h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-48" />
          </div>
          <div className="divide-y divide-slate-800/80">
            <AccountFieldSkeleton />
            <AccountFieldSkeleton />
            <AccountFieldSkeleton />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
          <Skeleton className="h-3 w-28" />
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-12 w-full" />
          <Skeleton className="mt-5 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
