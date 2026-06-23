import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export const metadata = {
  title: `Refund Policy | ${SITE_NAME}`,
};

export default function RefundPolicyPage() {
  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Refund Policy</h1>
          <p className="mt-2 text-sm text-slate-400">
            {SITE_NAME} Premier subscription refunds
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          <p>
            Premier subscriptions are billed in advance on a monthly or annual basis. You may
            cancel at any time from your profile; access continues through the end of the current
            billing period.
          </p>
          <p>
            Refund requests for annual plans may be considered within 14 days of purchase if
            Premier features have not been substantially used. Monthly plans are generally
            non-refundable once the billing period has started.
          </p>
          <p>
            For billing questions, contact support through your{' '}
            <Link href="/profile/subscriptions" className="text-brand-300 hover:text-brand-200">
              subscription settings
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
