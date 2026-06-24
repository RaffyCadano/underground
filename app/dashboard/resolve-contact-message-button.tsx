'use client';

import { useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { resolveContactMessage } from '@/app/actions/contact';

export function ResolveContactMessageButton({
  messageId,
  variant = 'button',
  onAction,
}: {
  messageId: string;
  variant?: 'button' | 'menuItem';
  onAction?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    onAction?.();
    startTransition(() => resolveContactMessage(messageId));
  }

  if (variant === 'menuItem') {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        Mark resolved
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      Mark resolved
    </button>
  );
}
