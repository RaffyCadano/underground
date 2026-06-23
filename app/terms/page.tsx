import Link from 'next/link';
import { SITE_FULL_NAME, SITE_NAME } from '@/lib/site';

export const metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
};

export default function TermsOfServicePage() {
  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: June 22, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Agreement</h2>
            <p>
              By using {SITE_FULL_NAME} ({SITE_NAME}), you agree to these Terms of Service and our{' '}
              <Link href="/privacy" className="text-brand-300 hover:text-brand-200">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Accounts</h2>
            <p>
              You are responsible for your account credentials and for activity under your account.
              Provide accurate information and notify us of unauthorized use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Violate laws or others&apos; rights</li>
              <li>Upload malware, spam, or abusive content</li>
              <li>Attempt to disrupt, scrape, or reverse engineer the service</li>
              <li>Misrepresent tournament results or impersonate others</li>
              <li>Interfere with advertisements or circumvent ad-free Premier benefits</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Tournaments and user content</h2>
            <p>
              Organizers and participants are responsible for the accuracy of brackets, scores, and
              other content they submit. We may remove content that violates these terms or harms the
              community.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Subscriptions and billing</h2>
            <p>
              Premier plans are billed as described at checkout. Refunds are governed by our{' '}
              <Link href="/refund-policy" className="text-brand-300 hover:text-brand-200">
                Refund Policy
              </Link>
              . We may change pricing with reasonable notice where required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Advertising</h2>
            <p>
              Free accounts may see third-party advertisements clearly labeled on the site. Premier
              subscribers receive an ad-free experience subject to their active subscription.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Disclaimer</h2>
            <p>
              The service is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, {SITE_NAME} and its operators are not liable
              for indirect, incidental, or consequential damages arising from your use of the
              service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Changes and termination</h2>
            <p>
              We may update these terms or suspend access for violations. Continued use after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Contact</h2>
            <p>
              Questions about these terms?{' '}
              <Link href="/contact" className="text-brand-300 hover:text-brand-200">
                Contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
