import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/** One session read per request (root layout + nested layouts). */
export const getCachedServerSession = cache(() => getServerSession(authOptions));
