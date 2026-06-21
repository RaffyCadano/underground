import type { ReactNode } from 'react';

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\*[^*\n]+\*|~~[^~]+~~|\[([^\]]+)\]\(([^)]+)\))/g;

function parseInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${matchIndex++}`;

    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('~~')) {
      nodes.push(
        <span key={key} className="text-slate-500 line-through">
          {token.slice(2, -2)}
        </span>,
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (match[2] && match[3]) {
      nodes.push(
        <a
          key={key}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-400 underline decoration-brand-500/40 underline-offset-2 hover:text-brand-300"
        >
          {match[2]}
        </a>,
      );
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function renderDescriptionMarkdownText(content: string, featured: boolean): ReactNode {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockKey = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index++;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${blockKey++}`} className="border-slate-800" />);
      index++;
      continue;
    }

    if (/^#{2}\s+/.test(trimmed)) {
      blocks.push(
        <h2 key={`h2-${blockKey++}`} className="text-lg font-semibold text-white sm:text-xl">
          {parseInlineMarkdown(trimmed.replace(/^#{2}\s+/, ''), `h2-${blockKey}`)}
        </h2>,
      );
      index++;
      continue;
    }

    if (/^#{3}\s+/.test(trimmed)) {
      blocks.push(
        <h3 key={`h3-${blockKey++}`} className="text-base font-semibold text-white">
          {parseInlineMarkdown(trimmed.replace(/^#{3}\s+/, ''), `h3-${blockKey}`)}
        </h3>,
      );
      index++;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        const item = lines[index].trim().replace(/^[-*]\s+/, '');
        items.push(
          <li key={`ul-${blockKey}-${items.length}`} className="leading-relaxed">
            {parseInlineMarkdown(item, `ul-${blockKey}-${items.length}`)}
          </li>,
        );
        index++;
      }
      blocks.push(
        <ul key={`ul-${blockKey++}`} className="list-disc space-y-1.5 pl-5">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const item = lines[index].trim().replace(/^\d+\.\s+/, '');
        items.push(
          <li key={`ol-${blockKey}-${items.length}`} className="leading-relaxed">
            {parseInlineMarkdown(item, `ol-${blockKey}-${items.length}`)}
          </li>,
        );
        index++;
      }
      blocks.push(
        <ol key={`ol-${blockKey++}`} className="list-decimal space-y-1.5 pl-5">
          {items}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current) break;
      if (
        /^-{3,}$/.test(current) ||
        /^#{2,3}\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraphLines.push(lines[index]);
      index++;
    }

    const paragraph = paragraphLines.join('\n').trim();
    if (paragraph) {
      blocks.push(
        <p
          key={`p-${blockKey++}`}
          className={`whitespace-pre-wrap ${featured && blockKey === 1 ? 'text-slate-200' : ''}`}
        >
          {parseInlineMarkdown(paragraph, `p-${blockKey}`)}
        </p>,
      );
    }
  }

  return <div className="space-y-4">{blocks}</div>;
}
