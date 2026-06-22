'use client';

import { useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { dismissOrganizerRequest } from '@/app/actions/organizer-requests';

export function DismissOrganizerRequestButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => dismissOrganizerRequest(requestId))}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      Dismiss
    </button>
  );
}
