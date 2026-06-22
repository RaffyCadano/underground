'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { sendPasswordResetEmail } from '@/lib/email';
import {
  appBaseUrl,
  createResetToken,
  findValidResetToken,
  hashResetToken,
  resetTokenExpiresAt,
} from '@/lib/password-reset';

const RESET_SUCCESS_MESSAGE =
  'If an account exists for that email, we sent password reset instructions. Check your inbox and spam folder.';

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

export async function requestPasswordReset(
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) {
    return { error: 'Email is required.' };
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return { error: 'Enter a valid email address.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (user) {
    const token = createResetToken();
    const tokenHash = hashResetToken(token);
    const expiresAt = resetTokenExpiresAt();

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${appBaseUrl()}/reset-password/${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error('[password-reset] Failed to send email:', err);
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      return { error: 'Could not send reset email. Try again later or contact an admin.' };
    }
  }

  return { success: true, message: RESET_SUCCESS_MESSAGE };
}

export async function resetPassword(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const token = (formData.get('token') as string)?.trim();
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!token) {
    return { error: 'Invalid reset link.' };
  }
  if (!password || !confirm) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const record = await findValidResetToken(token);
  if (!record) {
    return { error: 'This reset link is invalid or has expired. Request a new one.' };
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  redirect('/login?reset=1');
}

export async function changePassword(
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Sign in to change your password.' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!currentPassword || !password || !confirm) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { error: 'New passwords do not match.' };
  }
  if (currentPassword === password) {
    return { error: 'Choose a different password than your current one.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });
  if (!user) {
    return { error: 'Account not found.' };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: 'Current password is incorrect.' };
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidatePath('/profile');
  revalidatePath('/profile/password');
  revalidatePath('/dashboard/profile');

  return { success: true, message: 'Password updated successfully.' };
}
