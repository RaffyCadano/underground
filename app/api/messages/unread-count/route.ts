import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getUnreadMessageCount } from '@/app/actions/messages';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
