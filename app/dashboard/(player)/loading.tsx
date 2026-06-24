function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

export default function PlayerDashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 sm:p-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-4 h-7 w-40" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <Skeleton className="mt-6 h-10 w-44 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-6 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[40rem] w-full">
            <thead className="border-b border-slate-800 bg-slate-900/80">
              <tr>
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-3 py-3">
                    <Skeleton className="h-3 w-14" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-t border-slate-800/80">
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-48 max-w-full" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="hidden px-3 py-3.5 sm:table-cell">
                    <Skeleton className="h-4 w-28" />
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
