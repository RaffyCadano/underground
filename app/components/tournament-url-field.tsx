'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Link2, RefreshCw, XCircle } from 'lucide-react';
import { checkTournamentSlugAvailability } from '@/app/actions/tournament-slug';
import {
  generateTournamentSlug,
  normalizeTournamentSlug,
  validateTournamentSlug,
} from '@/lib/tournament-slug';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function TournamentUrlField({
  id = 'tournament-slug',
  name = 'slug',
  value,
  onChange,
  permalinkPrefix,
  excludeTournamentId,
  lockSlug = false,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  permalinkPrefix: string;
  excludeTournamentId?: string;
  lockSlug?: boolean;
}) {
  const [status, setStatus] = useState<SlugStatus>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const normalized = normalizeTournamentSlug(value);

    if (!normalized) {
      setStatus('idle');
      setMessage('');
      return;
    }

    const validationError = validateTournamentSlug(normalized);
    if (validationError) {
      setStatus('invalid');
      setMessage(validationError);
      return;
    }

    setStatus('checking');
    setMessage('Checking availability…');

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const result = await checkTournamentSlugAvailability(normalized, excludeTournamentId);
        if (cancelled || normalizeTournamentSlug(value) !== normalized) return;

        if (result.available) {
          setStatus('available');
          setMessage(`${normalized} is available`);
          return;
        }

        setStatus(result.error?.includes('taken') ? 'taken' : 'invalid');
        setMessage(result.error ?? 'This URL is not available.');
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, excludeTournamentId]);

  const inputBorderClass =
    status === 'available'
      ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-500/30'
      : status === 'taken' || status === 'invalid'
        ? 'border-red-500/50 focus:border-red-400 focus:ring-red-500/30'
        : '';

  const messageClass =
    status === 'available'
      ? 'text-emerald-400'
      : status === 'taken' || status === 'invalid'
        ? 'text-red-400'
        : 'text-slate-500';

  function regenerateSlug() {
    onChange(generateTournamentSlug());
  }

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        URL
      </label>
      <div className="mt-2 flex flex-wrap items-stretch gap-2">
        <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 font-mono text-xs text-slate-500 sm:text-sm">
          {permalinkPrefix}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Link2
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id={id}
              name={lockSlug ? undefined : name}
              type="text"
              required
              value={value}
              onChange={(e) => onChange(normalizeTournamentSlug(e.target.value))}
              disabled={lockSlug}
              placeholder="ol4ugim4"
              className={`input w-full pl-9 pr-10 font-mono text-sm ${inputBorderClass} disabled:opacity-60`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {status === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
              {status === 'available' && <CheckCircle2 size={16} className="text-emerald-400" />}
              {(status === 'taken' || status === 'invalid') && (
                <XCircle size={16} className="text-red-400" />
              )}
            </span>
          </div>
          {!lockSlug && (
            <button
              type="button"
              onClick={regenerateSlug}
              className="btn-secondary shrink-0 px-3 py-2"
              title="Generate new URL"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>
      {lockSlug && <input type="hidden" name={name} value={value} />}
      {message && status !== 'idle' && (
        <p className={`mt-1.5 text-xs font-medium ${messageClass}`} role="status" aria-live="polite">
          {message}
        </p>
      )}
      {!message && (
        <p className="mt-1.5 text-xs text-slate-500">Letters and numbers only — this is your public tournament link.</p>
      )}
    </div>
  );
}
