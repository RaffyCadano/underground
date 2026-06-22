'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { requestClub } from '@/app/actions/clubs';

type Props = {
  defaultContactName?: string;
  defaultContactEmail?: string;
  isLoggedIn?: boolean;
};

export function ClubRequestForm({
  defaultContactName = '',
  defaultContactEmail = '',
  isLoggedIn = false,
}: Props) {
  const [state, action, pending] = useActionState(requestClub, null);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center sm:p-6">
        <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
        <h3 className="mt-3 text-base font-semibold text-white">Request submitted</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Thanks — the UGNCBBX team will review your club request and reach out by email if we
          need anything else.
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="club-request-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Club name *
          </label>
          <input
            id="club-request-name"
            name="clubName"
            type="text"
            required
            placeholder="Carolina Spin Syndicate"
            className="input mt-2"
          />
        </div>

        <div>
          <label htmlFor="club-request-region" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Region *
          </label>
          <input
            id="club-request-region"
            name="region"
            type="text"
            required
            placeholder="Charlotte, NC"
            className="input mt-2"
          />
        </div>

        <div>
          <label htmlFor="club-request-captain" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Captain / lead
          </label>
          <input
            id="club-request-captain"
            name="captain"
            type="text"
            placeholder="Username or display name"
            className="input mt-2"
          />
        </div>

        <div>
          <label htmlFor="club-request-members" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Approx. members
          </label>
          <input
            id="club-request-members"
            name="memberCount"
            type="number"
            min={0}
            placeholder="12"
            className="input mt-2"
          />
        </div>

        <div>
          <label htmlFor="club-request-contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your name
          </label>
          <input
            id="club-request-contact-name"
            name="contactName"
            type="text"
            defaultValue={defaultContactName}
            placeholder="How we should address you"
            className="input mt-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="club-request-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Contact email *
          </label>
          <input
            id="club-request-email"
            name="contactEmail"
            type="email"
            required
            defaultValue={defaultContactEmail}
            readOnly={isLoggedIn && Boolean(defaultContactEmail)}
            placeholder="you@example.com"
            className={`input mt-2 ${isLoggedIn && defaultContactEmail ? 'opacity-80' : ''}`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="club-request-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tell us about your club
          </label>
          <textarea
            id="club-request-message"
            name="message"
            rows={4}
            placeholder="Where you meet, how often you run locals, social links…"
            className="textarea mt-2"
          />
        </div>
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-slate-500">
          Already on UGNCBBX?{' '}
          <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Sign in
          </Link>{' '}
          to submit with your account email.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {pending ? 'Submitting…' : 'Request club listing'}
      </button>
    </form>
  );
}
