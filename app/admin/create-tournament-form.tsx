'use client';

import { useActionState, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { createTournament } from '@/app/actions/tournaments';
import { generateTournamentDescription } from '@/lib/tournament-description';

export function CreateTournamentForm() {
  const [state, action, pending] = useActionState(createTournament, null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState('single_elimination');
  const [description, setDescription] = useState('');

  function handleGenerateDescription() {
    setDescription(
      generateTournamentDescription({
        name,
        date,
        location,
        format,
      }),
    );
  }

  const canGenerate = name.trim().length > 0 && date.length > 0;

  return (
    <div className="card p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Create tournament</h2>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>
        )}
        <div>
          <label htmlFor="tournament-name" className="block text-sm font-medium text-slate-300">
            Name *
          </label>
          <input
            id="tournament-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Storm Clash II"
            className="input mt-1"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tournament-date" className="block text-sm font-medium text-slate-300">
              Date *
            </label>
            <input
              id="tournament-date"
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="tournament-location" className="block text-sm font-medium text-slate-300">
              Location
            </label>
            <input
              id="tournament-location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Charlotte, NC"
              className="input mt-1"
            />
          </div>
        </div>
        <div>
          <label htmlFor="tournament-format" className="block text-sm font-medium text-slate-300">
            Format
          </label>
          <select
            id="tournament-format"
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="select mt-1"
          >
            <option value="single_elimination">Single Elimination</option>
            <option value="double_elimination">Double Elimination</option>
            <option value="swiss">Swiss Format</option>
            <option value="round_robin">Round Robin</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="tournament-description" className="block text-sm font-medium text-slate-300">
              Description
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={!canGenerate}
              title={canGenerate ? 'Generate description from form details' : 'Enter a name and date first'}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-300 transition hover:border-brand-400/40 hover:bg-brand-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={13} />
              Generate
            </button>
          </div>
          <textarea
            id="tournament-description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
