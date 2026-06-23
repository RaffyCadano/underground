import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export const metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
};

export default function PrivacyPolicyPage() {
  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: June 22, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Overview</h2>
            <p>
              {SITE_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates this website to
              host Beyblade X tournaments, rankings, and related community features. This policy
              explains what information we collect, how we use it, and your choices—including how
              advertising and cookies work on our site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-slate-200">Account data:</strong> email address, display
                name, and profile details you provide when registering or updating your account.
              </li>
              <li>
                <strong className="text-slate-200">Tournament activity:</strong> brackets, match
                results, team and player records you create or participate in.
              </li>
              <li>
                <strong className="text-slate-200">Billing data:</strong> subscription status and
                payment-related identifiers processed by our payment provider (we do not store full
                card numbers on our servers).
              </li>
              <li>
                <strong className="text-slate-200">Technical data:</strong> IP address, browser type,
                device information, and server logs used for security, analytics, and site operation.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Cookies and similar technologies</h2>
            <p>
              We use cookies and local storage to keep you signed in, remember preferences, and
              operate core site features. Some cookies are essential; others support analytics or
              advertising.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Advertising and third-party partners</h2>
            <p>
              Free accounts may see advertisements served through{' '}
              <a
                href="https://adcash.com"
                className="text-brand-300 hover:text-brand-200"
                rel="noopener noreferrer"
                target="_blank"
              >
                Adcash
              </a>{' '}
              and its advertising partners. Adcash and its partners may use cookies, web beacons,
              device identifiers, and similar technologies to:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Deliver and measure ads shown on our site</li>
              <li>Limit how often you see an ad</li>
              <li>Personalize ads based on your browsing activity across sites (where permitted)</li>
            </ul>
            <p>
              Adcash&apos;s privacy practices are described in their{' '}
              <a
                href="https://adcash.com/privacy-policy"
                className="text-brand-300 hover:text-brand-200"
                rel="noopener noreferrer"
                target="_blank"
              >
                privacy policy
              </a>
              . We label ad placements on our site as &quot;Advertisement&quot; so they are clearly
              distinguishable from editorial content.
            </p>
            <p>
              <strong className="text-slate-200">Go ad-free:</strong> Premier subscribers do not see
              site advertisements. You can also opt out of personalized advertising in your{' '}
              <Link href="/profile" className="text-brand-300 hover:text-brand-200">
                profile settings
              </Link>{' '}
              where available.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">How we use your information</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide and improve tournaments, rankings, and account features</li>
              <li>Process subscriptions and communicate about billing</li>
              <li>Protect against abuse, fraud, and security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Sharing</h2>
            <p>
              We do not sell your personal information. We share data with service providers who help
              us run the site (hosting, payments, email) and with advertising partners as described
              above. We may disclose information if required by law or to protect our users and
              platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Your rights and choices</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or
              restrict use of your personal data. Contact us to make a request. You can delete your
              account from profile settings where available.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Children</h2>
            <p>
              Our service is not directed at children under 13. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Changes</h2>
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at the
              top reflects the most recent revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Contact</h2>
            <p>
              Questions about this policy? Reach out through your{' '}
              <Link href="/profile" className="text-brand-300 hover:text-brand-200">
                account profile
              </Link>{' '}
              or the contact method listed on our{' '}
              <Link href="/about" className="text-brand-300 hover:text-brand-200">
                About
              </Link>{' '}
              page.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
