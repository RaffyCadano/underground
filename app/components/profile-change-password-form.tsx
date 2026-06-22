'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { changePassword } from '@/app/actions/auth';
import { PasswordInput } from '@/app/components/password-input';

export function ProfileChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4 sm:px-6">
        <p className="text-sm font-semibold text-white">Password</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Update your sign-in password. You&apos;ll stay signed in on this device.
        </p>
      </div>

      <form action={action} className="space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6">
        {state?.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-300">
            {state.error}
          </p>
        )}

        {state?.success && state.message && (
          <p className="flex items-start gap-2 rounded-lg border border-brand-500/25 bg-brand-500/10 px-3 py-2.5 text-sm text-brand-200">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            {state.message}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="current-password" className="block text-sm font-medium text-slate-300">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-300">
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
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">
              Confirm new password
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

        <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-slate-500 transition hover:text-brand-300"
          >
            Forgot your password?
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <KeyRound size={15} />
                Update password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
