import Image from 'next/image';
import { SITE_LOGO_SRC, SITE_NAME } from '@/lib/site';

const sizes = {
  header: 'h-9 w-9 rounded-lg',
  card: 'h-10 w-10 rounded-xl sm:h-11 sm:w-11',
} as const;

export function SiteLogo({
  size = 'header',
  className = '',
  priority = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  priority?: boolean;
}) {
  const px = size === 'header' ? 36 : 44;

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden ${sizes[size]} ${className}`}
    >
      <Image
        src={SITE_LOGO_SRC}
        alt={SITE_NAME}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        priority={priority || size === 'header'}
      />
    </span>
  );
}
