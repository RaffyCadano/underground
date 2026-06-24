'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DismissClubRequestButton } from '@/app/teams/dismiss-club-request-button';
import { TableActionsDropdown, tableActionsItemClass } from '@/app/components/table-actions-dropdown';

export function ClubRequestActionsMenu({ requestId }: { requestId: string }) {
  return (
    <TableActionsDropdown label="Request actions">
      {(close) => (
        <>
          <Link href="/dashboard/clubs/create" onClick={close} className={tableActionsItemClass}>
            <Plus size={14} />
            Add club
          </Link>
          <DismissClubRequestButton
            requestId={requestId}
            variant="menuItem"
            onAction={close}
          />
        </>
      )}
    </TableActionsDropdown>
  );
}
