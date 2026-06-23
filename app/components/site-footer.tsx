import Link from 'next/link';
import type { Session } from 'next-auth';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Info,
  Layers,
  LayoutDashboard,
  LogIn,
  Mail,
  Shield,
  Swords,
  Trophy,
  User,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
import { SiteLogo } from '@/app/components/site-logo';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

const circuitLinks = [
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: UsersRound },
];

const platformLinks = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/features', label: 'Features', icon: Layers },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/contact', label: 'Contact', icon: Mail },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/refund-policy', label: 'Refunds' },
];

const formatChips = ['Swiss', 'Single elim', 'Double elim', 'Round robin'];

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; icon?: LucideIcon }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <ul className="mt-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              {Icon && (
                <Icon size={15} className="shrink-0 text-slate-600 transition group-hover:text-brand-400" />
              )}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ session }: { session: Session | null }) {
  const isLoggedIn = Boolean(session);

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-800 bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-brand-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-8 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="container relative">
        {/* CTA strip */}
        <div className="border-b border-slate-800/80 py-8 sm:py-10">
          <div className="flex flex-col gap-5 rounded-2xl border border-brand-500/15 bg-gradient-to-br from-brand-500/10 via-slate-950 to-slate-950 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400">
                <Swords size={12} />
                North Carolina circuit
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                Ready to compete on {SITE_NAME}?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{SITE_DESCRIPTION}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="btn-primary inline-flex h-10 items-center justify-center gap-2 px-5"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-primary inline-flex h-10 items-center justify-center gap-2 px-5"
                  >
                    Create account
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary inline-flex h-10 items-center justify-center gap-2 px-5"
                  >
                    <LogIn size={16} />
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid gap-6 py-10 sm:gap-8 lg:grid-cols-12 lg:py-12">
          <div className="space-y-5 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3 transition hover:opacity-95">
              <SiteLogo size="card" />
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-white transition group-hover:text-brand-100">
                  {SITE_NAME}
                </p>
                <p className="text-xs text-slate-500">Underground North Carolina Beyblade X</p>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Run brackets, report scores, and climb the rankings — built for local shops, organizers, and
              bladers across NC.
            </p>
            <div className="flex flex-wrap gap-2">
              {formatChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:gap-5">
            <FooterLinkGroup title="Circuit" links={circuitLinks} />
            <FooterLinkGroup title="Platform" links={platformLinks} />
          </div>

          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Account</p>
              <ul className="mt-3 space-y-0.5">
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link
                        href="/dashboard"
                        className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                      >
                        <LayoutDashboard size={15} className="text-slate-600 group-hover:text-brand-400" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                      >
                        <User size={15} className="text-slate-600 group-hover:text-brand-400" />
                        Profile settings
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                      >
                        <LogIn size={15} className="text-slate-600 group-hover:text-brand-400" />
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                      >
                        <UserPlus size={15} className="text-slate-600 group-hover:text-brand-400" />
                        Register free
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Shield size={12} className="text-brand-500/80" />
                Legal
              </p>
              <nav aria-label="Legal" className="mt-3 flex flex-wrap gap-2">
                {legalLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-slate-800/80 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 sm:text-right">
            Beyblade X tournament management &amp; rankings for North Carolina.
          </p>
        </div>
      </div>
    </footer>
  );
}
