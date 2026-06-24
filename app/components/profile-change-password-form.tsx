'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { changePassword } from '@/app/actions/auth';
import { PasswordInput } from '@/app/components/password-input';
import { SuccessToast } from '@/app/components/success-toast';

const SECURITY_TIPS = [
  'Use at least 8 characters with a mix of letters and numbers.',
  'Avoid passwords you use on other sites.',
  'You will stay signed in on this device after updating.',
];

export function ProfileChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;
    if (!state?.success || !state.message) return;

    setSuccessToastOpen(true);
    formRef.current?.reset();
  }, [state]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-black/20">
      <SuccessToast
        open={successToastOpen}
        title="Password updated"
        body={state?.message ?? 'Your password has been changed.'}
        onDismiss={() => setSuccessToastOpen(false)}
      />
      <div className="relative border-b border-slate-800/80 bg-gradient-to-br from-sky-500/15 via-slate-900 to-slate-950 px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_0%_0%,rgba(56,189,248,0.12),transparent_60%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 shadow-inner shadow-sky-950/20">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">Password & security</h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-400">
                Keep your UGNCBBX account secure. Choose a strong password only you know.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400">
            <Lock size={12} className="text-sky-400" />
            Encrypted sign-in
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:divide-x lg:divide-slate-800/80">
        <aside className="border-b border-slate-800/80 p-5 sm:p-8 lg:border-b-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Good practices
          </p>
          <ul className="mt-4 space-y-3">
            {SECURITY_TIPS.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400/80" />
                {tip}
              </li>
            ))}
          </ul>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-sky-300"
          >
            <KeyRound size={14} />
            Forgot your current password?
          </Link>
        </aside>

        <form ref={formRef} action={action} className="space-y-5 p-5 sm:p-8">
          {state?.error && (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <label
              htmlFor="current-password"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Current password
            </label>
            <PasswordInput
              id="current-password"
              name="currentPassword"
              required
              autoComplete="current-password"
              placeholder="Enter your current password"
              disabled={pending}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                New password
              </label>
              <PasswordInput
                id="new-password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                Confirm password
              </label>
              <PasswordInput
                id="confirm-password"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat new password"
                disabled={pending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto sm:min-w-[11rem] disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  Update password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
