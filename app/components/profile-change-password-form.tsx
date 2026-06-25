'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { changePassword } from '@/app/actions/auth';
import { PasswordInput } from '@/app/components/password-input';
import { SuccessToast } from '@/app/components/success-toast';

function FieldBlock({
  step,
  label,
  hint,
  children,
}: {
  step: string;
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/35 p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-[11px] font-bold tabular-nums text-brand-300">
          {step}
        </span>
        <div className="min-w-0 pt-0.5">
          <label className="text-sm font-semibold text-white">{label}</label>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

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
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/25">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-sky-500/8 blur-3xl" />
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <SuccessToast
        open={successToastOpen}
        title="Password updated"
        body={state?.message ?? 'Your password has been changed.'}
        onDismiss={() => setSuccessToastOpen(false)}
      />

      <div className="relative border-b border-slate-800/80 bg-gradient-to-br from-brand-500/10 via-slate-950 to-slate-950 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/15 text-brand-300 shadow-inner shadow-brand-950/30">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400/90">
                Account security
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Update your password</h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-400">
                Choose a strong password only you know.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-400">
            <Sparkles size={12} className="text-brand-400" />
            Encrypted sign-in
          </span>
        </div>
      </div>

      <form ref={formRef} action={action}>
        <div className="relative space-y-4 p-5 sm:p-8">
          {state?.error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {state.error}
            </p>
          )}

          <FieldBlock
              step="1"
              label="Current password"
              hint={
                <>
                  Required to confirm it&apos;s you.{' '}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-brand-300 transition hover:text-brand-200"
                  >
                    Forgot it?
                  </Link>
                </>
              }
            >
            <PasswordInput
              id="current-password"
              name="currentPassword"
              required
              autoComplete="current-password"
              placeholder="Enter current password"
              disabled={pending}
            />
          </FieldBlock>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldBlock
              step="2"
              label="New password"
              hint="At least 8 characters."
            >
              <PasswordInput
                id="new-password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={pending}
              />
            </FieldBlock>

            <FieldBlock step="3" label="Confirm password" hint="Must match your new password.">
              <PasswordInput
                id="confirm-password"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat new password"
                disabled={pending}
              />
            </FieldBlock>
          </div>
        </div>

        <div className="relative border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 sm:max-w-sm">
              Changes take effect immediately. Sign in on other devices with your new password.
            </p>
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
                  Update password
                  <KeyRound size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
