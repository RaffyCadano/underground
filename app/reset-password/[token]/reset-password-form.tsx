'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';
import { PasswordInput } from '@/app/components/password-input';
import { SiteLogo } from '@/app/components/site-logo';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <SiteLogo size="card" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90 sm:text-[11px]">
              Account recovery
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Choose a new password</h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-400">
          Enter a new password for your UGNCBBX account. You&apos;ll sign in with it on the next page.
        </p>

        <form action={action} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <input type="hidden" name="token" value={token} />

          {state?.error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 sm:px-4">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-300">
              Confirm password
            </label>
            <PasswordInput
              id="confirm"
              name="confirm"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60 sm:py-2.5"
          >
            {pending ? 'Updating…' : 'Update password'}
            <KeyRound size={16} />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <Link
            href="/forgot-password"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-400"
          >
            <ArrowLeft size={12} className="shrink-0" />
            Request a new reset link
          </Link>
        </div>
      </div>
    </div>
  );
}
