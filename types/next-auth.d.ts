import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      subscriptionPlan: string;
      subscriptionStatus: string | null;
      avatar: string | null;
    };
  }
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string | null;
    avatar?: string | null;
    userRefreshedAt?: number;
  }
}
