'use client';

import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { AdcashDashboardShell } from '@/app/components/adcash-dashboard-shell';
import { SiteBrand } from '@/app/components/site-brand';
import { SiteFooter } from '@/app/components/site-footer';
import { SiteNav } from '@/app/components/site-nav';

export function SiteChrome({
  children,
  session,
  avatar,
}: {
  children: React.ReactNode;
  session: Session | null;
  avatar: string | null;
}) {
  const pathname = usePathname();
  const isEmbed = pathname.includes('/embed');

  if (isEmbed) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <header className="site-chrome relative sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container flex items-center justify-between gap-6 py-3">
          <SiteBrand />
          <SiteNav session={session} avatar={avatar} />
        </div>
      </header>
      <main className="min-w-0 flex-1">
        <AdcashDashboardShell>{children}</AdcashDashboardShell>
      </main>
      <SiteFooter session={session} />
    </div>
  );
}
