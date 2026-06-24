'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

const VIEWPORT_PADDING = 8;
const GAP = 4;
const ESTIMATED_WIDTH = 152;
const ESTIMATED_HEIGHT = 88;

type MenuPosition = {
  top: number;
  left: number;
  transform?: string;
};

const CloseTableActionsMenuContext = createContext<() => void>(() => {});

export function useCloseTableActionsMenu() {
  return useContext(CloseTableActionsMenuContext);
}

export const tableActionsItemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-slate-900';

export const tableActionsDangerItemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 transition hover:bg-slate-900 disabled:opacity-60';

export function TableActionsDropdown({
  label,
  menuClassName = 'min-w-[10rem]',
  children,
}: {
  label: string;
  menuClassName?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function close() {
    setOpen(false);
  }

  function computePosition(panel?: HTMLElement | null): MenuPosition | null {
    const trigger = triggerRef.current;
    if (!trigger) return null;

    const rect = trigger.getBoundingClientRect();
    const width = panel?.offsetWidth ?? ESTIMATED_WIDTH;
    const height = panel?.offsetHeight ?? ESTIMATED_HEIGHT;

    let left = rect.right - width;
    left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - width - VIEWPORT_PADDING));

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;

    if (spaceBelow >= height + GAP || spaceBelow >= spaceAbove) {
      return { top: rect.bottom + GAP, left };
    }

    return { top: rect.top - GAP, left, transform: 'translateY(-100%)' };
  }

  function toggleOpen() {
    if (open) {
      close();
      return;
    }

    setPosition(computePosition());
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const next = computePosition(panelRef.current);
    if (next) {
      setPosition(next);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      close();
    }

    function handleScroll() {
      close();
    }

    function handleResize() {
      const next = computePosition(panelRef.current);
      if (next) {
        setPosition(next);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const menu =
    open &&
    mounted &&
    position &&
    createPortal(
      <CloseTableActionsMenuContext.Provider value={close}>
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          style={{
            top: position.top,
            left: position.left,
            transform: position.transform,
          }}
          className={`fixed z-[120] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 py-1 shadow-xl shadow-black/40 ${menuClassName}`}
        >
          {children(close)}
        </div>
      </CloseTableActionsMenuContext.Provider>,
      document.body,
    );

  return (
    <div ref={rootRef} className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 transition hover:border-slate-600 hover:text-white"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal size={16} />
      </button>
      {menu}
    </div>
  );
}
