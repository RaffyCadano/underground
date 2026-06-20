'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function registerUser(_prev: { error?: string } | null, formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!username || !email || !password || !confirm) {
    return { error: 'All fields are required.' };
  }
  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const count = await prisma.user.count();
  const role = count === 0 ? 'admin' : 'player';
  const hash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({ data: { username, email, password: hash, role } });
  } catch {
    return { error: 'Username or email is already taken.' };
  }

  redirect('/login?registered=1');
}
