'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, LockKeyhole, Shield } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';
import { PasswordInput } from '@/app/components/password-input';
import { SiteLogo } from '@/app/components/site-logo';

const tips = [
  { icon: LockKeyhole, text: 'Use a password you have not used here before' },
  { icon: Shield, text: 'This link expires one hour after it was sent' },
  { icon: KeyRound, text: 'You will sign in on the next page' },
];

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="relative p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <SiteLogo size="card" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90 sm:text-[11px]">
              Account recovery
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Choose a new password</h1>
          </div>
        </div>

        <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-slate-950/80 to-emerald-500/5 px-4 py-4 sm:px-5">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/15 text-brand-400">
              <LockKeyhole size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-200">Your reset link is valid</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Enter a new password for your UGNCBBX account. You&apos;ll sign in with it on the next page.
              </p>
            </div>
          </div>
        </div>

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
            <p className="text-xs text-slate-500">Minimum 8 characters. Longer passwords are stronger.</p>
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

        <ul className="mt-6 grid gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3">
          {tips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5 sm:flex-col sm:items-start sm:gap-2 sm:p-3"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-brand-400">
                <Icon size={14} />
              </span>
              <span className="text-xs leading-snug text-slate-500">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Sign in
            </Link>
          </p>
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

export function ResetPasswordMobileHeader() {
  return (
    <div className="mb-5 text-center sm:mb-6 lg:hidden">
      <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
        <KeyRound size={12} />
        Account recovery
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">
        Choose a new password
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
        Set a secure password, then sign back in to your dashboard and tournaments.
      </p>
    </div>
  );
}
