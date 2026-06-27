'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, Trophy, X, type LucideIcon } from 'lucide-react';
import { SlidingDrawer } from '@/app/components/sliding-drawer';
import {
  getPlayerDashboardNav,
  isPlayerDashboardNavActive,
} from '@/lib/player-dashboard-nav';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={() => onNavigate?.()}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'border border-brand-500/30 bg-brand-500/10 text-white'
          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
      }`}
    >
      <Icon size={16} className={active ? 'text-brand-400' : 'text-slate-500'} />
      {item.label}
    </Link>
  );
}

function SideNavLinks({
  pathname,
  navItems,
  onNavigate,
}: {
  pathname: string;
  navItems: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isPlayerDashboardNavActive(pathname, item.href)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export function PlayerSideNav({
  role,
  initialPathname = '',
}: {
  role: string;
  initialPathname?: string;
}) {
  const clientPathname = usePathname();
  const pathname = clientPathname || initialPathname;
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sessionRole = session?.user?.role ?? role;
  const navItems = getPlayerDashboardNav(sessionRole);
  const currentLabel =
    navItems.find((item) => isPlayerDashboardNavActive(pathname, item.href))?.label ??
    'Player dashboard';

  const close = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    function onResize(e: MediaQueryListEvent) {
      if (e.matches) setMobileOpen(false);
    }
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  return (
    <>
      <div className="mb-6 lg:mb-0 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="player-dashboard-drawer"
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            <Trophy size={16} className="text-brand-400" />
            {currentLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            {mobileOpen ? (
              <>
                <X size={14} />
                Close
              </>
            ) : (
              <>
                <Menu size={14} />
                Menu
              </>
            )}
          </span>
        </button>
      </div>

      <SlidingDrawer open={mobileOpen} onClose={close} title="Player dashboard" side="left">
        <div id="player-dashboard-drawer">
          <SideNavLinks pathname={pathname} navItems={navItems} onNavigate={close} />
        </div>
      </SlidingDrawer>

      <aside className="hidden lg:sticky lg:top-20 lg:z-30 lg:block lg:w-64 lg:shrink-0 lg:self-start">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="mb-3 px-3 text-xs font-semibold text-slate-300">Player dashboard</p>
          <SideNavLinks pathname={pathname} navItems={navItems} />
        </div>
      </aside>
    </>
  );
}
