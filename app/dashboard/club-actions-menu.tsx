'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Trash2 } from 'lucide-react';
import { DeleteClubButton } from '@/app/teams/delete-club-button';
import {
  TableActionsDropdown,
  tableActionsDangerItemClass,
  tableActionsItemClass,
} from '@/app/components/table-actions-dropdown';

export function ClubActionsMenu({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <TableActionsDropdown label={`Actions for ${clubName}`}>
        {(close) => (
          <>
            <Link href="/teams" onClick={close} className={tableActionsItemClass}>
              <ExternalLink size={14} />
              Public listing
            </Link>
            <button
              type="button"
              onClick={() => {
                close();
                setDeleteOpen(true);
              }}
              className={tableActionsDangerItemClass}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}
      </TableActionsDropdown>
      <DeleteClubButton
        clubId={clubId}
        clubName={clubName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        hideTrigger
      />
    </>
  );
}
