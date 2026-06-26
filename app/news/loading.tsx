export default function NewsLoading() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="mx-auto h-8 w-40 animate-pulse rounded-lg bg-slate-800" />
        <div className="mx-auto h-12 w-full max-w-md animate-pulse rounded-lg bg-slate-800" />
        <div className="mx-auto h-16 w-full max-w-xl animate-pulse rounded-lg bg-slate-800" />
      </div>
      <div className="mx-auto mt-12 max-w-4xl space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}
