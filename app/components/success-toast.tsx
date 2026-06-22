'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  body?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export function SuccessToast({
  open,
  title,
  body,
  onDismiss,
  autoDismissMs = 6000,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !mounted) {
      setVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [open, mounted, onDismiss, autoDismissMs]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed bottom-4 left-4 z-[60] w-[min(100vw-2rem,22rem)] transition-all duration-300 sm:bottom-6 sm:left-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950 shadow-2xl shadow-black/40">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="flex items-start gap-3 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
            <CheckCircle2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>
            {body && <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
