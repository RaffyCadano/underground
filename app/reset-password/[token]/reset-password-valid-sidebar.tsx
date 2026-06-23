import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, Shield, UserPlus } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Choose a strong password',
    body: 'Use at least 8 characters — mix letters, numbers, and symbols when you can.',
  },
  {
    step: '02',
    title: 'Confirm it matches',
    body: 'Type the same password twice so there are no typos before you save.',
  },
  {
    step: '03',
    title: 'Sign back in',
    body: "After updating, you'll return to sign in with your new credentials.",
  },
];

const requirements = [
  'At least 8 characters',
  'Different from your old password',
  'Easy for you to remember, hard for others to guess',
];

export function ResetPasswordValidSidebar() {
  return (
    <div className="hidden min-w-0 lg:block">
      <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
        <KeyRound size={12} />
        Account recovery
      </p>
      <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
        Almost back on the circuit.
      </h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
        Set a new password for your UGNCBBX account. Once saved, you can sign in to your dashboard,
        tournaments, and rankings.
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

      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Shield size={14} className="text-brand-400" />
          Password tips
        </p>
        <ul className="mt-3 space-y-2">
          {requirements.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-500/80" />
              {item}
            </li>
          ))}
        </ul>
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
  );
}
