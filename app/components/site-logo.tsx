import Image from 'next/image';

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
      className={`relative inline-flex shrink-0 overflow-hidden border border-brand-500/30 bg-slate-950 ${sizes[size]} ${className}`}
    >
      <Image
        src="/underground-icon.png"
        alt="Underground"
        width={px}
        height={px}
        className="h-full w-full object-cover"
        priority={priority || size === 'header'}
      />
    </span>
  );
}
