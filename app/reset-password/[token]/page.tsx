import Link from 'next/link';
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole } from 'lucide-react';
import { findValidResetToken } from '@/lib/password-reset';
import { ResetPasswordForm } from './reset-password-form';

function InvalidLink() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
      <div className="p-5 text-center sm:p-8 lg:p-10">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
          <LockKeyhole size={22} />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-white sm:text-2xl">Link expired or invalid</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
          This password reset link is no longer valid. Request a new one and we&apos;ll email you fresh
          instructions.
        </p>
        <Link
          href="/forgot-password"
          className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          Request new link
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-300"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = token ? await findValidResetToken(token) : null;

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
          <div className="mx-auto w-full min-w-0 max-w-md">
            <div className="mb-5 text-center sm:mb-6 lg:hidden">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                <KeyRound size={12} />
                Account recovery
              </p>
            </div>
            {record ? <ResetPasswordForm token={token} /> : <InvalidLink />}
          </div>
        </div>
      </section>
    </div>
  );
}
