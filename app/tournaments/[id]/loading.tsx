function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function MetaRowSkeleton() {
  return (
    <div>
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="mt-2 h-4 w-28" />
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
      <Skeleton className="h-9 w-full rounded-none" />
      <Skeleton className="h-9 w-full rounded-none border-t border-slate-800/80" />
    </div>
  );
}

function BracketColumnSkeleton({ matches }: { matches: number }) {
  return (
    <div className="flex w-44 shrink-0 flex-col gap-2">
      <Skeleton className="mx-auto h-3 w-16" />
      <div className="mt-2 flex flex-col gap-2">
        {Array.from({ length: matches }, (_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function TournamentDetailLoading() {
  return (
    <div className="w-full overflow-x-hidden" aria-busy="true" aria-label="Loading tournament">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80">
        <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-full max-w-md sm:h-9" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-10 w-full shrink-0 rounded-lg sm:w-40" />
        </div>
      </div>

      <div className="container flex min-h-0 flex-col gap-6 pb-10 pt-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="card p-5">
            <div className="space-y-4">
              <MetaRowSkeleton />
              <MetaRowSkeleton />
              <MetaRowSkeleton />
              <MetaRowSkeleton />
              <MetaRowSkeleton />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
              <Skeleton className="mt-2 h-20 w-full rounded-xl" />
            </div>
          </div>

          <div className="card p-5">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="card p-6">
            <div className="space-y-10">
              <section>
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-3 h-4 w-64 max-w-full" />
                <div className="mt-5 overflow-x-auto pb-2">
                  <div className="flex min-w-fit gap-5">
                    <BracketColumnSkeleton matches={8} />
                    <BracketColumnSkeleton matches={4} />
                    <BracketColumnSkeleton matches={2} />
                    <BracketColumnSkeleton matches={1} />
                  </div>
                </div>
              </section>

              <section>
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                <div className="mt-5 overflow-x-auto pb-2">
                  <div className="flex min-w-fit gap-5">
                    <BracketColumnSkeleton matches={4} />
                    <BracketColumnSkeleton matches={4} />
                    <BracketColumnSkeleton matches={2} />
                    <BracketColumnSkeleton matches={1} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
