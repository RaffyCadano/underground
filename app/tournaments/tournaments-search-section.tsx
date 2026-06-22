import { ListSearch } from '@/app/components/list-search';

type Props = {
  query?: string;
  status?: string;
  statusOptions: { value: string; label: string }[];
};

export function TournamentsSearchSection({ query = '', status = 'all', statusOptions }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
      <div className="min-w-0 lg:max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Find events</p>
        <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
          Search the circuit calendar
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Look up tournaments by name or location, or filter by open registration, live brackets, and
          completed events.
        </p>
      </div>
      <div className="min-w-0 w-full lg:max-w-xl lg:shrink-0">
        <ListSearch
          action="/tournaments"
          query={query}
          status={status}
          statusOptions={statusOptions}
          placeholder="Search by name, location…"
        />
      </div>
    </div>
  );
}
