import Image from 'next/image';

const sizeStyles = {
  sm: { box: 'h-8 w-8', text: 'text-xs', px: 32 },
  md: { box: 'h-9 w-9', text: 'text-sm', px: 36 },
  lg: { box: 'h-10 w-10 sm:h-12 sm:w-12', text: 'text-base sm:text-lg', px: 48 },
  xl: { box: 'h-16 w-16', text: 'text-2xl', px: 64 },
  '2xl': { box: 'h-24 w-24 sm:h-28 sm:w-28', text: 'text-3xl sm:text-4xl', px: 112 },
} as const;

type PlayerAvatarProps = {
  username: string;
  avatar?: string | null;
  size?: keyof typeof sizeStyles;
  shape?: 'circle' | 'rounded' | 'rounded-xl';
  className?: string;
};

export function PlayerAvatar({
  username,
  avatar,
  size = 'md',
  shape = 'circle',
  className = '',
}: PlayerAvatarProps) {
  const initial = username.charAt(0).toUpperCase();
  const styles = sizeStyles[size];
  const rounded =
    shape === 'circle' ? 'rounded-full' : shape === 'rounded-xl' ? 'rounded-xl' : 'rounded-lg';

  if (avatar) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden border border-slate-700 bg-slate-800 ${styles.box} ${rounded} ${className}`}
      >
        <Image
          src={avatar}
          alt={`${username}'s profile photo`}
          fill
          className="object-cover"
          sizes={`${styles.px}px`}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border border-slate-700 bg-slate-800 font-bold text-slate-300 ${styles.box} ${rounded} ${styles.text} ${className}`}
    >
      {initial}
    </span>
  );
}
