import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** How often to re-fetch user fields from the database inside the JWT callback. */
const JWT_USER_REFRESH_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, username: true, role: true, password: true },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.username, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { id: string; role: string }).role;
        token.name = user.name;
        token.email = user.email;
      }

      if (token.id) {
        const lastRefresh = token.userRefreshedAt ?? 0;
        const shouldRefresh = Date.now() - lastRefresh > JWT_USER_REFRESH_MS;

        if (shouldRefresh) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                role: true,
                username: true,
                email: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
              },
            });
            if (dbUser) {
              token.role = dbUser.role;
              token.name = dbUser.username;
              token.email = dbUser.email;
              token.subscriptionPlan = dbUser.subscriptionPlan;
              token.subscriptionStatus = dbUser.subscriptionStatus;
            }
            token.userRefreshedAt = Date.now();
          } catch (error) {
            console.error('JWT user refresh failed — using cached session data:', error);
          }
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        session.user.subscriptionPlan = (token.subscriptionPlan as string | undefined) ?? 'free';
        session.user.subscriptionStatus = (token.subscriptionStatus as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
