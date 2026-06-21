export type DescriptionBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; alt: string; url: string };

const IMAGE_MARKDOWN = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function parseDescriptionMarkdown(text: string): DescriptionBlock[] {
  if (!text.trim()) return [];

  const blocks: DescriptionBlock[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(IMAGE_MARKDOWN)) {
    const index = match.index ?? 0;
    const before = text.slice(lastIndex, index);
    if (before) blocks.push({ type: 'text', content: before });

    blocks.push({
      type: 'image',
      alt: match[1]?.trim() || 'Tournament image',
      url: match[2]?.trim() ?? '',
    });

    lastIndex = index + match[0].length;
  }

  const trailing = text.slice(lastIndex);
  if (trailing) blocks.push({ type: 'text', content: trailing });

  return blocks.length > 0 ? blocks : [{ type: 'text', content: text }];
}

export function descriptionPlainText(text: string): string {
  return text
    .replace(IMAGE_MARKDOWN, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isAllowedDescriptionImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const base = new URL(supabaseUrl);
      if (parsed.origin === base.origin && parsed.pathname.includes('/storage/v1/object/public/')) {
        return true;
      }
    }

    return (
      parsed.hostname.endsWith('.supabase.co') &&
      parsed.pathname.includes('/storage/v1/object/public/')
    );
  } catch {
    return false;
  }
}
