'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { saveStandardMaxHostedTournaments } from '@/app/actions/platform-settings';

export function StandardHostedTournamentsForm({
  initialValue,
}: {
  initialValue: number;
}) {
  const [value, setValue] = useState(String(initialValue));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      setError('Enter a valid whole number.');
      return;
    }

    startTransition(async () => {
      const result = await saveStandardMaxHostedTournaments(parsed);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="standard-max-hosted" className="block text-sm font-semibold text-white">
          Standard plan hosted tournament limit
        </label>
        <p className="mt-1 text-sm text-slate-400">
          How many tournaments each Standard (free) organizer can create. Premier and admin accounts
          are unlimited.
        </p>
        <input
          id="standard-max-hosted"
          type="number"
          min={1}
          max={999}
          step={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          disabled={isPending}
          className="input mt-3 max-w-xs"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {saved && !error && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Saved. New limit applies immediately for Standard organizers.
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Saving…
          </span>
        ) : (
          'Save limit'
        )}
      </button>
    </form>
  );
}
