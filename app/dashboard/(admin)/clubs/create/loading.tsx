function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

export default function CreateClubLoading() {
  return (
    <div aria-busy="true" aria-label="Loading create club">
      <Skeleton className="mb-6 h-4 w-28" />

      <div className="mb-6 space-y-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="card max-w-xl p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
