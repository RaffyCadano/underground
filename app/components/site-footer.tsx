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

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; icon?: LucideIcon }[];
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              {Icon && (
                <Icon size={14} className="shrink-0 text-slate-600 transition group-hover:text-brand-400" />
              )}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterAccountLinks({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
      <ul className="mt-3 space-y-2">
        {isLoggedIn ? (
          <>
            <li>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
              >
                <LayoutDashboard size={14} className="text-slate-600 group-hover:text-brand-400" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
              >
                <User size={14} className="text-slate-600 group-hover:text-brand-400" />
                Profile settings
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
              >
                <LogIn size={14} className="text-slate-600 group-hover:text-brand-400" />
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
              >
                <UserPlus size={14} className="text-slate-600 group-hover:text-brand-400" />
                Register free
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

export function SiteFooter({ session }: { session: Session | null }) {
  const isLoggedIn = Boolean(session);

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950">
      <div className="container">
        <div className="hidden flex-col gap-6 border-b border-slate-800 py-8 lg:flex lg:flex-row lg:items-center lg:justify-between lg:py-10">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400">
              <Swords size={12} />
              North Carolina circuit
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Ready to compete on {SITE_NAME}?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{SITE_DESCRIPTION}</p>
          </div>
          <div className="flex shrink-0 flex-row gap-2">
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

        <div className="py-8 sm:py-10 lg:py-12">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="lg:col-span-5 xl:col-span-4">
              <Link href="/" className="group inline-flex items-center gap-3 transition hover:opacity-95">
                <SiteLogo size="header" decorative />
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight text-white transition group-hover:text-brand-100">
                    {SITE_NAME}
                  </p>
                  <p className="text-xs text-slate-500">Underground North Carolina Beyblade X</p>
                </div>
              </Link>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                Run brackets, report scores, and climb the rankings — built for local shops, organizers,
                and bladers across NC.
              </p>
              <p className="mt-3 hidden text-xs text-slate-600 sm:block">
                Swiss · Single elim · Double elim · Round robin
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8 lg:col-span-7 lg:mt-0 xl:col-span-8">
              <FooterLinkGroup title="Circuit" links={circuitLinks} />
              <FooterLinkGroup title="Platform" links={platformLinks} />
              <FooterAccountLinks isLoggedIn={isLoggedIn} />
              <FooterLinkGroup title="Legal" links={legalLinks} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 py-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-center text-xs sm:text-right">
            Beyblade X tournament management &amp; rankings for North Carolina.
          </p>
        </div>
      </div>
    </footer>
  );
}
