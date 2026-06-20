'use client';

import Link from 'next/link';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { addPlayerToTournament, removePlayerFromTournament } from '@/app/actions/tournaments';

type Participant = {
  id: string;
  userId: string;
  user: { id: string; username: string; rankPoints: number };
};

type AvailableUser = {
  id: string;
  username: string;
  rankPoints: number;
};

interface Props {
  tournamentId: string;
  participants: Participant[];
  availableUsers: AvailableUser[];
  isAdmin: boolean;
  canManage: boolean;
}

/** Searchable multi-select player picker for the add-participant form. */
function PlayerSelectDropdown({
  users,
  value,
  onChange,
  disabled,
}: {
  users: AvailableUser[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, query]);

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedSet.has(u.id)),
    [users, selectedSet],
  );

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function toggleAllFiltered() {
    const filteredIds = filteredUsers.map((u) => u.id);
    const allSelected = filteredIds.every((id) => selectedSet.has(id));
    if (allSelected) {
      onChange(value.filter((id) => !filteredIds.includes(id)));
    } else {
      onChange([...new Set([...value, ...filteredIds])]);
    }
  }

  const emptyLabel =
    users.length === 0 ? 'All players already added' : 'Select players…';

  const triggerLabel = (() => {
    if (selectedUsers.length === 0) return emptyLabel;
    if (selectedUsers.length === 1) {
      const u = selectedUsers[0];
      return `${u.username} (${u.rankPoints} pts)`;
    }
    return `${selectedUsers.length} players selected`;
  })();

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedSet.has(u.id));

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="select flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`min-w-0 truncate ${selectedUsers.length > 0 ? 'text-slate-100' : 'text-slate-500'}`}
        >
          {triggerLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-xl shadow-black/30">
          <div className="border-b border-slate-800 p-2">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players…"
                className="input w-full py-2 pl-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close();
                }}
              />
            </div>
          </div>

          {filteredUsers.length > 0 && (
            <div className="border-b border-slate-800 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-400">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500/40 focus:ring-offset-0"
                />
                Select all{query.trim() ? ' matching' : ''}
              </label>
            </div>
          )}

          <ul className="max-h-48 overflow-y-auto py-1" role="listbox" aria-multiselectable="true">
            {filteredUsers.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">No players match your search</li>
            ) : (
              filteredUsers.map((u) => {
                const checked = selectedSet.has(u.id);
                return (
                  <li key={u.id}>
                    <label
                      className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-slate-900 ${
                        checked ? 'bg-brand-500/10 text-brand-200' : 'text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(u.id)}
                        className="h-3.5 w-3.5 shrink-0 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500/40 focus:ring-offset-0"
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{u.username}</span>
                      <span className="shrink-0 tabular-nums text-xs text-slate-500">
                        {u.rankPoints} pts
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-3 py-2">
            <p className="text-xs text-slate-500">
              {selectedUsers.length > 0
                ? `${selectedUsers.length} selected`
                : query.trim() && filteredUsers.length > 0
                  ? `${filteredUsers.length} of ${users.length} available`
                  : `${users.length} available`}
            </p>
            {selectedUsers.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-slate-400 transition hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddingPlayersModal({ current, total }: { current: number; total: number }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const label =
    total === 1
      ? 'Registering player…'
      : current === 0
        ? `Registering ${total} players…`
        : `Registered ${current} of ${total}…`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adding-players-title"
      aria-busy="true"
    >
      <div className="card w-full max-w-sm p-8 text-center shadow-2xl shadow-black/40">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-400" aria-hidden="true" />
        <h2 id="adding-players-title" className="mt-4 text-lg font-semibold text-white">
          Adding players
        </h2>
        <p className="mt-2 text-sm text-slate-400">{label}</p>
        {total > 1 && (
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${Math.max((current / total) * 100, 8)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ParticipantManager({
  tournamentId,
  participants,
  availableUsers,
  isAdmin,
  canManage,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [addProgress, setAddProgress] = useState<{ current: number; total: number } | null>(null);

  function handleAdd() {
    if (selectedUserIds.length === 0) return;
    const ids = [...selectedUserIds];
    setError('');
    setAddProgress({ current: 0, total: ids.length });
    startTransition(async () => {
      try {
        for (let i = 0; i < ids.length; i++) {
          await addPlayerToTournament(tournamentId, ids[i]);
          setAddProgress({ current: i + 1, total: ids.length });
        }
        setSelectedUserIds([]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add players.');
      } finally {
        setAddProgress(null);
      }
    });
  }

  function handleRemove(userId: string) {
    setError('');
    startTransition(async () => {
      try {
        await removePlayerFromTournament(tournamentId, userId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to remove player.');
      }
    });
  }

  return (
    <div className="space-y-5">
      {addProgress && <AddingPlayersModal current={addProgress.current} total={addProgress.total} />}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Registered players ({participants.length})
        </p>
        {canManage && (
          <p className="mt-1 text-sm text-slate-400">
            Add players below, then generate the bracket when ready.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      {isAdmin && canManage && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Add players</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <PlayerSelectDropdown
              users={availableUsers}
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              disabled={isPending || addProgress !== null || availableUsers.length === 0}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || addProgress !== null || selectedUserIds.length === 0}
              className="btn-primary w-full shrink-0 disabled:opacity-60 sm:w-auto"
            >
              {addProgress
                ? 'Adding…'
                : selectedUserIds.length > 1
                  ? `Add ${selectedUserIds.length} players`
                  : 'Add'}
            </button>
          </div>
        </div>
      )}

      {participants.length === 0 ? (
        <div className="card-muted p-8 text-center text-slate-400">
          No players registered yet.
          {isAdmin && canManage && ' Use the form above to add players.'}
          {!isAdmin && ' Sign in and register, or wait for an admin to add players.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="w-10 px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  #
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Player
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rating
                </th>
                {isAdmin && canManage && (
                  <th className="w-20 px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Remove
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.id} className="border-b border-slate-800 last:border-0">
                  <td className="px-4 py-2.5 tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/players/${p.user.username.toLowerCase()}`}
                      className="font-semibold text-white transition hover:text-brand-300"
                    >
                      {p.user.username}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">
                    {p.user.rankPoints}
                  </td>
                  {isAdmin && canManage && (
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(p.userId)}
                        disabled={isPending}
                        className="text-xs font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
