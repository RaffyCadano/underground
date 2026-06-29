import { loadTournamentDiscussion } from '@/lib/tournament-discussion';
import { TournamentDiscussionSection } from './tournament-discussion-section';

export async function TournamentDiscussionPanel({
  tournamentId,
  isLoggedIn,
  isAdmin,
  currentUserId,
}: {
  tournamentId: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUserId: string | null;
}) {
  const discussion = await loadTournamentDiscussion(tournamentId);

  return (
    <TournamentDiscussionSection
      tournamentId={tournamentId}
      posts={discussion.posts}
      totalMessageCount={discussion.totalMessageCount}
      hasOlderThreads={discussion.hasOlderThreads}
      oldestThreadCursor={discussion.oldestThreadCursor}
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  );
}
