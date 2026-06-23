'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitContactMessage } from '@/app/actions/contact';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General question' },
  { value: 'account', label: 'Account & login' },
  { value: 'billing', label: 'Billing & Premier' },
  { value: 'tournament', label: 'Tournaments & events' },
  { value: 'other', label: 'Something else' },
];

type Props = {
  defaultName?: string;
  defaultEmail?: string;
  isLoggedIn?: boolean;
};

export function ContactForm({
  defaultName = '',
  defaultEmail = '',
  isLoggedIn = false,
}: Props) {
  const [state, action, pending] = useActionState(submitContactMessage, null);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center sm:p-6">
        <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
        <h3 className="mt-3 text-base font-semibold text-white">Message sent</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Thanks for reaching out. The UGNCBBX team will review your message and reply to the email
          you provided.
        </p>
        <Link href="/" className="btn-secondary mt-5 inline-flex items-center justify-center text-sm">
          Back to home
        </Link>
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
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your name *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            placeholder="How we should address you"
            className="input mt-2"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Email *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            readOnly={isLoggedIn && Boolean(defaultEmail)}
            defaultValue={defaultEmail}
            placeholder="you@example.com"
            className="input mt-2 read-only:cursor-not-allowed read-only:opacity-80"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Topic
          </label>
          <select id="contact-category" name="category" defaultValue="general" className="input mt-2">
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Subject *
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            maxLength={200}
            placeholder="Brief summary of your question"
            className="input mt-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Message *
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            placeholder="Tell us how we can help…"
            className="input mt-2 resize-y"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60 sm:py-2.5"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}
