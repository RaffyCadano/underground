import {
  Code,
  CreditCard,
  FileStack,
  KeyRound,
  Settings,
  Shield,
  ShoppingBag,
  UserX,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type ProfileSettingsNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: { label: string; tone: 'labs' };
  danger?: boolean;
};

export const profileSettingsNavItems: ProfileSettingsNavItem[] = [
  { href: '/profile', label: 'Settings', icon: Settings },
  { href: '/profile/subscriptions', label: 'Subscriptions', icon: CreditCard },
  {
    href: '/profile/tournament-templates',
    label: 'Tournament Templates',
    icon: FileStack,
    badge: { label: 'Labs', tone: 'labs' },
  },
  { href: '/profile/payout', label: 'Payout Preferences', icon: Wallet },
  { href: '/profile/authentications', label: 'Authentications', icon: Shield },
  { href: '/profile/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/profile/password', label: 'Password', icon: KeyRound },
  { href: '/profile/api', label: 'Developer API', icon: Code },
  {
    href: '/profile/deactivate',
    label: 'Deactivate Account',
    icon: UserX,
    danger: true,
  },
];

export function isProfileSettingsNavActive(pathname: string, href: string): boolean {
  if (href === '/profile') {
    return pathname === '/profile';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
