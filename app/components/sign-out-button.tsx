'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { SignOutDialog } from '@/app/components/sign-out-dialog';

export function SignOutButton({
  className = 'btn-secondary',
  fullWidth = false,
  showIcon = false,
  onBeforeSignOut,
}: {
  className?: string;
  fullWidth?: boolean;
  showIcon?: boolean;
  onBeforeSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className}${fullWidth ? ' w-full' : ''}`}
      >
        {showIcon && <LogOut size={16} className="shrink-0" />}
        Sign out
      </button>

      <SignOutDialog
        open={open}
        onClose={() => setOpen(false)}
        onBeforeSignOut={onBeforeSignOut}
      />
    </>
  );
}
