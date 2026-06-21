'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { SignOutDialog } from '@/app/components/sign-out-dialog';

type ProfileMenuProps = {
  session: Session;
  avatar?: string | null;
  onNavigate?: () => void;
  variant?: 'dropdown' | 'drawer';
};

function profileLinks(session: Session) {
  const username = session.user.name ?? 'player';
  const dashboardHref = session.user.role === 'admin' ? '/dashboard/overview' : '/dashboard';

  return [
    { href: dashboardHref, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Profile settings', icon: User },
    {
      href: `/players/${username.toLowerCase()}`,
      label: 'Public profile',
      icon: ExternalLink,
    },
  ] as const;
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard/profile') {
    return pathname === '/dashboard/profile';
  }

  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  if (href === '/dashboard/overview') {
    return (
      pathname === '/dashboard/overview' ||
      (pathname.startsWith('/dashboard/') && pathname !== '/dashboard/profile')
    );
  }

  if (href.startsWith('/players/')) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProfileMenu({
  session,
  avatar = null,
  onNavigate,
  variant = 'dropdown',
}: ProfileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const username = session.user.name ?? session.user.email?.split('@')[0] ?? 'Account';
  const email = session.user.email;
  const links = profileLinks(session);
  const dashboardActive = isActive(pathname, links[0].href);

  useEffect(() => {
    if (variant !== 'dropdown' || !open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, variant]);

  function closeAll() {
    setOpen(false);
    onNavigate?.();
  }

  function openSignOut() {
    if (variant === 'dropdown') setOpen(false);
    onNavigate?.();
    setSignOutOpen(true);
  }

  if (variant === 'drawer') {
    return (
      <>
        <div className="mt-auto border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
            <PlayerAvatar username={username} avatar={avatar} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{username}</p>
              {email && <p className="truncate text-xs text-slate-500">{email}</p>}
            </div>
            <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {session.user.role}
            </span>
          </div>

          <div className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeAll}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-500/10 text-brand-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-brand-400' : 'text-slate-500'} />
                  {label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={openSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <SignOutDialog
          open={signOutOpen}
          onClose={() => setSignOutOpen(false)}
          onBeforeSignOut={onNavigate}
        />
      </>
    );
  }

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-sm font-medium transition ${
            open || dashboardActive
              ? 'border-brand-500/30 bg-brand-500/10 text-white'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <PlayerAvatar username={username} avatar={avatar} size="sm" />
          <span className="hidden max-w-[7rem] truncate sm:inline">{username}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[120] w-64 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/40"
          >
            <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <PlayerAvatar username={username} avatar={avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{username}</p>
                  {email && <p className="truncate text-xs text-slate-500">{email}</p>}
                </div>
              </div>
              <span className="mt-2 inline-flex rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {session.user.role}
              </span>
            </div>

            <div className="p-1.5">
              {links.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-500/10 text-brand-200'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-brand-400' : 'text-slate-500'} />
                    {label}
                  </Link>
                );
              })}

              <button
                type="button"
                role="menuitem"
                onClick={openSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </>
  );
}
