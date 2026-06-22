'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, User, X } from 'lucide-react';
import { ProfileSettingsNavPanel } from '@/app/components/profile-settings-nav-panel';
import { SlidingDrawer } from '@/app/components/sliding-drawer';
import { isProfileSettingsNavActive, profileSettingsNavItems } from '@/lib/profile-settings-nav';

export function ProfileSettingsSideNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentLabel =
    profileSettingsNavItems.find((item) => isProfileSettingsNavActive(pathname, item.href))
      ?.label ?? 'Settings';

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
          aria-controls="profile-settings-drawer"
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            <User size={16} className="text-brand-400" />
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

      <SlidingDrawer open={mobileOpen} onClose={close} title="Account settings" side="left">
        <div id="profile-settings-drawer">
          <ProfileSettingsNavPanel pathname={pathname} onNavigate={close} />
        </div>
      </SlidingDrawer>

      <aside className="hidden lg:sticky lg:top-20 lg:z-30 lg:block lg:w-64 lg:shrink-0 lg:self-start">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="mb-3 px-3 text-xs font-semibold text-slate-300">Account settings</p>
          <ProfileSettingsNavPanel pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
