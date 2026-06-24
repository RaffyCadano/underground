export type ContactInboxRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  createdAt: Date;
  resolvedAt: Date | null;
  user: { id: string; username: string; email: string } | null;
};

export type ParsedContactInboxEntry = {
  isDmReport: boolean;
  subjectLabel: string;
  about: string;
  preview: string;
  conversationId: string | null;
  messageId: string | null;
};

export function parseContactInboxEntry(entry: Pick<ContactInboxRow, 'subject' | 'message'>): ParsedContactInboxEntry {
  const isDmReport =
    entry.subject.startsWith('DM message report:') || entry.subject.startsWith('DM report:');

  if (!isDmReport) {
    return {
      isDmReport: false,
      subjectLabel: entry.subject,
      about: '—',
      preview: entry.message.trim(),
      conversationId: null,
      messageId: null,
    };
  }

  const subjectLabel = entry.subject.replace(/^DM message report:\s*/i, '').trim() || entry.subject;
  const about =
    entry.message.match(/Reported user:\s*@?(.+)/)?.[1]?.trim() ||
    subjectLabel.replace(/^@/, '') ||
    '—';
  const reportedMessage =
    entry.message.match(/Reported message:\s*\n([\s\S]*?)(?:\n\n|$)/)?.[1]?.trim() || '';
  const conversationId = entry.message.match(/Conversation ID:\s*(.+)/)?.[1]?.trim() || null;
  const messageId = entry.message.match(/Message ID:\s*(.+)/)?.[1]?.trim() || null;

  return {
    isDmReport: true,
    subjectLabel: `Report · @${about}`,
    about: `@${about.replace(/^@/, '')}`,
    preview: reportedMessage || '—',
    conversationId,
    messageId,
  };
}

export function formatContactWhen(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  account: 'Account',
  billing: 'Billing',
  tournament: 'Tournament',
  other: 'Other',
};

export const CONTACT_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'dm', label: 'DM reports' },
  { value: 'form', label: 'Contact form' },
] as const;

export const CONTACT_CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All categories' },
  ...Object.entries(CONTACT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export function matchesContactInboxFilter(
  entry: Pick<ContactInboxRow, 'name' | 'email' | 'subject' | 'message' | 'category' | 'user'>,
  parsed: ParsedContactInboxEntry,
  query: string,
  category: string,
  type: string,
) {
  if (category !== 'all' && entry.category !== category) return false;
  if (type === 'dm' && !parsed.isDmReport) return false;
  if (type === 'form' && parsed.isDmReport) return false;

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    parsed.subjectLabel,
    entry.subject,
    entry.name,
    entry.email,
    parsed.about,
    parsed.preview,
    entry.message,
    entry.user?.username,
    CONTACT_CATEGORY_LABELS[entry.category],
    parsed.messageId,
    parsed.conversationId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}
