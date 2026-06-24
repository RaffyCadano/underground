function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function TournamentRowSkeleton() {
  return (
    <tr className="border-t border-slate-800/80">
      <td className="px-3 py-3.5">
        <Skeleton className="h-5 w-48 max-w-full" />
      </td>
      <td className="px-3 py-3.5">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="hidden px-3 py-3.5 md:table-cell">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="hidden px-3 py-3.5 lg:table-cell">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-3.5">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="hidden px-3 py-3.5 sm:table-cell">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="px-3 py-3.5">
        <Skeleton className="h-7 w-20 rounded-full" />
      </td>
      <td className="px-3 py-3.5">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export default function DashboardTournamentsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading tournament management">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 p-4 sm:p-5">
          <Skeleton className="h-10 w-full max-w-lg rounded-lg" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[56rem] w-full">
            <thead className="border-b border-slate-800 bg-slate-900/80">
              <tr>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="px-3 py-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TournamentRowSkeleton />
              <TournamentRowSkeleton />
              <TournamentRowSkeleton />
              <TournamentRowSkeleton />
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-slate-800 px-5 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
