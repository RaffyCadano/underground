'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings2, Trash2 } from 'lucide-react';
import { DeleteTournamentButton } from '@/app/tournaments/delete-tournament-button';
import {
  TableActionsDropdown,
  tableActionsDangerItemClass,
  tableActionsItemClass,
} from '@/app/components/table-actions-dropdown';

export function TournamentActionsMenu({
  tournamentId,
  tournamentName,
}: {
  tournamentId: string;
  tournamentName: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <TableActionsDropdown label={`Actions for ${tournamentName}`} menuClassName="min-w-[9.5rem]">
        {(close) => (
          <>
            <Link
              href={`/tournaments/${tournamentId}`}
              onClick={close}
              className={tableActionsItemClass}
            >
              <Settings2 size={14} />
              Manage
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
      <DeleteTournamentButton
        tournamentId={tournamentId}
        tournamentName={tournamentName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        hideTrigger
      />
    </>
  );
}
