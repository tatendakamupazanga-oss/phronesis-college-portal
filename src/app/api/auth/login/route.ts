import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanInput = String(username).trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanInput, mode: 'insensitive' } },
          { email: { equals: cleanInput, mode: 'insensitive' } },
          { student: { studentNumber: { equals: cleanInput, mode: 'insensitive' } } },
          { staff: { staffNumber: { equals: cleanInput, mode: 'insensitive' } } },
        ],
      },
      include: {
        staff: true,
        student: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials or inactive account' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      staffId: user.staff?.id,
      studentId: user.student?.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}