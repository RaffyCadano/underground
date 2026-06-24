import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  getUnreadMessageCount,
  listArchivedConversationsForUser,
  listConversationsForUser,
} from '@/app/actions/messages';
import { MessagesInbox, type MessagesSidebarTab } from '@/app/messages/messages-inbox';
import { authOptions } from '@/lib/auth';
import { loadConversationThread } from '@/lib/messages-data';
import { SITE_NAME } from '@/lib/site';
import { isSupabaseStorageConfigured } from '@/lib/supabase-admin';

export const metadata = {
  title: `Messages | ${SITE_NAME}`,
  description: 'Direct messages with organizers, opponents, and bladers on the UGNCBBX circuit.',
};

function parseSidebarTab(value: string | undefined): MessagesSidebarTab {
  if (value === 'archive' || value === 'unread') return value;
  return 'all';
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; to?: string; new?: string; tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { c: conversationId, to: composeUsername, new: composeNew, tab: tabParam } = await searchParams;
  const sidebarTab = parseSidebarTab(tabParam);
  const userId = session.user.id;

  const [conversations, archivedConversations, unreadTotal] = await Promise.all([
    listConversationsForUser(userId),
    listArchivedConversationsForUser(userId),
    getUnreadMessageCount(userId),
  ]);

  const composing = Boolean(composeNew || composeUsername);
  if (!conversationId && !composing && sidebarTab === 'all' && conversations.length > 0) {
    redirect(`/messages?c=${conversations[0].id}`);
  }
  if (!conversationId && !composing && sidebarTab === 'archive' && archivedConversations.length > 0) {
    redirect(`/messages?tab=archive&c=${archivedConversations[0].id}`);
  }

  let thread = null;
  if (conversationId) {
    thread = await loadConversationThread(userId, conversationId, {
      allowArchived: sidebarTab === 'archive',
    });
    if (!thread) {
      thread = await loadConversationThread(userId, conversationId, { allowArchived: true });
    }
  }

  return (
    <MessagesInbox
      conversations={conversations}
      archivedConversations={archivedConversations}
      sidebarTab={sidebarTab}
      selectedConversationId={conversationId ?? null}
      thread={thread}
      composeUsername={composeUsername ?? null}
      initialComposeOpen={Boolean(composeNew || composeUsername)}
      unreadTotal={unreadTotal}
      imageUploadEnabled={isSupabaseStorageConfigured()}
    />
  );
}
