'use client';

import Link from 'next/link';
import { AlertTriangle, ChevronDown, Loader2, Search, UserMinus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { addGuestPlayerToTournament, addPlayerToTournament, removePlayerFromTournament } from '@/app/actions/tournaments';
import { normalizeGuestDisplayName } from '@/lib/guest-player';

type Participant = {
  id: string;
  userId: string;
  user: { id: string; username: string; rankPoints: number; role: string };
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
        <div
          className="absolute z-30 mt-1 flex w-full max-h-[min(20rem,calc(100vh-8rem))] flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-xl shadow-black/30"
          data-lenis-prevent
        >
          <div className="shrink-0 border-b border-slate-800 p-2">
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
            <div className="shrink-0 border-b border-slate-800 px-3 py-2">
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

          <ul
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
            role="listbox"
            aria-multiselectable="true"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
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

          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-800 px-3 py-2">
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

function RemovePlayerConfirmModal({
  open,
  playerName,
  isGuest = false,
  onClose,
  onConfirm,
  isPending,
  error,
}: {
  open: boolean;
  playerName: string;
  isGuest?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-player-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                <UserMinus size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300/80">
                  Unregister player
                </p>
                <h2 id="remove-player-title" className="mt-1 text-lg font-semibold text-white">
                  Remove from tournament?
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  This only affects registration — the bracket has not started yet.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Player</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white">{playerName}</p>
              {isGuest && (
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Walk-in
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400">This will:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
              {[
                'Remove them from the registered players list',
                'Free a spot if this event has a player cap',
                'Let you add them again before you generate the bracket',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-100/90">
              Safe to undo — re-add the player from the form above anytime before bracket generation.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary w-full sm:w-auto disabled:opacity-60"
          >
            Keep player
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:opacity-60 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Removing…
              </>
            ) : (
              <>
                <UserMinus size={15} />
                Remove player
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
  const [customName, setCustomName] = useState('');
  const [addProgress, setAddProgress] = useState<{ current: number; total: number } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{
    userId: string;
    username: string;
    isGuest: boolean;
  } | null>(null);
  const [removeError, setRemoveError] = useState('');

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

  function handleAddCustomName() {
    const name = normalizeGuestDisplayName(customName);
    if (!name) return;
    setError('');
    setAddProgress({ current: 0, total: 1 });
    startTransition(async () => {
      try {
        await addGuestPlayerToTournament(tournamentId, name);
        setCustomName('');
        setAddProgress({ current: 1, total: 1 });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add player.');
      } finally {
        setAddProgress(null);
      }
    });
  }

  function openRemoveConfirm(userId: string, username: string, isGuest: boolean) {
    setRemoveError('');
    setRemoveTarget({ userId, username, isGuest });
  }

  function closeRemoveConfirm() {
    if (isPending) return;
    setRemoveTarget(null);
    setRemoveError('');
  }

  function confirmRemove() {
    if (!removeTarget) return;
    setError('');
    setRemoveError('');
    startTransition(async () => {
      try {
        await removePlayerFromTournament(tournamentId, removeTarget.userId);
        setRemoveTarget(null);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to remove player.';
        setRemoveError(message);
        setError(message);
      }
    });
  }

  return (
    <div className="space-y-5">
      {addProgress && <AddingPlayersModal current={addProgress.current} total={addProgress.total} />}

      <RemovePlayerConfirmModal
        open={removeTarget !== null}
        playerName={removeTarget?.username ?? ''}
        isGuest={removeTarget?.isGuest ?? false}
        onClose={closeRemoveConfirm}
        onConfirm={confirmRemove}
        isPending={isPending && removeTarget !== null}
        error={removeError}
      />

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
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Add players</p>
            <p className="mt-1 text-xs text-slate-500">
              Pick registered accounts or add a walk-in with a custom name.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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

          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div>
            <label htmlFor="custom-player-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custom name
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
              <input
                id="custom-player-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Walk-in player name"
                disabled={isPending || addProgress !== null}
                className="input min-w-0 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomName();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomName}
                disabled={isPending || addProgress !== null || !customName.trim()}
                className="btn-secondary w-full shrink-0 disabled:opacity-60 sm:w-auto"
              >
                Add custom
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">
              For players without a UGNCBBX account — they won&apos;t appear on rankings.
            </p>
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
                    <div className="flex flex-wrap items-center gap-2">
                      {p.user.role === 'guest' ? (
                        <span className="font-semibold text-white">{p.user.username}</span>
                      ) : (
                        <Link
                          href={`/players/${p.user.username.toLowerCase()}`}
                          className="font-semibold text-white transition hover:text-brand-300"
                        >
                          {p.user.username}
                        </Link>
                      )}
                      {p.user.role === 'guest' && (
                        <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Walk-in
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">
                    {p.user.role === 'guest' ? '—' : p.user.rankPoints}
                  </td>
                  {isAdmin && canManage && (
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => openRemoveConfirm(p.userId, p.user.username, p.user.role === 'guest')}
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
