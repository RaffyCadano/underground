'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Trophy, Users, UsersRound, type LucideIcon } from 'lucide-react';

export const mainNavLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: UsersRound },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLinks({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-0.5 ${className}`}>
      {mainNavLinks.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`group relative inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition ${
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon
              size={16}
              strokeWidth={active ? 2.25 : 2}
              className={`shrink-0 transition ${
                active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            />
            <span>{label}</span>
            <span
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-all ${
                active
                  ? 'bg-brand-400 opacity-100'
                  : 'bg-slate-600 opacity-0 group-hover:opacity-40'
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
