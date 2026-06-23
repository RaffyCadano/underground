import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  KeyRound,
  Link2Off,
  Mail,
  RefreshCw,
  Shield,
  UserPlus,
} from 'lucide-react';
import { SiteLogo } from '@/app/components/site-logo';

const reasons = [
  {
    icon: Clock,
    title: 'Link expired',
    body: 'Reset links are valid for one hour after they are sent.',
  },
  {
    icon: RefreshCw,
    title: 'Already used',
    body: 'Each link works once. If you already reset, sign in with your new password.',
  },
  {
    icon: Link2Off,
    title: 'Broken or incomplete',
    body: 'Email clients sometimes truncate long URLs. Request a fresh link instead.',
  },
];

const tips = [
  { icon: Mail, text: 'Check spam and promotions folders' },
  { icon: Shield, text: 'Only the latest reset link stays active' },
  { icon: KeyRound, text: 'Links are tied to the email on your account' },
];

export function ResetPasswordInvalidLink() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="h-1 bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />

      <div className="relative p-5 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <SiteLogo size="card" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/90 sm:text-[11px]">
              Account recovery
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Link expired or invalid</h1>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-slate-950/80 to-amber-500/5 px-4 py-4 sm:px-5">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15 text-red-400">
              <KeyRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-200">This reset link cannot be used</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Request a new one and we&apos;ll email you fresh instructions. Your account is still safe.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2.5 sm:mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Common reasons</p>
          <ul className="space-y-2">
            {reasons.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 sm:px-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <Link
            href="/forgot-password"
            className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 sm:flex-1 sm:py-2.5"
          >
            Request new link
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 py-3 sm:flex-1 sm:py-2.5"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>

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

        <div className="mt-6 space-y-3 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-sm text-slate-400">
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-brand-300 transition hover:text-brand-200">
              Create one free
            </Link>
          </p>
          <p className="text-center text-xs text-slate-500">
            Still locked out?{' '}
            <Link href="/contact" className="font-semibold text-brand-300 hover:text-brand-200">
              Contact us
            </Link>{' '}
            for help.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordInvalidSidebar() {
  return (
    <div className="hidden min-w-0 lg:block">
      <p className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-300">
        <KeyRound size={12} />
        Link unavailable
      </p>
      <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
        Let&apos;s get you a fresh reset link.
      </h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
        Password reset links expire quickly to keep your UGNCBBX account secure. Start over and we&apos;ll send a new
        one to your inbox.
      </p>

      <div className="mt-10 space-y-4">
        {reasons.map(({ icon: Icon, title, body }, index) => (
          <div
            key={title}
            className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700"
          >
            <span className="font-mono text-2xl font-bold leading-none text-slate-700">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400">
                <Icon size={16} />
              </span>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/forgot-password" className="btn-primary inline-flex items-center gap-2 text-sm">
          Request new link
          <ArrowRight size={15} />
        </Link>
        <Link href="/register" className="btn-ghost inline-flex items-center gap-2 text-sm">
          <UserPlus size={15} />
          Create account
        </Link>
      </div>
    </div>
  );
}
