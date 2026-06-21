function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />;
}

function SectionSkeleton() {
  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="border-b border-slate-800 px-5 py-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>
      <div className="space-y-4 p-5">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function CreateTournamentLoading() {
  return (
    <div className="w-full min-w-0" aria-busy="true" aria-label="Loading create tournament">
      <Skeleton className="mb-6 h-4 w-36" />

      <div className="mb-8 space-y-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="w-full min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-8">
        <div className="min-w-0 space-y-5">
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
        <Skeleton className="hidden h-56 rounded-2xl xl:block" />
      </div>
    </div>
  );
}
