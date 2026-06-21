'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type SlidingDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: ReactNode;
};

function closeOnLinkClick(event: MouseEvent<HTMLElement>, onClose: () => void) {
  const anchor = (event.target as HTMLElement).closest('a[href]');
  if (anchor) onClose();
}

export function SlidingDrawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
}: SlidingDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const fromLeft = side === 'left';

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-hidden={!open}
        aria-label={title}
        className={`fixed inset-y-0 z-[95] flex w-[min(100vw,18rem)] flex-col bg-slate-950 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out will-change-transform lg:hidden ${
          fromLeft ? 'left-0 border-r border-slate-800' : 'right-0 border-l border-slate-800'
        } ${open ? 'pointer-events-auto translate-x-0' : fromLeft ? 'pointer-events-none -translate-x-full' : 'pointer-events-none translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <p className="text-sm font-semibold text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain p-3"
          onClick={(event) => closeOnLinkClick(event, onClose)}
        >
          {children}
        </div>
      </aside>
    </>,
    document.body,
  );
}
