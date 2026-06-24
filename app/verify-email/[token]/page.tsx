import { redirect } from 'next/navigation';
import { verifyEmailFromToken } from '@/lib/email-verification';

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verified = token ? await verifyEmailFromToken(token) : false;

  redirect(verified ? '/profile?emailVerified=1' : '/profile?emailVerifyError=1');
}
