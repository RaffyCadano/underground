import Link from 'next/link';
import { Search, X } from 'lucide-react';

type FilterOption = { value: string; label: string };

export function ListSearch({
  action,
  query = '',
  status,
  statusOptions,
  placeholder = 'Search…',
}: {
  action: string;
  query?: string;
  status?: string;
  statusOptions?: FilterOption[];
  placeholder?: string;
}) {
  const hasFilters = Boolean(query || (status && status !== 'all'));

  return (
    <form method="GET" action={action} className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-end">
      <div className="relative min-w-0 flex-1 lg:max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className="input w-full pl-9"
        />
      </div>
      {statusOptions && (
        <select name="status" defaultValue={status ?? 'all'} className="select w-full sm:w-auto lg:w-44">
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary min-w-0 flex-1 px-5 sm:flex-none">
          Search
        </button>
        {hasFilters && (
          <Link href={action} className="btn-secondary inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:flex-none">
            <X size={14} />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
