'use client';

import { useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginWithCredentials } from '@/app/actions/auth';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LogIn,
  Mail,
  Shield,
  Swords,
  Trophy,
} from 'lucide-react';
import { PasswordInput } from '@/app/components/password-input';
import { SiteLogo } from '@/app/components/site-logo';

const perks = [
  { icon: Trophy, text: 'Register for open tournaments' },
  { icon: Swords, text: 'Report match results live' },
  { icon: BarChart3, text: 'Track your circuit ranking' },
];

function LoginForm() {
  const [state, action, pending] = useActionState(loginWithCredentials, null);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');
  const callbackUrl = searchParams.get('callbackUrl');
  const safeCallback =
    callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/dashboard';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <SiteLogo size="card" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90 sm:text-[11px]">
              Member access
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Sign in</h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-400">
          Welcome back — enter your credentials to access your dashboard, tournaments, and rankings.
        </p>

        {registered && (
          <div className="mt-4 flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 sm:mt-5 sm:px-4">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              Account created successfully. Sign in below to get started.
            </p>
          </div>
        )}

        {reset && (
          <div className="mt-4 flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 sm:mt-5 sm:px-4">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              Password updated. Sign in with your new password.
            </p>
          </div>
        )}

        <form action={action} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <input type="hidden" name="callbackUrl" value={safeCallback} />
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-brand-300 transition hover:text-brand-200"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60 sm:py-2.5"
          >
            {pending ? (
              'Signing in…'
            ) : (
              <>
                Sign in
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-sm text-slate-400">
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Create one free
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Shield size={12} className="shrink-0 text-slate-600" />
            Secure credentials-only sign in
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8 lg:p-10">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
      <div className="mt-6 h-8 w-40 animate-pulse rounded-lg bg-slate-800 sm:mt-8 sm:w-48" />
      <div className="mt-5 space-y-4 sm:mt-6">
        <div className="h-10 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-11 animate-pulse rounded-lg bg-slate-800" />
      </div>
    </div>
  );
}

function MobilePerks() {
  return (
    <div className="mt-6 space-y-4 sm:mt-8 lg:hidden">
      <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {perks.map(({ icon: Icon, text }) => (
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

      <div className="flex flex-col gap-2 min-[480px]:flex-row">
        <Link
          href="/tournaments"
          className="btn-secondary inline-flex w-full items-center justify-center gap-2 text-sm min-[480px]:flex-1"
        >
          <Trophy size={15} />
          Browse tournaments
        </Link>
        <Link
          href="/rankings"
          className="btn-ghost inline-flex w-full items-center justify-center gap-2 text-sm min-[480px]:flex-1"
        >
          <BarChart3 size={15} />
          View rankings
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="pointer-events-none absolute -right-32 top-1/3 hidden h-96 w-96 rounded-full bg-brand-500/5 blur-3xl sm:block" />

        <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
          <div className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left — branding (desktop) */}
            <div className="hidden min-w-0 lg:block">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                <LogIn size={12} />
                UGNCBBX circuit
              </p>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Pick up where you left off on the circuit.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
                Access your dashboard, join brackets, and climb the rankings — all from one account.
              </p>

              <ul className="mt-10 space-y-4">
                {perks.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-slate-300">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-brand-400">
                      <Icon size={16} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/tournaments" className="btn-secondary inline-flex items-center gap-2 text-sm">
                  <Trophy size={15} />
                  Browse tournaments
                </Link>
                <Link href="/rankings" className="btn-ghost inline-flex items-center gap-2 text-sm">
                  <BarChart3 size={15} />
                  View rankings
                </Link>
              </div>
            </div>

            {/* Right — form + mobile extras */}
            <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="mb-5 text-center sm:mb-6 lg:hidden">
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <LogIn size={12} />
                  Sign in
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">
                  Welcome back to UGNCBBX
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                  Enter your email and password to access your account.
                </p>
              </div>

              <Suspense fallback={<LoginFormFallback />}>
                <LoginForm />
              </Suspense>

              <MobilePerks />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
