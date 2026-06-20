import { HeaderNavLinks } from '@/app/components/header-nav-links';
import { SiteBrand } from '@/app/components/site-brand';

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-3">
        <SiteBrand />
        <HeaderNavLinks />
      </div>
    </header>
  );
}
