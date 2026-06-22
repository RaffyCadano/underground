'use client';

import Link from 'next/link';
import {
  isProfileSettingsNavActive,
  profileSettingsNavItems,
  type ProfileSettingsNavItem,
} from '@/lib/profile-settings-nav';

function labsBadgeClass() {
  return 'rounded border border-orange-500/45 bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-300';
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: ProfileSettingsNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const danger = item.danger === true;

  return (
    <Link
      href={item.href}
      onClick={() => onNavigate?.()}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? danger
            ? 'border border-red-500/35 bg-red-500/10 text-red-200'
            : 'border border-brand-500/30 bg-brand-500/10 text-white'
          : danger
            ? 'text-red-400/90 hover:bg-red-500/10 hover:text-red-300'
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
      }`}
    >
      <Icon
        size={16}
        className={
          active
            ? danger
              ? 'text-red-400'
              : 'text-brand-400'
            : danger
              ? 'text-red-500/80'
              : 'text-slate-500'
        }
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate">{item.label}</span>
        {item.badge?.tone === 'labs' && (
          <span className={labsBadgeClass()}>{item.badge.label}</span>
        )}
      </span>
    </Link>
  );
}

export function ProfileSettingsNavPanel({
  pathname,
  onNavigate,
  sectionLabel = 'Settings',
}: {
  pathname: string;
  onNavigate?: () => void;
  sectionLabel?: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {sectionLabel}
      </p>
      <div className="space-y-1">
        {profileSettingsNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isProfileSettingsNavActive(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
