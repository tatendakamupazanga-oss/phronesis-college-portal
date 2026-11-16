'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: 'Session expired. Please log in again.' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Please fill in all password fields.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirmation do not match.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters long.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'User account not found.' };
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { error: 'Incorrect current password.' };
    }

    // Prevent reusing current password
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return { error: 'New password cannot be identical to your current password.' };
    }

    // Hash and update
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          details: `User ${user.username} successfully updated their password.`,
        },
      }),
    ]);

    revalidatePath('/portal/settings');

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { error: 'An unexpected error occurred while updating your password.' };
  }
}