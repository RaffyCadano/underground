'use client';

import { useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { approveOrganizerRequest } from '@/app/actions/organizer-requests';

export function ApproveOrganizerRequestButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => approveOrganizerRequest(requestId))}
      className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      Approve
    </button>
  );
}
