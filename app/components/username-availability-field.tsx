'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, User, XCircle } from 'lucide-react';
import { checkUsernameAvailability } from '@/app/actions/username';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  validateUsername,
} from '@/lib/username';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function UsernameAvailabilityField({
  id = 'username',
  name = 'username',
  value,
  onChange,
  onStatusChange,
  disabled,
  placeholder = 'BladeQueen',
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onStatusChange?: (status: UsernameStatus) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const trimmed = value.trim();

    if (!trimmed) {
      setStatus('idle');
      setMessage('');
      return;
    }

    const validationError = validateUsername(trimmed);
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
        const result = await checkUsernameAvailability(trimmed);
        if (cancelled || value.trim() !== trimmed) return;

        if (result.available) {
          setStatus('available');
          setMessage('Username is available.');
          return;
        }

        setStatus(result.error?.includes('taken') ? 'taken' : 'invalid');
        setMessage(result.error ?? 'Username is not available.');
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

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

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        Username
      </label>
      <div className="relative">
        <User
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          id={id}
          type="text"
          name={name}
          required
          minLength={USERNAME_MIN_LENGTH}
          maxLength={USERNAME_MAX_LENGTH}
          pattern={USERNAME_PATTERN.source}
          title="Letters, numbers, underscores, and hyphens only. No spaces."
          autoComplete="username"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={status === 'taken' || status === 'invalid'}
          aria-describedby={`${id}-hint ${id}-status`}
          className={`input pl-9 pr-10 ${inputBorderClass}`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {status === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
          {status === 'available' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {(status === 'taken' || status === 'invalid') && <XCircle size={16} className="text-red-400" />}
        </span>
      </div>
      <p id={`${id}-hint`} className="text-xs text-slate-500">
        Letters, numbers, underscores, and hyphens only. No spaces.
      </p>
      {message && status !== 'idle' && (
        <p id={`${id}-status`} className={`text-xs font-medium ${messageClass}`} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}

export type { UsernameStatus };
