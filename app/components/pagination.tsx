import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pageRange } from '@/lib/pagination';
import { buildListUrl } from '@/lib/search';

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pathname,
  query,
  status,
  format,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pathname: string;
  query?: string;
  status?: string;
  format?: string;
}) {
  if (totalItems === 0) return null;

  const { start, end } = pageRange(page, pageSize, totalItems);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  function hrefFor(p: number) {
    return buildListUrl(pathname, { page: p, q: query, status, format });
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-center text-sm text-slate-500 sm:text-left">
        Showing{' '}
        <span className="font-medium tabular-nums text-slate-300">
          {start.toLocaleString()}–{end.toLocaleString()}
        </span>{' '}
        of <span className="font-medium tabular-nums text-slate-300">{totalItems.toLocaleString()}</span>
      </p>
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        {prevPage ? (
          <Link
            href={hrefFor(prevPage)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white sm:flex-none"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 text-sm font-medium text-slate-600 sm:flex-none">
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </span>
        )}
        <span className="shrink-0 px-1 text-sm tabular-nums text-slate-400 sm:px-2">
          {page}/{totalPages}
        </span>
        {nextPage ? (
          <Link
            href={hrefFor(nextPage)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white sm:flex-none"
          >
            Next
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 text-sm font-medium text-slate-600 sm:flex-none">
            Next
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
