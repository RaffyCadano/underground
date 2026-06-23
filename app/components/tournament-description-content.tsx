import Image from 'next/image';
import {
  descriptionPlainText,
  isAllowedDescriptionImageUrl,
  parseDescriptionMarkdown,
} from '@/lib/description-markdown';
import { renderDescriptionMarkdownText } from '@/lib/description-markdown-render';

type Props = {
  content: string;
  className?: string;
  compact?: boolean;
  featured?: boolean;
};

export function TournamentDescriptionContent({
  content,
  className = '',
  compact = false,
  featured = false,
}: Props) {
  const blocks = parseDescriptionMarkdown(content);

  if (blocks.length === 0) return null;

  if (compact) {
    const plain = descriptionPlainText(content);
    if (!plain && blocks.some((b) => b.type === 'image')) {
      return (
        <p className={`text-xs text-slate-500 ${className}`.trim()}>
          Includes images — view on the tournament page.
        </p>
      );
    }
    if (!plain) return null;
    return (
      <p className={`line-clamp-4 text-xs leading-relaxed text-slate-500 ${className}`.trim()}>
        {plain}
      </p>
    );
  }

  return (
    <div
      className={`space-y-4 leading-relaxed text-slate-300 ${
        featured ? 'text-base leading-relaxed sm:text-[15px]' : 'text-sm'
      } ${className}`.trim()}
    >
      {blocks.map((block, index) => {
        if (block.type === 'text') {
          return (
            <div key={`text-${index}`}>
              {renderDescriptionMarkdownText(block.content, featured && index === 0)}
            </div>
          );
        }

        if (!isAllowedDescriptionImageUrl(block.url)) return null;

        return (
          <figure
            key={`image-${index}`}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-black/20"
          >
            <Image
              src={block.url}
              alt={block.alt}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px"
            />
            {block.alt && block.alt !== 'Tournament image' && (
              <figcaption className="border-t border-slate-800 px-3 py-2 text-xs text-slate-500">
                {block.alt}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

export function TournamentDescriptionPlainText({ content, className = '' }: { content: string; className?: string }) {
  const plain = descriptionPlainText(content);
  if (!plain) return null;
  return <p className={className}>{plain}</p>;
}
