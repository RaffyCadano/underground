import Link from 'next/link';
import { Search, X } from 'lucide-react';

type FilterOption = { value: string; label: string };

export function ListSearch({
  action,
  query = '',
  filterName = 'status',
  filterValue,
  filterOptions,
  status,
  statusOptions,
  placeholder = 'Search…',
}: {
  action: string;
  query?: string;
  filterName?: string;
  filterValue?: string;
  filterOptions?: FilterOption[];
  status?: string;
  statusOptions?: FilterOption[];
  placeholder?: string;
}) {
  const options = filterOptions ?? statusOptions;
  const value = filterValue ?? status;
  const hasFilters = Boolean(query || (value && value !== 'all'));

  return (
    <form
      method="GET"
      action={action}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
    >
      <div className="relative min-w-0 w-full flex-1 sm:min-w-[12rem]">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className="input h-10 w-full pl-9"
        />
      </div>
      {options && (
        <select
          name={filterName}
          defaultValue={value ?? 'all'}
          className="select h-10 w-full sm:w-36 sm:shrink-0"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
        <button
          type="submit"
          className="btn-primary inline-flex h-10 min-w-0 flex-1 items-center justify-center px-5 sm:flex-none"
        >
          Search
        </button>
        {hasFilters && (
          <Link
            href={action}
            className="btn-secondary inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 sm:flex-none"
          >
            <X size={14} />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
