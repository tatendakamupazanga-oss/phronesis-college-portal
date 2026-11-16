'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { Role } from '@prisma/client';

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headerList.get('x-real-ip') || '127.0.0.1';
}

// 1. PUBLIC / STUDENT LOGIN ACTION (Only permits Role.STUDENT)
export async function studentLoginAction(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const ip = await getClientIp();

  if (!username || !password) {
    return { error: 'Please enter both your Student Number and Password.' };
  }

  const rateKey = `student-login:${ip}:${username}`;
  const rateStatus = checkRateLimit(rateKey, 6, 900); // 6 attempts per 15 min

  if (!rateStatus.success) {
    return {
      error: `Too many failed attempts. Login locked for ${Math.ceil(rateStatus.resetSeconds / 60)} minutes.`,
    };
  }

  try {
    // Searches by username, email, or Student ID (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: username, mode: 'insensitive' } },
          { student: { studentNumber: { equals: username, mode: 'insensitive' } } },
        ],
      },
      include: { student: true },
    });

    if (!user || user.role !== Role.STUDENT) {
      return { error: 'Invalid student credentials.' };
    }

    if (!user.isActive) {
      return { error: 'This student account has been deactivated. Please contact the Bursar.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return { error: `Invalid student credentials. (${rateStatus.remaining} attempts remaining)` };
    }

    resetRateLimit(rateKey);

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      studentId: user.student?.id,
    });

    return { success: true, redirectUrl: '/portal' };
  } catch (error: any) {
    console.error('DEBUG STUDENT AUTH ERROR:', error);
    return { error: error?.message || 'An unexpected system error occurred during authentication.' };
  }
}

// 2. STAFF/ADMIN LOGIN ACTION (Only permits ADMIN, TEACHER, FINANCE, LIBRARIAN)
export async function staffGateLoginAction(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const ip = await getClientIp();

  if (!username || !password) {
    return { error: 'Please provide administrator credentials.' };
  }

  const rateKey = `staff-gate:${ip}:${username}`;
  const rateStatus = checkRateLimit(rateKey, 4, 1800); // Strict: 4 attempts per 30 minutes

  if (!rateStatus.success) {
    return {
      error: `Access Denied: Administrative gateway throttled. Retry in ${Math.ceil(rateStatus.resetSeconds / 60)} minutes.`,
    };
  }

  try {
    // Searches by username, email, or Staff ID like PHRADM8K5 (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: username, mode: 'insensitive' } },
          { staff: { staffNumber: { equals: username, mode: 'insensitive' } } },
        ],
      },
      include: { staff: true },
    });

    // Reject non-staff roles immediately
    if (!user || user.role === Role.STUDENT) {
      return { error: 'Access unauthorized. Identity is not assigned to academic or administrative staff.' };
    }

    if (!user.isActive) {
      return { error: 'This staff dossier has been locked.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return { error: `Authentication failed. (${rateStatus.remaining} attempts remaining)` };
    }

    resetRateLimit(rateKey);

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      staffId: user.staff?.id,
    });

    return { success: true, redirectUrl: '/portal' };
  } catch (error: any) {
    console.error('DEBUG STAFF AUTH ERROR:', error);
    return { error: error?.message || 'Gateway verification encountered an internal error.' };
  }
}