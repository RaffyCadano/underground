import type { Metadata } from 'next';
import './globals.css';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppSessionProvider } from '@/app/components/session-provider';
import { SignedOutToast } from '@/app/components/signed-out-toast';
import { SignedInToast } from '@/app/components/signed-in-toast';
import { SmoothScrollProvider } from '@/app/components/smooth-scroll-provider';
import { SiteChrome } from '@/app/components/site-chrome';
import { prisma } from '@/lib/prisma';
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
  const session = await getServerSession(authOptions);

  let avatar: string | null = null;

  if (session?.user?.id != null) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });
    avatar = user?.avatar ?? null;
  }

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <AppSessionProvider>
          <SignedOutToast />
          <SignedInToast />
          <SmoothScrollProvider>
            <SiteChrome session={session} avatar={avatar}>
              {children}
            </SiteChrome>
          </SmoothScrollProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
