export default function AdminDashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading admin dashboard">
      <div className="mb-6">
        <div className="h-7 w-32 animate-pulse rounded bg-slate-800" />
        <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-slate-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 h-9 w-12 animate-pulse rounded-lg bg-slate-800" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
