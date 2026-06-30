'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronDown, Loader2, Search, UserMinus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { addBulkParticipantsToTournament, addGuestPlayerToTournament, addPlayersToTournament, removePlayerFromTournament } from '@/app/actions/tournaments';
import { SuccessToast } from '@/app/components/success-toast';
import { normalizeGuestDisplayName, parseBulkParticipantLines } from '@/lib/guest-player';
import { isWalkInDisplay, participantDisplayName } from '@/lib/tournament-participant';
import { playerProfilePath } from '@/lib/player-profile';

type Participant = {
  id: string;
  userId: string;
  walkInName?: string | null;
  user: { id: string; username: string; rankPoints: number; role: string };
};

type AvailableUser = {
  id: string;
  username: string;
  rankPoints: number;
};

export function TournamentParticipantList({
  participants,
  emptyMessage = 'No players registered yet.',
  onRemove,
  removeDisabled,
}: {
  participants: Participant[];
  emptyMessage?: string;
  onRemove?: (userId: string, username: string, isGuest: boolean) => void;
  removeDisabled?: boolean;
}) {
  const canRemove = !!onRemove;

  if (participants.length === 0) {
    return (
      <div className="card-muted p-8 text-center text-slate-400">{emptyMessage}</div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 sm:hidden">
        {participants.map((p, i) => {
          const displayName = participantDisplayName(p);
          const walkIn = isWalkInDisplay(p);
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="w-5 shrink-0 tabular-nums text-xs text-slate-500">{i + 1}</span>
                <div className="min-w-0">
                  {walkIn ? (
                    <span className="block truncate font-semibold text-white">{displayName}</span>
                  ) : (
                    <Link
                      href={playerProfilePath(p.user.username)}
                      className="block truncate font-semibold text-white transition hover:text-brand-300"
                    >
                      {displayName}
                    </Link>
                  )}
                  {walkIn && (
                    <span className="mt-1 inline-flex rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Walk-in
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="tabular-nums text-sm font-medium text-slate-300">
                  {walkIn ? '—' : p.user.rankPoints}
                </span>
                {!walkIn && (
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Rating</span>
                )}
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove!(p.userId, displayName, walkIn)}
                    disabled={removeDisabled}
                    className="mt-1 text-xs font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full min-w-[280px] text-sm">
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
                {canRemove && (
                  <th className="w-20 px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Remove
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => {
                const displayName = participantDisplayName(p);
                const walkIn = isWalkInDisplay(p);
                return (
                  <tr key={p.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {walkIn ? (
                          <span className="font-semibold text-white">{displayName}</span>
                        ) : (
                          <Link
                            href={playerProfilePath(p.user.username)}
                            className="font-semibold text-white transition hover:text-brand-300"
                          >
                            {displayName}
                          </Link>
                        )}
                        {walkIn && (
                          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Walk-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">
                      {walkIn ? '—' : p.user.rankPoints}
                    </td>
                    {canRemove && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onRemove(p.userId, displayName, walkIn)}
                          disabled={removeDisabled}
                          className="text-xs font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

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
  onQuickAdd,
  addingUserId,
  disabled,
}: {
  users: AvailableUser[];
  value: string[];
  onChange: (ids: string[]) => void;
  onQuickAdd?: (userId: string) => void;
  addingUserId?: string | null;
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
                const isAdding = addingUserId === u.id;
                return (
                  <li key={u.id} className="flex items-center gap-1 pr-1">
                    <label
                      className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-slate-900 ${
                        checked ? 'bg-brand-500/10 text-brand-200' : 'text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(u.id)}
                        disabled={disabled || isAdding}
                        className="h-3.5 w-3.5 shrink-0 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500/40 focus:ring-offset-0"
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{u.username}</span>
                      <span className="shrink-0 tabular-nums text-xs text-slate-500">
                        {u.rankPoints} pts
                      </span>
                    </label>
                    {onQuickAdd && (
                      <button
                        type="button"
                        onClick={() => onQuickAdd(u.id)}
                        disabled={disabled || isAdding}
                        className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand-300 transition hover:bg-brand-500/15 disabled:opacity-60"
                      >
                        {isAdding ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                      </button>
                    )}
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{
    userId: string;
    username: string;
    isGuest: boolean;
  } | null>(null);
  const [removeError, setRemoveError] = useState('');
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [successToastTitle, setSuccessToastTitle] = useState('');
  const [successToastBody, setSuccessToastBody] = useState('');

  const bulkPreview = useMemo(() => parseBulkParticipantLines(bulkInput), [bulkInput]);

  function addAccounts(userIds: string[]) {
    if (userIds.length === 0 || isPending) return;
    setError('');
    startTransition(async () => {
      try {
        await addPlayersToTournament(tournamentId, userIds);
        setSelectedUserIds((prev) => prev.filter((id) => !userIds.includes(id)));
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add players.');
      }
    });
  }

  function quickAddAccount(userId: string) {
    if (isPending) return;
    setAddingUserId(userId);
    setError('');
    startTransition(async () => {
      try {
        await addPlayersToTournament(tournamentId, [userId]);
        setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add player.');
      } finally {
        setAddingUserId(null);
      }
    });
  }

  function addGuest() {
    const name = normalizeGuestDisplayName(customName);
    if (!name || isPending) return;
    setError('');
    startTransition(async () => {
      try {
        await addGuestPlayerToTournament(tournamentId, name);
        setCustomName('');
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add player.');
      }
    });
  }

  function addBulk() {
    if (bulkPreview.length === 0 || isPending) return;
    setError('');
    startTransition(async () => {
      try {
        const result = await addBulkParticipantsToTournament(tournamentId, bulkInput);
        setBulkInput('');
        const parts: string[] = [];
        if (result.accounts > 0) {
          parts.push(
            `${result.accounts} account${result.accounts === 1 ? '' : 's'}`,
          );
        }
        if (result.walkIns > 0) {
          parts.push(`${result.walkIns} walk-in${result.walkIns === 1 ? '' : 's'}`);
        }
        setSuccessToastTitle('Players added');
        setSuccessToastBody(
          parts.length > 0
            ? `Added ${parts.join(' and ')} to the tournament.`
            : `Added ${result.added} player${result.added === 1 ? '' : 's'}.`,
        );
        setSuccessToastOpen(true);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to add players.');
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
    const { userId, username } = removeTarget;
    setError('');
    setRemoveError('');
    startTransition(async () => {
      try {
        await removePlayerFromTournament(tournamentId, userId);
        setRemoveTarget(null);
        setSuccessToastTitle('Player removed');
        setSuccessToastBody(`${username} was removed from the tournament.`);
        setSuccessToastOpen(true);
        router.refresh();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to remove player.';
        setRemoveError(message);
        setError(message);
      }
    });
  }

  return (
    <div className="space-y-5">
      <SuccessToast
        open={successToastOpen}
        title={successToastTitle}
        body={successToastBody}
        onDismiss={() => setSuccessToastOpen(false)}
      />

      <RemovePlayerConfirmModal
        open={removeTarget !== null}
        playerName={removeTarget?.username ?? ''}
        isGuest={removeTarget?.isGuest ?? false}
        onClose={closeRemoveConfirm}
        onConfirm={confirmRemove}
        isPending={isPending && removeTarget !== null}
        error={removeError}
      />

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
              Click <span className="font-semibold text-slate-400">Add</span> next to a player, or select several and use Add selected.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <PlayerSelectDropdown
              users={availableUsers}
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              onQuickAdd={quickAddAccount}
              addingUserId={addingUserId}
              disabled={isPending || availableUsers.length === 0}
            />
            <button
              type="button"
              onClick={() => addAccounts(selectedUserIds)}
              disabled={isPending || selectedUserIds.length === 0}
              className="btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 disabled:opacity-60 sm:w-auto"
            >
              {isPending && selectedUserIds.length > 0 && addingUserId === null ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Adding…
                </>
              ) : selectedUserIds.length > 1 ? (
                `Add ${selectedUserIds.length}`
              ) : (
                'Add selected'
              )}
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
                disabled={isPending}
                className="input min-w-0 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGuest();
                  }
                }}
              />
              <button
                type="button"
                onClick={addGuest}
                disabled={isPending || !customName.trim()}
                className="btn-secondary inline-flex w-full shrink-0 items-center justify-center gap-2 disabled:opacity-60 sm:w-auto"
              >
                {isPending && customName.trim() ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Adding…
                  </>
                ) : (
                  'Add walk-in'
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">
              Walk-in names are only for this tournament — not UGNCBBX accounts and not on rankings.
            </p>
          </div>

          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div>
            <label htmlFor="bulk-participants" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bulk add
            </label>
            <textarea
              id="bulk-participants"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={'One name per line (commas work too)\nJubert\ntokeng\nNew walk-in name'}
              disabled={isPending}
              rows={5}
              className="input mt-2 min-h-[7.5rem] w-full resize-y font-mono text-sm leading-relaxed"
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-relaxed text-slate-600">
                Matches UGNCBBX accounts by username. Names without an account are added as walk-ins.
                {bulkPreview.length > 0 && (
                  <span className="mt-1 block font-medium text-slate-500">
                    {bulkPreview.length} name{bulkPreview.length === 1 ? '' : 's'} ready to add
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={addBulk}
                disabled={isPending || bulkPreview.length === 0}
                className="btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 disabled:opacity-60 sm:w-auto"
              >
                {isPending && bulkInput.trim() ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Adding…
                  </>
                ) : bulkPreview.length > 1 ? (
                  `Add ${bulkPreview.length} players`
                ) : (
                  'Add players'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <TournamentParticipantList
        participants={participants}
        emptyMessage={
          isAdmin && canManage
            ? 'No players registered yet. Use the form above to add players.'
            : 'No players registered yet.'
        }
        onRemove={isAdmin && canManage ? openRemoveConfirm : undefined}
        removeDisabled={isPending}
      />
    </div>
  );
}
