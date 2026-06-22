import Link from 'next/link';
import type { Session } from 'next-auth';
import { BarChart3, Info, LayoutDashboard, LogIn, Trophy, UserPlus, Users, UsersRound } from 'lucide-react';
import { SiteBrand } from '@/app/components/site-brand';
import { SITE_FULL_NAME, SITE_NAME } from '@/lib/site';

const exploreLinks = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: UsersRound },
];

export function SiteFooter({ session }: { session: Session | null }) {
  const accountLinks = session
    ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
    : [
        { href: '/login', label: 'Sign in', icon: LogIn },
        { href: '/register', label: 'Register', icon: UserPlus },
      ];

  return (
    <footer className="relative mt-auto border-t border-slate-800 bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(34,197,94,0.06),transparent)]" />

      <div className="container relative py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <SiteBrand />
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              {SITE_FULL_NAME} — run brackets, report scores, and climb the {SITE_NAME} rankings.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Swiss &amp; single-elimination formats
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explore</p>
            <ul className="mt-4 space-y-1">
              {exploreLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-900/80 hover:text-white"
                  >
                    <Icon size={15} className="text-slate-600 transition group-hover:text-brand-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account</p>
            <ul className="mt-4 space-y-1">
              {accountLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-slate-900/80 hover:text-white"
                  >
                    <Icon size={15} className="text-slate-600 transition group-hover:text-brand-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">Built for Beyblade X tournament management and rankings.</p>
        </div>
      </div>
    </footer>
  );
}
