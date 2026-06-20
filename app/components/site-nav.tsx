'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react';
import { HeaderNavLinks, mainNavLinks } from '@/app/components/header-nav-links';
import { SignOutButton } from '@/app/components/sign-out-button';

const navLinks = mainNavLinks.map(({ href, label }) => ({ href, label }));

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dashboardActive = isActive(pathname, '/dashboard');
  const close = () => setOpen(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    function onResize(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false);
    }
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const mobileMenu =
    mounted &&
    createPortal(
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          aria-hidden={!open}
          className={`fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={close}
        />

        {/* Drawer */}
        <nav
          id="mobile-nav-drawer"
          aria-hidden={!open}
          className={`fixed inset-y-0 right-0 z-[110] flex w-[min(100vw,20rem)] flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out will-change-transform ${
            open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <p className="text-sm font-semibold text-white">Menu</p>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
            {navLinks.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-500/10 text-brand-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  aria-current={dashboardActive ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    dashboardActive
                      ? 'bg-brand-500/10 text-brand-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="mt-auto border-t border-slate-800 pt-4">
                  <SignOutButton fullWidth onBeforeSignOut={close} />
                </div>
              </>
            ) : (
              <div className="mt-auto flex flex-col gap-3 border-t border-slate-800 pt-4">
                <Link
                  href="/login"
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  className="btn-secondary w-full text-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  className="btn-primary w-full text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>,
      document.body,
    );

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden items-center md:flex">
        <HeaderNavLinks />
        <div className="ml-3 flex items-center gap-0.5 border-l border-slate-800 pl-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                aria-current={dashboardActive ? 'page' : undefined}
                className={`group relative inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition ${
                  dashboardActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard
                  size={16}
                  strokeWidth={dashboardActive ? 2.25 : 2}
                  className={`shrink-0 transition ${
                    dashboardActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>Dashboard</span>
                <span
                  className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-all ${
                    dashboardActive
                      ? 'bg-brand-400 opacity-100'
                      : 'bg-slate-600 opacity-0 group-hover:opacity-40'
                  }`}
                />
              </Link>
              <SignOutButton
                showIcon
                className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-400 transition hover:text-red-300"
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
              >
                <LogIn size={16} className="shrink-0 text-slate-500 transition group-hover:text-slate-300" />
                <span>Sign in</span>
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-slate-600 opacity-0 transition-all group-hover:opacity-40" />
              </Link>
              <Link
                href="/register"
                className="ml-1 inline-flex items-center gap-2 rounded-lg border border-brand-500/35 bg-brand-500/10 px-3.5 py-2 text-sm font-semibold text-brand-300 transition hover:border-brand-400/50 hover:bg-brand-500/20 hover:text-brand-200"
              >
                <UserPlus size={16} className="shrink-0" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        className="relative z-[120] rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileMenu}
    </>
  );
}
