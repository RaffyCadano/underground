export default function LearnMoreLoading() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-slate-800" />
        <div className="mx-auto h-12 w-full max-w-xl animate-pulse rounded-lg bg-slate-800" />
        <div className="mx-auto h-20 w-full max-w-2xl animate-pulse rounded-lg bg-slate-800" />
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}
