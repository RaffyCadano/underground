import Link from 'next/link';
import { SiteLogo } from '@/app/components/site-logo';
import { SITE_FULL_NAME, SITE_NAME } from '@/lib/site';

export function SiteBrand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 transition hover:opacity-95"
    >
      <SiteLogo className="transition group-hover:opacity-90" />
      <div className="min-w-0 leading-tight">
        <p className="text-base font-semibold tracking-tight text-slate-100 transition group-hover:text-white">
          {SITE_NAME}
        </p>
        <p className="mt-0.5 max-w-[11rem] truncate text-xs text-slate-500 transition group-hover:text-slate-400 sm:max-w-none">
          {SITE_FULL_NAME}
        </p>
      </div>
    </Link>
  );
}
