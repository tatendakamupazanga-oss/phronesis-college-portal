'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, ResultStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

function calculateZimsecGrade(percentage: number): string {
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'U';
}

export interface BulkMarkRow {
  studentNumber: string;
  mark: number;
  maxMark?: number;
  notes?: string;
}

export async function bulkUploadMarksAction(examId: string, subjectId: string, rows: BulkMarkRow[]) {
  const session = await getSession();

  if (!session || (session.role !== Role.TEACHER && session.role !== Role.ADMIN)) {
    return { error: 'Unauthorized: Only teachers or administrators can record marks.' };
  }

  if (!examId || !subjectId || rows.length === 0) {
    return { error: 'Please supply a valid examination, subject, and at least one student mark row.' };
  }

  try {
    let successCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const student = await prisma.student.findUnique({
        where: { studentNumber: row.studentNumber.trim().toUpperCase() },
      });

      if (!student) {
        errors.push(`Student ID "${row.studentNumber}" not found in database.`);
        continue;
      }

      const mark = Number(row.mark);
      const maxMark = Number(row.maxMark || 100);

      if (isNaN(mark) || mark < 0 || mark > maxMark) {
        errors.push(`Invalid score (${row.mark}/${maxMark}) for ${row.studentNumber}.`);
        continue;
      }

      const percentage = Number(((mark / maxMark) * 100).toFixed(1));
      const gradeLetter = calculateZimsecGrade(percentage);

      await prisma.examMark.upsert({
        where: {
          examId_studentId_subjectId: {
            examId,
            studentId: student.id,
            subjectId,
          },
        },
        update: {
          mark,
          maxMark,
          percentage,
          gradeLetter,
          teacherNotes: row.notes || null,
          status: ResultStatus.SUBMITTED,
        },
        create: {
          examId,
          studentId: student.id,
          subjectId,
          mark,
          maxMark,
          percentage,
          gradeLetter,
          teacherNotes: row.notes || null,
          status: ResultStatus.SUBMITTED,
        },
      });

      successCount++;
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'BULK_MARKS_UPLOADED',
        details: `Bulk imported ${successCount} marks for exam ${examId}.`,
      },
    });

    revalidatePath('/portal/academics');
    revalidatePath('/portal');

    return { success: true, processedCount: successCount, errors };
  } catch (error: any) {
    console.error('Bulk mark upload failure:', error);
    return { error: error?.message || 'Failed to process bulk mark import.' };
  }
}