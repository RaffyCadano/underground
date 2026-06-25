'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, LogOut, ShieldCheck, X } from 'lucide-react';
import { clearSessionCookie } from '@/app/actions/auth';
import { useSession } from 'next-auth/react';

export function SignOutDialog({  open,
  onClose,
  onBeforeSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onBeforeSignOut?: () => void;
}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayName = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'Your account';
  const displayEmail = session?.user?.email;
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  function closeModal() {
    if (isPending) return;
    onClose();
  }

  function confirmSignOut() {
    onBeforeSignOut?.();
    startTransition(async () => {
      await clearSessionCookie();
      window.location.assign('/?signedOut=1');
    });
  }
  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={closeModal}
        disabled={isPending}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 shadow-2xl shadow-amber-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 text-amber-300">
                <LogOut size={20} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                  End session
                </p>
                <h2 id="sign-out-title" className="mt-1 text-lg font-semibold text-white">
                  Sign out of UGNCBBX?
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-white disabled:opacity-60"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-sm font-bold text-amber-200">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{displayName}</p>
              {displayEmail && <p className="truncate text-xs text-slate-400">{displayEmail}</p>}
            </div>
            <span className="ml-auto shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {session?.user?.role ?? 'player'}
            </span>
          </div>

          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3">
            <div className="flex gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-amber-100">You&apos;ll need to sign in again to continue.</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
                  <li>Dashboard and account settings become unavailable</li>
                  <li>Your tournament data stays saved on UGNCBBX</li>
                  <li>You&apos;ll be redirected to the home page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeModal} disabled={isPending} className="btn-secondary disabled:opacity-60">
            Stay signed in
          </button>
          <button
            type="button"
            onClick={confirmSignOut}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/25 disabled:opacity-60"
          >
            <LogOut size={15} />
            {isPending ? 'Signing out…' : 'Sign out'}
            {!isPending && <ArrowRight size={15} className="opacity-70" />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
