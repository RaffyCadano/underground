function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

export default function ClubRequestLoading() {
  return (
    <div aria-busy="true" aria-label="Loading club request">
      <section className="border-b border-slate-800">
        <div className="container py-8 sm:py-12 lg:py-16">
          <Skeleton className="h-4 w-28" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
            <div className="order-2 space-y-4 md:order-1">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-full max-w-lg" />
              <Skeleton className="h-5 w-full max-w-lg" />
              <Skeleton className="mt-4 h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="order-1 aspect-[16/9] w-full rounded-2xl md:order-2 md:aspect-[4/3]" />
          </div>
        </div>
      </section>
      <section className="container py-8 sm:py-12 lg:py-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
