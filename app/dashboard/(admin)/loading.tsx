export default function AdminDashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading admin dashboard" className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-6 sm:px-7 sm:py-8">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-800" />
        <div className="mt-3 h-8 w-40 animate-pulse rounded-lg bg-slate-800" />
        <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-800" />
      </div>

      <div>
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
              <div className="mt-4 h-9 w-14 animate-pulse rounded-lg bg-slate-800" />
              <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 h-4 w-36 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
              <div className="mt-4 h-3 w-20 animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
