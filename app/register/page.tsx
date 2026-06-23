'use client';

import { useActionState, useState } from 'react';
import { registerUser } from '@/app/actions/auth';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Mail,
  Shield,
  Trophy,
  UserPlus,
  Zap,
} from 'lucide-react';
import { PasswordInput } from '@/app/components/password-input';
import { SiteLogo } from '@/app/components/site-logo';
import {
  UsernameAvailabilityField,
  type UsernameStatus,
} from '@/app/components/username-availability-field';

const steps = [
  { step: '01', title: 'Create your profile', body: 'Pick a blader name and set up your account in seconds.' },
  { step: '02', title: 'Enter a tournament', body: 'Browse open events and join Swiss or single-elim brackets.' },
  { step: '03', title: 'Climb the rankings', body: 'Report match results and earn rank points on the circuit.' },
];

function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, null);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const usernameReady = usernameStatus === 'available';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <SiteLogo size="card" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90 sm:text-[11px]">
              Join the circuit
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Create account</h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-400">
          Set up your blader profile to register for tournaments, report scores, and compete on UGNCBBX
          leaderboard.
        </p>

        <form action={action} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          {state?.error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 sm:px-4">
              {state.error}
            </p>
          )}

          <div className="grid gap-4 min-[480px]:grid-cols-2">
            <UsernameAvailabilityField
              value={username}
              onChange={setUsername}
              onStatusChange={setUsernameStatus}
              disabled={pending}
            />
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
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 min-[480px]:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="Min 8 characters"
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
                autoComplete="new-password"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !usernameReady}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60 sm:py-2.5"
          >
            {pending ? (
              'Creating account…'
            ) : (
              <>
                Create account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Sign in
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Shield size={12} className="shrink-0 text-slate-600" />
            Free to join — no credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileSteps() {
  return (
    <div className="mt-6 space-y-4 sm:mt-8 lg:hidden">
      <div className="space-y-2 sm:space-y-3">
        {steps.map(({ step, title, body }) => (
          <div
            key={step}
            className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:gap-4 sm:p-4"
          >
            <span className="shrink-0 font-mono text-xl font-bold leading-none text-slate-700 sm:text-2xl">
              {step}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white sm:text-base">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400 sm:mt-1 sm:text-sm">{body}</p>
            </div>
          </div>
        ))}
      </div>

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

export default function RegisterPage() {
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
                <UserPlus size={12} />
                UGNCBBX circuit
              </p>
              <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Join UGNCBBX and compete on game day.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
                Create a free blader profile, enter tournaments, and start climbing the circuit rankings.
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
            <div className="mx-auto w-full min-w-0 max-w-lg lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="mb-5 text-center sm:mb-6 lg:hidden">
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <Zap size={12} />
                  Join the circuit
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">
                  Create your UGNCBBX account
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                  Free to join — set up your blader profile in under a minute.
                </p>
              </div>

              <RegisterForm />

              <MobileSteps />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
