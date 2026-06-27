'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { ChevronDown } from 'lucide-react';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { SignOutDialog } from '@/app/components/sign-out-dialog';
import { isAdminRole, dashboardHrefForRole } from '@/lib/roles';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';
import { playerProfilePath } from '@/lib/player-profile';

type ProfileMenuProps = {
  session: Session;
  avatar?: string | null;
  onNavigate?: () => void;
  variant?: 'dropdown' | 'drawer';
};

type MenuLink = {
  href: string;
  label: string;
  count?: number;
};

function getSessionUsername(session: Session) {
  return session.user.name ?? session.user.email?.split('@')[0] ?? 'Account';
}

function buildMenuLinks(session: Session, unreadMessages = 0): MenuLink[] {
  const username = getSessionUsername(session);
  const role = session.user.role;
  const dashboardHref = dashboardHrefForRole(role ?? 'player');

  return [
    { href: dashboardHref, label: 'Dashboard' },
    { href: playerProfilePath(username), label: 'Public Profile' },
    { href: '/profile', label: 'Settings' },
    { href: '/messages', label: 'Messages', count: unreadMessages },
    { href: '/news', label: 'News' },
  ];
}

function isActive(pathname: string, href: string) {
  if (href === '/profile') {
    return pathname === '/profile' || pathname.startsWith('/profile/');
  }

  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  if (href === '/dashboard/overview') {
    return (
      pathname === '/dashboard/overview' ||
      (pathname.startsWith('/dashboard/') &&
        pathname !== '/profile' &&
        !pathname.startsWith('/profile/') &&
        pathname !== '/dashboard/tournaments')
    );
  }

  if (href === '/dashboard/tournaments') {
    return pathname === '/dashboard/tournaments' || pathname.startsWith('/dashboard/tournaments/');
  }

  if (href.startsWith('/players/')) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function premierBadge() {
  return (
    <span className="shrink-0 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
      Premier
    </span>
  );
}

function AccountMenuPanel({
  session,
  avatar = null,
  pathname,
  onNavigate,
  onLogOut,
  unreadMessages,
}: {
  session: Session;
  avatar?: string | null;
  pathname: string;
  onNavigate?: () => void;
  onLogOut: () => void;
  unreadMessages: number;
}) {
  const links = buildMenuLinks(session, unreadMessages);
  const username = getSessionUsername(session);
  const hasPremier = userHasActivePremier(
    session.user.subscriptionPlan ?? 'free',
    session.user.subscriptionStatus,
  );
  const showPremierUpgrade = !isAdminRole(session.user.role) && !hasPremier;

  return (
    <div>
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <PlayerAvatar username={username} avatar={avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">@{username}</p>
              {hasPremier && premierBadge()}
            </div>
            {session.user.email && (
              <p className="truncate text-xs text-slate-500">{session.user.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="py-1">
        {links.map(({ href, label, count }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onNavigate?.()}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition ${
                active
                  ? 'bg-brand-500/10 font-medium text-brand-200'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className="tabular-nums text-brand-300">({count})</span>
              )}
            </Link>
          );
        })}
      </div>

      {showPremierUpgrade && (
        <div className="border-t border-slate-800 py-1">
          <Link
            href="/profile/subscriptions"
            onClick={() => onNavigate?.()}
            className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
          >
            <span>Upgrade to Premier</span>
            {premierBadge()}
          </Link>
        </div>
      )}

      <div className="border-t border-slate-800 py-1">
        <button
          type="button"
          onClick={onLogOut}
          className="flex w-full px-4 py-2.5 text-left text-sm text-slate-400 transition hover:bg-slate-800/80 hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export function ProfileMenu({
  session: initialSession,
  avatar = null,
  onNavigate,
  variant = 'dropdown',
}: ProfileMenuProps) {
  const pathname = usePathname();
  const { data: clientSession } = useSession();
  const session = clientSession ?? initialSession;
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const username = getSessionUsername(session);
  const links = buildMenuLinks(session, unreadMessages);
  const dashboardActive = isActive(pathname, links[0].href);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const res = await fetch('/api/messages/unread-count', { cache: 'no-store' });
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === 'number') {
          setUnreadMessages(data.count);
        }
      } catch {
        // Ignore transient network errors during polling.
      }
    }

    void loadUnreadCount();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void loadUnreadCount();
    }, 4_000);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadUnreadCount();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname]);

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

  function openLogOut() {
    if (variant === 'dropdown') setOpen(false);
    onNavigate?.();
    setSignOutOpen(true);
  }

  if (variant === 'drawer') {
    return (
      <>
        <div className="mt-auto border-t border-slate-800">
          <AccountMenuPanel
            session={session}
            avatar={avatar}
            pathname={pathname}
            onNavigate={closeAll}
            onLogOut={openLogOut}
            unreadMessages={unreadMessages}
          />
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
          aria-label={`${username} account menu`}
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
            aria-label="Your account"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[120] w-72 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/40"
          >
            <AccountMenuPanel
              session={session}
              avatar={avatar}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              onLogOut={openLogOut}
              unreadMessages={unreadMessages}
            />
          </div>
        )}
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </>
  );
}
