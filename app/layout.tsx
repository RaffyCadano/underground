import type { Metadata } from 'next';
import './globals.css';
import { headers } from 'next/headers';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { getCachedServerSession } from '@/lib/auth-session';
import { AppSessionProvider } from '@/app/components/session-provider';
import { SignedOutToast } from '@/app/components/signed-out-toast';
import { SignedInToast } from '@/app/components/signed-in-toast';
import { SmoothScrollProvider } from '@/app/components/smooth-scroll-provider';
import { SiteChrome } from '@/app/components/site-chrome';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedServerSession();
  const headersList = await headers();
  const isEmbed = (headersList.get('x-pathname') ?? '').includes('/embed');
  const avatar = session?.user?.avatar ?? null;

  const page = isEmbed ? (
    <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>
  ) : (
    <SiteChrome session={session} avatar={avatar}>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </SiteChrome>
  );

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <AppSessionProvider>
          <SignedOutToast />
          <SignedInToast />
          {page}
        </AppSessionProvider>
      </body>
    </html>
  );
}
