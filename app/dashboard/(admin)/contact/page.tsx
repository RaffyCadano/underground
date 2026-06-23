import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Mail, MessageSquare, User } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResolveContactMessageButton } from '@/app/dashboard/resolve-contact-message-button';
import { DeleteContactMessageButton } from '@/app/dashboard/delete-contact-message-button';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  account: 'Account',
  billing: 'Billing',
  tournament: 'Tournament',
  other: 'Other',
};

function formatWhen(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function DashboardContactPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [pending, resolved] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    }),
    prisma.contactMessage.findMany({
      where: { status: 'resolved' },
      orderBy: { resolvedAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Contact inbox</h2>
          <p className="mt-1 text-sm text-slate-400">
            Messages submitted from the public contact page.
          </p>
        </div>
        <Link href="/contact" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
          View public page
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-amber-200/80">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Recently resolved</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{resolved.length}</p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-sm font-semibold text-white">Pending messages</h3>
        {pending.length === 0 ? (
          <div className="card-muted mt-4 p-8 text-center text-sm text-slate-400">
            No pending contact messages.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{entry.subject}</p>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {CATEGORY_LABELS[entry.category] ?? entry.category}
                      </span>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <User size={12} />
                        {entry.name}
                      </span>
                      <a
                        href={`mailto:${entry.email}`}
                        className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200"
                      >
                        <Mail size={12} />
                        {entry.email}
                      </a>
                      {entry.user && (
                        <Link
                          href="/dashboard/accounts"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-300"
                        >
                          @{entry.user.username}
                        </Link>
                      )}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                      {entry.message}
                    </p>
                    <p className="mt-3 text-[11px] text-slate-600">{formatWhen(entry.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={`mailto:${entry.email}?subject=${encodeURIComponent(`Re: ${entry.subject}`)}`}
                      className="btn-secondary inline-flex items-center justify-center px-3 py-1.5 text-xs"
                    >
                      Reply by email
                    </a>
                    <ResolveContactMessageButton messageId={entry.id} />
                    <DeleteContactMessageButton messageId={entry.id} subject={entry.subject} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Recently resolved</h3>
          <div className="mt-4 space-y-3">
            {resolved.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 opacity-80"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <MessageSquare size={14} className="text-slate-600" />
                      <p className="font-medium text-slate-300">{entry.subject}</p>
                      <span className="text-xs text-slate-600">· {entry.name}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{entry.message}</p>
                    <p className="mt-2 text-[11px] text-slate-600">
                      Resolved {entry.resolvedAt ? formatWhen(entry.resolvedAt) : '—'}
                    </p>
                  </div>
                  <DeleteContactMessageButton messageId={entry.id} subject={entry.subject} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
