import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

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
  className = '',
  singleRow = false,
  trailing,
}: {
  action: string;
  query?: string;
  filterName?: string;
  filterValue?: string;
  filterOptions?: FilterOption[];
  status?: string;
  statusOptions?: FilterOption[];
  placeholder?: string;
  className?: string;
  singleRow?: boolean;
  trailing?: ReactNode;
}) {
  const options = filterOptions ?? statusOptions;
  const value = filterValue ?? status;
  const hasFilters = Boolean(query || (value && value !== 'all'));
  const rowLayout = singleRow
    ? 'flex-row flex-nowrap items-center gap-2 overflow-x-auto pb-0.5'
    : 'flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center';

  return (
    <form
      method="GET"
      action={action}
      className={`flex ${rowLayout} ${className}`.trim()}
    >
      <div
        className={`relative min-w-0 flex-1 ${singleRow ? 'min-w-[10rem]' : 'w-full sm:min-w-[12rem]'}`}
      >
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
          className={`select h-10 shrink-0 ${singleRow ? 'w-36' : 'w-full sm:w-36'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <div className={`flex shrink-0 gap-2 ${singleRow ? '' : 'w-full sm:w-auto'}`}>
        <button
          type="submit"
          className={`btn-primary inline-flex h-10 items-center justify-center px-5 ${singleRow ? '' : 'min-w-0 flex-1 sm:flex-none'}`}
        >
          Search
        </button>
        {hasFilters && (
          <Link
            href={action}
            className={`btn-secondary inline-flex h-10 items-center justify-center gap-1.5 px-4 ${singleRow ? '' : 'min-w-0 flex-1 sm:flex-none'}`}
          >
            <X size={14} />
            Clear
          </Link>
        )}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </form>
  );
}
