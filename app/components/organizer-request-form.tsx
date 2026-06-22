'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { CheckCircle2, Loader2, LogIn, Send } from 'lucide-react';
import { requestOrganizerRole } from '@/app/actions/organizer-requests';

type Props = {
  isLoggedIn?: boolean;
};

export function OrganizerRequestForm({ isLoggedIn = true }: Props) {
  const [state, action, pending] = useActionState(requestOrganizerRole, null);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-center sm:p-6">
        <LogIn size={28} className="mx-auto text-sky-400" />
        <h3 className="mt-3 text-base font-semibold text-white">Sign in to apply</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Organizer requests are tied to your UGNCBBX account so we can update your role when
          approved.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2">
            <LogIn size={15} />
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary inline-flex items-center justify-center gap-2">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6">
        <CheckCircle2 size={28} className="text-emerald-400" />
        <h3 className="mt-3 text-base font-semibold text-white">Request submitted</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          The UGNCBBX team will review your organizer request and update your account if approved.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div>
        <label
          htmlFor="organizer-request-message"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Why do you want to be an organizer? *
        </label>
        <textarea
          id="organizer-request-message"
          name="message"
          rows={5}
          required
          minLength={20}
          placeholder="Tell us about events you've run, shops or clubs you work with, and what you'd like to host on UGNCBBX…"
          className="textarea mt-2"
        />
        <p className="mt-2 text-xs text-slate-500">
          Organizers can help run tournaments and events on the circuit. Include any relevant
          experience with Beyblade X locals, shops, or communities.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {pending ? 'Submitting…' : 'Request organizer access'}
      </button>
    </form>
  );
}
