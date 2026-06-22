function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function AccountRowSkeleton() {
  return (
    <tr className="border-t border-slate-800">
      <td className="sticky left-0 z-10 bg-slate-950 px-3 py-3.5 sm:px-4 sm:py-4 xl:px-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-3 w-32 md:hidden" />
      </td>
      <td className="hidden px-3 py-3.5 sm:px-4 sm:py-4 md:table-cell xl:px-5">
        <Skeleton className="h-4 w-36 max-w-[12rem]" />
      </td>
      <td className="px-3 py-3.5 sm:px-4 sm:py-4 xl:px-5">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="hidden px-3 py-3.5 sm:table-cell sm:px-4 sm:py-4 xl:px-5">
        <Skeleton className="h-4 w-10" />
      </td>
      <td className="hidden px-3 py-3.5 lg:table-cell sm:px-4 sm:py-4 xl:px-5">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="hidden px-3 py-3.5 xl:table-cell sm:px-4 sm:py-4 xl:px-5">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="sticky right-0 z-10 bg-slate-950 px-3 py-3.5 text-right sm:px-4 sm:py-4 xl:px-5">
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
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <div className="w-full md:max-w-xl md:flex-1 lg:max-w-2xl">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-[36rem] w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                {[
                  { label: 'User', sticky: 'left' },
                  { label: 'Email', hidden: 'md' },
                  { label: 'Role' },
                  { label: 'Record', hidden: 'sm' },
                  { label: 'Points', hidden: 'lg' },
                  { label: 'Joined', hidden: 'xl' },
                  { label: 'Actions', sticky: 'right' },
                ].map(({ label, hidden, sticky }) => (
                  <th
                    key={label}
                    className={`px-3 py-3 sm:px-4 xl:px-5 ${
                      hidden === 'md'
                        ? 'hidden md:table-cell'
                        : hidden === 'sm'
                          ? 'hidden sm:table-cell'
                          : hidden === 'lg'
                            ? 'hidden lg:table-cell'
                            : hidden === 'xl'
                              ? 'hidden xl:table-cell'
                              : ''
                    } ${sticky === 'left' ? 'sticky left-0 z-20 bg-slate-900' : ''} ${
                      sticky === 'right' ? 'sticky right-0 z-20 bg-slate-900 text-right' : ''
                    }`}
                  >
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
