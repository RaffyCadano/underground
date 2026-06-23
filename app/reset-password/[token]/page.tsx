import { KeyRound } from 'lucide-react';
import { findValidResetToken } from '@/lib/password-reset';
import { ResetPasswordForm, ResetPasswordMobileHeader } from './reset-password-form';
import {
  ResetPasswordInvalidLink,
  ResetPasswordInvalidSidebar,
} from './reset-password-invalid-link';
import { ResetPasswordValidSidebar } from './reset-password-valid-sidebar';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = token ? await findValidResetToken(token) : null;

  if (!record) {
    return (
      <div className="w-full overflow-x-hidden">
        <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(239,68,68,0.08),transparent)]" />
          <div className="pointer-events-none absolute -right-32 top-1/4 hidden h-96 w-96 rounded-full bg-red-500/5 blur-3xl sm:block" />

          <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
            <div className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24">
              <ResetPasswordInvalidSidebar />

              <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
                <div className="mb-5 text-center sm:mb-6 lg:hidden">
                  <p className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-300">
                    <KeyRound size={12} />
                    Link unavailable
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">
                    Link expired or invalid
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                    Request a new reset link and we&apos;ll email you fresh instructions.
                  </p>
                </div>

                <ResetPasswordInvalidLink />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.12),transparent)]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 hidden h-96 w-96 rounded-full bg-brand-500/5 blur-3xl sm:block" />

        <div className="container relative flex flex-col py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:justify-center lg:py-16">
          <div className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <ResetPasswordValidSidebar />

            <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <ResetPasswordMobileHeader />
              <ResetPasswordForm token={token} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
