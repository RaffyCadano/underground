'use client';

import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
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

/** Searchable player picker for the add-participant form. */
function PlayerSelectDropdown({
  users,
  value,
  onChange,
  disabled,
}: {
  users: AvailableUser[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, query]);

  const selected = users.find((u) => u.id === value);

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

  function select(id: string) {
    onChange(id);
    close();
  }

  const emptyLabel =
    users.length === 0 ? 'All players already added' : 'Select a player…';

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
        <span className={`min-w-0 truncate ${selected ? 'text-slate-100' : 'text-slate-500'}`}>
          {selected ? `${selected.username} (${selected.rankPoints} pts)` : emptyLabel}
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

          <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
            {filteredUsers.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">No players match your search</li>
            ) : (
              filteredUsers.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === u.id}
                    onClick={() => select(u.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-900 ${
                      value === u.id ? 'bg-brand-500/10 text-brand-200' : 'text-slate-200'
                    }`}
                  >
                    <span className="truncate font-medium">{u.username}</span>
                    <span className="shrink-0 tabular-nums text-xs text-slate-500">{u.rankPoints} pts</span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {query.trim() && filteredUsers.length > 0 && (
            <p className="border-t border-slate-800 px-3 py-1.5 text-xs text-slate-500">
              {filteredUsers.length} of {users.length} available
            </p>
          )}
        </div>
      )}
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
  const [selectedUserId, setSelectedUserId] = useState('');

  function handleAdd() {
    if (!selectedUserId) return;
    setError('');
    startTransition(async () => {
      try {
        await addPlayerToTournament(tournamentId, selectedUserId);
        setSelectedUserId('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add player.');
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Add player</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <PlayerSelectDropdown
              users={availableUsers}
              value={selectedUserId}
              onChange={setSelectedUserId}
              disabled={isPending || availableUsers.length === 0}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !selectedUserId}
              className="btn-primary w-full shrink-0 disabled:opacity-60 sm:w-auto"
            >
              {isPending ? 'Adding…' : 'Add'}
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
