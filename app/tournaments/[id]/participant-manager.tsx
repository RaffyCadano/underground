'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
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
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isPending || availableUsers.length === 0}
              className="select flex-1"
            >
              <option value="">
                {availableUsers.length === 0 ? 'All players already added' : 'Select a player…'}
              </option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.rankPoints} pts)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !selectedUserId}
              className="btn-primary shrink-0 disabled:opacity-60"
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
