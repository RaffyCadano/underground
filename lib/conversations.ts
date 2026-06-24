export const DIRECT_MESSAGE_MAX_LENGTH = 2000;

export type MessageParticipant = {
  id: string;
  username: string;
  avatar: string | null;
};

export function conversationParticipantPair(userAId: string, userBId: string) {
  return userAId < userBId
    ? { participantLowId: userAId, participantHighId: userBId }
    : { participantLowId: userBId, participantHighId: userAId };
}

export function otherConversationParticipant<T extends MessageParticipant>(
  conversation: {
    participantLowId: string;
    participantHighId: string;
    participantLow: T;
    participantHigh: T;
  },
  currentUserId: string,
): T {
  return conversation.participantLowId === currentUserId
    ? conversation.participantHigh
    : conversation.participantLow;
}

export function formatMessagePreview(body: string, maxLength = 72, options?: { unsent?: boolean; hasImage?: boolean }) {
  if (options?.unsent) return 'Message unsent';
  if (options?.hasImage && !body.trim()) return 'Photo';
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (!normalized && options?.hasImage) return 'Photo';
  if (!normalized) return 'No messages yet';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function formatMessageTimestamp(date: Date) {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatMessageTooltip(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
