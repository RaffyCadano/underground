import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import {
  getUnreadMessageCount,
  listArchivedConversationsForUser,
  listConversationsForUser,
} from '@/app/actions/messages';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const [conversations, archivedConversations, unreadTotal] = await Promise.all([
    listConversationsForUser(userId),
    listArchivedConversationsForUser(userId),
    getUnreadMessageCount(userId),
  ]);

  return NextResponse.json({ conversations, archivedConversations, unreadTotal });
}
