function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <Skeleton className="h-3 w-16" />
          <div className="mt-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="card p-5">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
