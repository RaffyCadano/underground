'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { SignOutButton } from '@/app/components/sign-out-button';

export function NavAuth({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <>
        <Link href="/login" className="btn-ghost">Sign in</Link>
        <Link href="/register" className="btn-primary">
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
      <SignOutButton />
    </>
  );
}
