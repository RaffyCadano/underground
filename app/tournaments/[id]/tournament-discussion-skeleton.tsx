function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function DiscussionPostSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-full max-w-xl" />
          {!compact && <Skeleton className="h-4 w-2/3 max-w-md" />}
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TournamentDiscussionSkeleton({ posts = 2 }: { posts?: number }) {
  return (
    <div
      className="card overflow-hidden"
      id="tournament-discussion"
      aria-busy="true"
      aria-label="Loading discussion"
    >
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-full max-w-md" />
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: posts }, (_, index) => (
            <DiscussionPostSkeleton key={index} compact={index > 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DiscussionPostsLoadingSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading messages">
      {Array.from({ length: count }, (_, index) => (
        <DiscussionPostSkeleton key={index} compact />
      ))}
    </div>
  );
}

export function DiscussionReplySkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-900/50 p-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3.5 w-full max-w-sm" />
      </div>
    </div>
  );
}
