'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Search, X } from 'lucide-react';
import { ContactActionsMenu } from '@/app/dashboard/contact-actions-menu';
import {
  CONTACT_CATEGORY_FILTER_OPTIONS,
  CONTACT_CATEGORY_LABELS,
  CONTACT_TYPE_FILTER_OPTIONS,
  formatContactWhen,
  matchesContactInboxFilter,
  parseContactInboxEntry,
  type ContactInboxRow,
} from '@/lib/contact-inbox';

const thClass = 'px-3 py-2.5 text-xs font-semibold uppercase tracking-wider';
const tdClass = 'px-3 py-2.5 align-top';

type SerializableContactRow = Omit<ContactInboxRow, 'createdAt' | 'resolvedAt'> & {
  createdAt: string;
  resolvedAt: string | null;
};

function ContactInboxFilters({
  query,
  category,
  type,
  onQueryChange,
  onCategoryChange,
  onTypeChange,
  onClear,
  resultCount,
  totalCount,
  showTypeFilter,
}: {
  query: string;
  category: string;
  type: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  showTypeFilter?: boolean;
}) {
  const hasFilters = Boolean(query || category !== 'all' || type !== 'all');

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search subject, sender, preview…"
            className="input h-10 w-full pl-9"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {showTypeFilter && (
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="select h-10 w-full sm:w-36"
            >
              {CONTACT_TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="select h-10 w-full sm:w-40"
          >
            {CONTACT_CATEGORY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="btn-secondary inline-flex h-10 items-center justify-center gap-1.5 px-4"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>
      {hasFilters && (
        <p className="text-xs text-slate-500">
          Showing {resultCount} of {totalCount} message{totalCount === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

export function PendingContactInboxTable({ entries }: { entries: SerializableContactRow[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const parsed = parseContactInboxEntry(entry);
        return matchesContactInboxFilter(entry, parsed, query, category, type);
      }),
    [entries, query, category, type],
  );

  if (entries.length === 0) {
    return (
      <div className="card-muted p-8 text-center text-sm text-slate-400">No pending contact messages.</div>
    );
  }

  return (
    <div>
      <ContactInboxFilters
        query={query}
        category={category}
        type={type}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onTypeChange={setType}
        onClear={() => {
          setQuery('');
          setCategory('all');
          setType('all');
        }}
        resultCount={filteredEntries.length}
        totalCount={entries.length}
        showTypeFilter
      />

      {filteredEntries.length === 0 ? (
        <div className="card-muted p-8 text-center text-sm text-slate-400">
          No pending messages match your filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-[52rem] w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                <tr>
                  <th className={`${thClass} min-w-[10rem]`}>Subject</th>
                  <th className={`${thClass} min-w-[9rem]`}>From</th>
                  <th className={`${thClass} hidden min-w-[7rem] md:table-cell`}>About</th>
                  <th className={`${thClass} min-w-[12rem]`}>Preview</th>
                  <th className={`${thClass} hidden min-w-[8rem] sm:table-cell`}>Category</th>
                  <th className={`${thClass} min-w-[8rem]`}>Received</th>
                  <th className={`${thClass} w-12 text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const parsed = parseContactInboxEntry(entry);
                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-800/80 bg-amber-500/[0.03] transition hover:bg-amber-500/[0.06]"
                    >
                      <td className={tdClass}>
                        <p className="font-medium text-white">{parsed.subjectLabel}</p>
                        {parsed.isDmReport && (
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                            DM report
                          </p>
                        )}
                      </td>
                      <td className={tdClass}>
                        <p className="font-medium text-slate-200">{entry.name}</p>
                        <a
                          href={`mailto:${entry.email}`}
                          className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
                        >
                          <Mail size={11} />
                          {entry.email}
                        </a>
                        {entry.user && (
                          <Link
                            href="/dashboard/accounts"
                            className="mt-1 block text-xs text-slate-500 hover:text-slate-300"
                          >
                            @{entry.user.username}
                          </Link>
                        )}
                      </td>
                      <td className={`${tdClass} hidden md:table-cell`}>
                        <span className="text-slate-300">{parsed.about}</span>
                      </td>
                      <td className={tdClass}>
                        <p className="line-clamp-3 whitespace-pre-wrap text-slate-400">{parsed.preview}</p>
                        {parsed.messageId && (
                          <p className="mt-1 font-mono text-[10px] text-slate-600">{parsed.messageId}</p>
                        )}
                      </td>
                      <td className={`${tdClass} hidden sm:table-cell`}>
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {CONTACT_CATEGORY_LABELS[entry.category] ?? entry.category}
                        </span>
                      </td>
                      <td className={`${tdClass} text-xs text-slate-500`}>
                        {formatContactWhen(entry.createdAt)}
                      </td>
                      <td className={tdClass}>
                        <ContactActionsMenu entry={entry} parsed={parsed} variant="pending" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResolvedContactInboxTable({ entries }: { entries: SerializableContactRow[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const parsed = parseContactInboxEntry(entry);
        return matchesContactInboxFilter(entry, parsed, query, category, 'all');
      }),
    [entries, query, category],
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <ContactInboxFilters
        query={query}
        category={category}
        type="all"
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onTypeChange={() => {}}
        onClear={() => {
          setQuery('');
          setCategory('all');
        }}
        resultCount={filteredEntries.length}
        totalCount={entries.length}
      />

      {filteredEntries.length === 0 ? (
        <div className="card-muted p-8 text-center text-sm text-slate-400">
          No resolved messages match your filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-[44rem] w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                <tr>
                  <th className={`${thClass} min-w-[10rem]`}>Subject</th>
                  <th className={`${thClass} min-w-[9rem]`}>From</th>
                  <th className={`${thClass} min-w-[14rem]`}>Preview</th>
                  <th className={`${thClass} min-w-[8rem]`}>Resolved</th>
                  <th className={`${thClass} w-12 text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const parsed = parseContactInboxEntry(entry);
                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-800/80 text-slate-400 transition hover:bg-slate-900/50"
                    >
                      <td className={tdClass}>
                        <p className="font-medium text-slate-300">{parsed.subjectLabel}</p>
                      </td>
                      <td className={tdClass}>
                        <p>{entry.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{entry.email}</p>
                      </td>
                      <td className={tdClass}>
                        <p className="line-clamp-2 whitespace-pre-wrap text-slate-500">{parsed.preview}</p>
                      </td>
                      <td className={`${tdClass} text-xs text-slate-500`}>
                        {entry.resolvedAt ? formatContactWhen(entry.resolvedAt) : '—'}
                      </td>
                      <td className={tdClass}>
                        <ContactActionsMenu entry={entry} parsed={parsed} variant="resolved" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
