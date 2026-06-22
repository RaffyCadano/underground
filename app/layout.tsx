import type { Metadata } from 'next';
import './globals.css';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppSessionProvider } from '@/app/components/session-provider';
import { SmoothScrollProvider } from '@/app/components/smooth-scroll-provider';
import { SiteBrand } from '@/app/components/site-brand';
import { SiteFooter } from '@/app/components/site-footer';
import { SiteNav } from '@/app/components/site-nav';
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

  const avatar =
    session?.user?.id != null
      ? (
          await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { avatar: true },
          })
        )?.avatar ?? null
      : null;

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <AppSessionProvider>
          <SmoothScrollProvider>
            <div className="flex min-h-screen flex-col text-slate-100">
              <header className="relative sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="container flex items-center justify-between gap-6 py-3">
                  <SiteBrand />
                  <SiteNav session={session} avatar={avatar} />
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <SiteFooter session={session} />
            </div>
          </SmoothScrollProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
