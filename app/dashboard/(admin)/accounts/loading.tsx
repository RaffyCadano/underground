function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function AccountRowSkeleton() {
  return (
    <tr className="border-t border-slate-800">
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-36 max-w-[12rem]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-10" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export default function DashboardAccountsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading account management">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                {['User', 'Email', 'Role', 'Record', 'Points', 'Joined', 'Actions'].map((label) => (
                  <th key={label} className="px-5 py-3">
                    <Skeleton className={`h-3 ${label === 'Actions' ? 'ml-auto w-14' : 'w-12'}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, i) => (
                <AccountRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
