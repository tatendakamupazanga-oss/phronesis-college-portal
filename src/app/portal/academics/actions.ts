'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, ResultStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Zimbabwean ZIMSEC Standard Grade Boundaries (internal helper)
function calculateZimsecGrade(percentage: number): string {
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'U';
}

export interface SaveMarkInput {
  examId: string;
  studentId: string;
  subjectId: string;
  mark: number;
  maxMark?: number;
  teacherNotes?: string;
}

export async function saveExamMarkAction(input: SaveMarkInput) {
  const session = await getSession();

  // Guard: Only Teachers and Admins can record or edit marks
  if (!session || (session.role !== Role.TEACHER && session.role !== Role.ADMIN)) {
    return { error: 'Unauthorized: Only teaching staff or administrators can enter marks.' };
  }

  try {
    const { examId, studentId, subjectId, mark, teacherNotes } = input;
    const maxMark = input.maxMark || 100;

    if (mark < 0 || mark > maxMark) {
      return { error: `Mark must be between 0 and ${maxMark}.` };
    }

    const percentage = Number(((mark / maxMark) * 100).toFixed(1));
    const gradeLetter = calculateZimsecGrade(percentage);

    const record = await prisma.examMark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId,
          studentId,
          subjectId,
        },
      },
      update: {
        mark,
        maxMark,
        percentage,
        gradeLetter,
        teacherNotes: teacherNotes || null,
        status: ResultStatus.SUBMITTED,
      },
      create: {
        examId,
        studentId,
        subjectId,
        mark,
        maxMark,
        percentage,
        gradeLetter,
        teacherNotes: teacherNotes || null,
        status: ResultStatus.SUBMITTED,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'MARK_RECORDED',
        details: `Saved mark ${mark}/${maxMark} (${gradeLetter}) for student ID ${studentId}.`,
      },
    });

    revalidatePath('/portal/academics');
    revalidatePath('/portal');

    return { success: true, mark: record };
  } catch (error: any) {
    console.error('Failed to save exam mark:', error);
    return { error: error?.message || 'Failed to record assessment mark.' };
  }
}

export async function publishMarksAction(examId: string) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN) {
    return { error: 'Unauthorized: Only Administrators can publish final marks.' };
  }

  try {
    await prisma.examMark.updateMany({
      where: { examId },
      data: { status: ResultStatus.PUBLISHED },
    });

    revalidatePath('/portal/academics');
    revalidatePath('/portal');

    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to publish marks.' };
  }
}