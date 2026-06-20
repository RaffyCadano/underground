'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  Shield,
  UserPlus,
} from 'lucide-react';
import { requestPasswordReset } from '@/app/actions/auth';
import { SiteLogo } from '@/app/components/site-logo';

const steps = [
  {
    step: '01',
    title: 'Enter your email',
    body: 'Use the address tied to your Underground blader account.',
  },
  {
    step: '02',
    title: 'Check your inbox',
    body: 'We will send a secure link to reset your password when email recovery is enabled.',
  },
  {
    step: '03',
    title: 'Set a new password',
    body: 'Choose a strong password, then sign in and rejoin the circuit.',
  },
];

const tips = [
  { icon: Mail, text: 'Use the same email you registered with' },
  { icon: LockKeyhole, text: 'Reset links expire for your security' },
  { icon: Shield, text: 'Contact an admin if you are still locked out' },
];

function RecoveryForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

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
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Reset password</h1>
          </div>
        </div>

        {state?.success ? (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 sm:px-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
              <p className="text-sm leading-relaxed text-emerald-300">{state.message}</p>
            </div>
            <Link
              href="/login"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 sm:py-2.5"
            >
              Back to sign in
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slate-400">
              Enter your account email and we&apos;ll help you get back into your dashboard, tournaments, and
              rankings.
            </p>

            <form action={action} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {state?.error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 sm:px-4">
                  {state.error}
                </p>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="input pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60 sm:py-2.5"
              >
                {pending ? (
                  'Sending…'
                ) : (
                  <>
                    Send reset link
                    <KeyRound size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-slate-400">
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Create one free
            </Link>
          </p>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-400"
          >
            <ArrowLeft size={12} className="shrink-0" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileTips() {
  return (
    <div className="mt-6 space-y-4 sm:mt-8 lg:hidden">
      <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {tips.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 sm:flex-col sm:items-start sm:gap-2 sm:p-3"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-brand-400 sm:h-9 sm:w-9">
              <Icon size={15} />
            </span>
            <span className="text-xs leading-snug text-slate-400 sm:text-[11px]">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 hidden h-96 w-96 rounded-full bg-brand-500/5 blur-3xl sm:block" />

        <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
          <div className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left — branding (desktop) */}
            <div className="hidden min-w-0 lg:block">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                <KeyRound size={12} />
                Account recovery
              </p>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Get back on the Underground circuit.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
                Reset your password to access your dashboard, tournament brackets, and ranking profile.
              </p>

              <div className="mt-10 space-y-4">
                {steps.map(({ step, title, body }) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700"
                  >
                    <span className="font-mono text-2xl font-bold leading-none text-slate-700">{step}</span>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/login" className="btn-secondary inline-flex items-center gap-2 text-sm">
                  <ArrowLeft size={15} />
                  Back to sign in
                </Link>
                <Link href="/register" className="btn-ghost inline-flex items-center gap-2 text-sm">
                  <UserPlus size={15} />
                  Create account
                </Link>
              </div>
            </div>

            {/* Right — form + mobile extras */}
            <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="mb-5 text-center sm:mb-6 lg:hidden">
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <KeyRound size={12} />
                  Account recovery
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">
                  Reset your password
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                  Enter your email and we&apos;ll send instructions to regain access.
                </p>
              </div>

              <RecoveryForm />
              <MobileTips />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
