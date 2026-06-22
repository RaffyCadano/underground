'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

type DraggablePanProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const DRAG_THRESHOLD = 5;

export function DraggablePan({ children, className = '', style }: DraggablePanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    suppressClick: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    pointerId: -1,
  });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || e.pointerType === 'touch') return;

    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, label, [role="button"], [data-pan-exclude]')) return;

    const el = containerRef.current;
    if (!el) return;

    dragRef.current = {
      active: true,
      moved: false,
      suppressClick: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      pointerId: e.pointerId,
    };
    el.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId) return;

    const el = containerRef.current;
    if (!el) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.moved = true;
      setIsDragging(true);
    }

    e.preventDefault();
    el.scrollLeft = drag.scrollLeft - dx;
    el.scrollTop = drag.scrollTop - dy;
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId) return;

    const el = containerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }

    if (drag.moved) {
      drag.suppressClick = true;
    }

    drag.active = false;
    drag.moved = false;
    drag.pointerId = -1;
    setIsDragging(false);
  }

  function handleClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    if (dragRef.current.suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.suppressClick = false;
    }
  }

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      className={`overflow-auto overscroll-contain ${
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
