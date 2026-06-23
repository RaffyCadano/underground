import { isAdminRole } from '@/lib/roles';
import { isPremierPlan } from '@/lib/subscriptions';

type AdUser = {
  subscriptionPlan: string;
  optOutPersonalizedAds: boolean;
} | null | undefined;

/** Whether Adcash display ads should load for this viewer (dashboard only). */
export function shouldShowAds(user: AdUser, role?: string | null): boolean {
  if (isAdminRole(role ?? '')) return false;
  if (!user) return true;
  if (isPremierPlan(user.subscriptionPlan)) return false;
  if (user.optOutPersonalizedAds) return false;
  return true;
}
