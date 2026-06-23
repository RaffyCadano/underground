import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ArrowLeft, Clock, Mail, MessageSquare, Shield } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { SITE_NAME } from '@/lib/site';
import { ContactForm } from './contact-form';

export const metadata = {
  title: `Contact | ${SITE_NAME}`,
  description: `Get in touch with the ${SITE_NAME} team for account help, billing questions, and tournament support.`,
};

const topics = [
  {
    icon: Shield,
    title: 'Account & access',
    body: 'Password resets, login issues, profile changes, and organizer requests.',
  },
  {
    icon: MessageSquare,
    title: 'Tournaments & events',
    body: 'Bracket questions, registration help, and community club listings.',
  },
  {
    icon: Clock,
    title: 'Typical response',
    body: 'We review messages in the admin dashboard and reply by email when follow-up is needed.',
  },
];

export default async function ContactPage() {
  const session = await getServerSession(authOptions);

  let defaultName = '';
  let defaultEmail = session?.user?.email ?? '';

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, email: true, fullName: true },
    });
    if (user) {
      defaultName = user.fullName?.trim() || user.username;
      defaultEmail = user.email;
    }
  }

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative border-b border-slate-800 py-0 lg:min-h-[calc(100vh-8rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 hidden h-96 w-96 rounded-full bg-brand-500/5 blur-3xl sm:block" />

        <div className="container relative py-8 sm:py-12 lg:min-h-[calc(100vh-8rem)] lg:py-16">
          <ScrollReveal>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to home
            </Link>
          </ScrollReveal>

          <div className="mt-6 grid min-w-0 gap-8 lg:mt-10 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-24">
            <div className="min-w-0">
              <ScrollReveal direction="left">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  <Mail size={12} />
                  Contact
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Get in touch with {SITE_NAME}
                </h1>
                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
                  Questions about your account, Premier billing, tournaments, or the community? Send us a
                  message and we&apos;ll get back to you by email.
                </p>

                <div className="mt-10 space-y-4">
                  {topics.map(({ icon: Icon, title, body }) => (
                    <div
                      key={title}
                      className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-brand-400">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm text-slate-400">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-sm text-slate-500">
                  For password resets, use{' '}
                  <Link href="/forgot-password" className="font-semibold text-brand-300 hover:text-brand-200">
                    forgot password
                  </Link>{' '}
                  on the sign-in page for the fastest path back into your account.
                </p>
              </ScrollReveal>
            </div>

            <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <ScrollReveal direction="right">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/20">
                  <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                  <div className="p-5 sm:p-8">
                    <h2 className="text-lg font-semibold text-white">Send a message</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      All fields marked with * are required.
                    </p>
                    <div className="mt-6">
                      <ContactForm
                        defaultName={defaultName}
                        defaultEmail={defaultEmail}
                        isLoggedIn={Boolean(session)}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
