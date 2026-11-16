'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, StudentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { generateStudentNumber } from '@/lib/id-generator';

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  admissionYear: number;
  schoolClassId: string;
}

// Generate an ID and ensure it does not collide in the database
async function getUniqueStudentNumber(year: number): Promise<string> {
  let isUnique = false;
  let candidate = '';
  
  while (!isUnique) {
    candidate = generateStudentNumber(year);
    const existing = await prisma.student.findUnique({
      where: { studentNumber: candidate },
    });
    if (!existing) isUnique = true;
  }
  
  return candidate;
}

export async function createStudentAction(input: CreateStudentInput) {
  const session = await getSession();

  if (!session || (session.role !== Role.ADMIN && session.role !== Role.TEACHER)) {
    return { error: 'Unauthorized: Administrative role required.' };
  }

  try {
    const { firstName, lastName, dateOfBirth, admissionYear, schoolClassId } = input;

    if (!firstName?.trim() || !lastName?.trim() || !dateOfBirth || !schoolClassId) {
      return { error: 'All fields are required.' };
    }

    const year = Number(admissionYear) || 2027;
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    // 1. Generate unpredictable, hyphen-free ID: e.g. PHR27K8M4
    const studentNumber = await getUniqueStudentNumber(year);
    const username = studentNumber.toLowerCase();

    // 2. Default password hash
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    const email = `${cleanFirst.toLowerCase()}.${cleanLast.toLowerCase()}.${studentNumber.toLowerCase()}@student.phronesis.ac.zw`;

    // 3. Atomically create User, Student, and Enrolment
    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          passwordHash: defaultPasswordHash,
          role: Role.STUDENT,
        },
      });

      const student = await tx.student.create({
        data: {
          studentNumber,
          firstName: cleanFirst,
          lastName: cleanLast,
          dateOfBirth: new Date(dateOfBirth),
          admissionYear: year,
          status: StudentStatus.ENROLLED,
          userId: user.id,
          enrolments: {
            create: {
              academicYear: year,
              schoolClassId,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'STUDENT_ENROLLED',
          details: `Enrolled student ${cleanFirst} ${cleanLast} with ID ${studentNumber}.`,
        },
      });

      return student;
    });

    revalidatePath('/portal/students');
    revalidatePath('/portal');

    return {
      success: true,
      student: {
        id: newStudent.id,
        studentNumber: newStudent.studentNumber,
        fullName: `${newStudent.firstName} ${newStudent.lastName}`,
      },
    };
  } catch (error: any) {
    return { error: error?.message || 'Failed to create student record.' };
  }
}