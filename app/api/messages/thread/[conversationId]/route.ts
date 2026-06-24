import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { loadConversationThread } from '@/lib/messages-data';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  let thread = await loadConversationThread(userId, conversationId);
  if (!thread) {
    thread = await loadConversationThread(userId, conversationId, { allowArchived: true });
  }

  if (!thread) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  return NextResponse.json(thread);
}
