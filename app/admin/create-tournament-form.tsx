'use client';

import { useActionState } from 'react';
import { createTournament } from '@/app/actions/tournaments';

export function CreateTournamentForm() {
  const [state, action, pending] = useActionState(createTournament, null);

  return (
    <div className="card p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Create tournament</h2>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300">Name *</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Storm Clash II"
            className="input mt-1"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">Date *</label>
            <input
              name="date"
              type="date"
              required
              className="input mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Location</label>
            <input
              name="location"
              type="text"
              placeholder="Charlotte, NC"
              className="input mt-1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Format</label>
          <select
            name="format"
            className="select mt-1"
          >
            <option value="single_elimination">Single Elimination</option>
            <option value="double_elimination">Double Elimination</option>
            <option value="swiss">Swiss Format</option>
            <option value="round_robin">Round Robin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Optional description"
            className="textarea mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full disabled:opacity-60"
        >
          {pending ? 'Creating...' : 'Create tournament'}
        </button>
      </form>
    </div>
  );
}
