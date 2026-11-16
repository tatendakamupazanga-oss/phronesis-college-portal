'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, StudentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// Sequential student number generator (e.g. SCH-2027-0005)
async function generateStudentNumber(admissionYear: number): Promise<string> {
  const prefix = `SCH-${admissionYear}-`;
  const count = await prisma.student.count({
    where: { admissionYear },
  });
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
}

export async function enrolApplicationAction(applicationId: string, schoolClassId?: string) {
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN) {
    return { error: 'Unauthorized: Only school administrators can enrol accepted candidates.' };
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { error: 'Application record not found.' };
    }

    if (application.status !== 'ACCEPTED') {
      return { error: 'Only applications marked as ACCEPTED can be enrolled.' };
    }

    // Resolve or find target class
    let assignedClass = schoolClassId
      ? await prisma.schoolClass.findUnique({ where: { id: schoolClassId } })
      : null;

    if (!assignedClass) {
      // Find default class matching applicant's target form (e.g., Form 1)
      assignedClass = await prisma.schoolClass.findFirst({
        where: { formLevel: application.targetForm },
      });

      if (!assignedClass) {
        // Fallback: create default stream if none exists
        assignedClass = await prisma.schoolClass.create({
          data: {
            formLevel: application.targetForm,
            name: `Form ${application.targetForm}A`,
          },
        });
      }
    }

    // Resolve current term and academic year for initial tuition invoice
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      include: { terms: { take: 1, orderBy: { termNumber: 'asc' } } },
    });

    const studentYear = application.entryYear || 2027;
    const studentNumber = await generateStudentNumber(studentYear);
    const username = studentNumber.toLowerCase();
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create student login account
      const user = await tx.user.create({
        data: {
          username,
          email: application.guardianEmail || undefined,
          passwordHash,
          role: Role.STUDENT,
        },
      });

      // 2. Create Student profile
      const student = await tx.student.create({
        data: {
          studentNumber,
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          admissionYear: studentYear,
          status: StudentStatus.ENROLLED,
          userId: user.id,
        },
      });

      // 3. Enrol in School Class Stream
      await tx.enrolment.create({
        data: {
          studentId: student.id,
          schoolClassId: assignedClass!.id,
          academicYear: studentYear,
        },
      });

      // 4. Generate official Prospectus fees breakdown
      if (currentAcademicYear && currentAcademicYear.terms.length > 0) {
        const term = currentAcademicYear.terms[0];
        const invoiceCount = await tx.invoice.count();
        const invoiceNumber = `INV-${studentYear}-${String(invoiceCount + 1).padStart(4, '0')}`;

        // Official Prospectus Fee Schedule:
        // Registration: $15, Uniforms: $180, Tuition: $210, Stationery/Bond: $5 -> Total: $410
        const lineItems = [
          { description: 'Term 1 Tuition Fees', amount: 210.0 },
          { description: 'School Uniforms (Blazer, Shirts, Trousers/Skirts, Sports)', amount: 180.0 },
          { description: 'Enrolment & Registration Fee', amount: 15.0 },
          { description: 'Stationery & Bond Paper Levy', amount: 5.0 },
        ];

        const totalDue = lineItems.reduce((acc, item) => acc + item.amount, 0); // $410.00

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            studentId: student.id,
            termId: term.id,
            totalDue,
            balance: totalDue,
          },
        });

        await tx.invoiceItem.createMany({
          data: lineItems.map((item) => ({
            invoiceId: invoice.id,
            description: item.description,
            amount: item.amount,
          })),
        });
      }

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'STUDENT_ENROLLED_FROM_APPLICATION',
          details: `Enrolled ${application.firstName} ${application.lastName} from app ${application.applicationNo} as ${studentNumber} into ${assignedClass!.name}.`,
        },
      });

      return { student, studentNumber, className: assignedClass!.name };
    });

    revalidatePath('/portal/admissions');
    revalidatePath('/portal/students');
    revalidatePath('/portal');

    return {
      success: true,
      studentNumber: result.studentNumber,
      name: `${application.firstName} ${application.lastName}`,
      className: result.className,
    };
  } catch (error: any) {
    console.error('Enrol application error:', error);
    return { error: error?.message || 'Failed to complete enrolment transaction.' };
  }
}