'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Menu,
  Shield,
  Trophy,
  User,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SlidingDrawer } from '@/app/components/sliding-drawer';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/dashboard/clubs', label: 'Community clubs', icon: UsersRound },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Shield },
  { href: '/dashboard/profile', label: 'My profile', icon: User },
];

const siteNav: NavItem[] = [
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: UsersRound },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/tournaments', label: 'Public events', icon: Calendar },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard/profile') {
    return pathname === '/dashboard/profile';
  }
  if (href === '/dashboard/overview') {
    return (
      pathname === '/dashboard/overview' ||
      (pathname.startsWith('/dashboard/') && pathname !== '/dashboard/profile')
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

function SideNavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      <div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Manage
        </p>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Site
        </p>
        <div className="space-y-1">
          {siteNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AdminSideNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allNav = [...mainNav, ...siteNav];
  const currentLabel =
    allNav.find((item) => isActive(pathname, item.href))?.label ?? 'Navigate';

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
          aria-controls="admin-dashboard-drawer"
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard size={16} className="text-brand-400" />
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

      <SlidingDrawer open={mobileOpen} onClose={close} title="Admin panel" side="left">
        <div id="admin-dashboard-drawer">
          <SideNavLinks pathname={pathname} onNavigate={close} />
        </div>
      </SlidingDrawer>

      <aside className="hidden lg:block lg:w-56 lg:shrink-0">
        <div className="sticky top-20 rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="mb-3 px-3 text-xs font-semibold text-slate-300">Admin panel</p>
          <SideNavLinks pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
