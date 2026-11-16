'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role, StudentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function generateReceiptNumber(year: number): Promise<string> {
  const prefix = `REC-${year}-`;
  const count = await prisma.payment.count({
    where: { receiptNo: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

async function generateInvoiceNumber(year: number, offset: number = 0): Promise<string> {
  const prefix = `INV-${year}-`;
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1 + offset).padStart(4, '0')}`;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: 'Ecocash' | 'Bank Transfer' | 'Cash' | 'Direct Deposit';
  reference?: string;
}

export async function recordPaymentAction(input: RecordPaymentInput) {
  const session = await getSession();

  if (!session || (session.role !== Role.FINANCE && session.role !== Role.ADMIN)) {
    return { error: 'Unauthorized: Only Finance or Administration can post fee payments.' };
  }

  try {
    const { invoiceId, amount, method, reference } = input;

    if (!invoiceId || !amount || amount <= 0) {
      return { error: 'A valid invoice and positive payment amount are required.' };
    }

    const currentYear = new Date().getFullYear();
    const receiptNo = await generateReceiptNumber(currentYear);

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { student: true },
      });

      if (!invoice) throw new Error('Invoice not found.');
      if (amount > invoice.balance) {
        throw new Error(`Amount ($${amount}) exceeds remaining balance ($${invoice.balance.toFixed(2)}).`);
      }

      const payment = await tx.payment.create({
        data: {
          receiptNo,
          invoiceId: invoice.id,
          amountPaid: amount,
          method,
          reference: reference?.trim() || null,
        },
      });

      const updatedBalance = Number((invoice.balance - amount).toFixed(2));

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { balance: updatedBalance },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PAYMENT_RECEIPTED',
          details: `Logged payment ${receiptNo} of $${amount} via ${method} for ${invoice.student.studentNumber}. Remaining balance: $${updatedBalance}.`,
        },
      });

      return { payment };
    });

    revalidatePath('/portal/finance');
    revalidatePath('/portal/academics');
    revalidatePath('/portal');

    return { success: true, receiptNo: result.payment.receiptNo };
  } catch (error: any) {
    return { error: error?.message || 'Failed to record fee payment.' };
  }
}

export interface GenerateInvoiceInput {
  mode: 'INDIVIDUAL' | 'CLASS';
  studentId?: string;
  schoolClassId?: string;
  termId: string;
  items: { description: string; amount: number }[];
  skipIfAlreadyBilled?: boolean;
}

export async function generateInvoicesAction(input: GenerateInvoiceInput) {
  const session = await getSession();

  if (!session || (session.role !== Role.FINANCE && session.role !== Role.ADMIN)) {
    return { error: 'Unauthorized: Only Finance or Administration can generate invoices.' };
  }

  try {
    const { mode, studentId, schoolClassId, termId, items, skipIfAlreadyBilled = true } = input;

    const validItems = items.filter((i) => i.description.trim() && Number(i.amount) > 0);
    if (!termId || validItems.length === 0) {
      return { error: 'Please select a term and add at least one valid fee line item.' };
    }

    const totalDue = Number(
      validItems.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)
    );

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: { academicYear: true },
    });

    if (!term) return { error: 'Selected academic term not found.' };

    // Resolve target students
    let targetStudents: { id: string; studentNumber: string; firstName: string; lastName: string }[] = [];

    if (mode === 'INDIVIDUAL') {
      if (!studentId) return { error: 'Please select a student.' };
      const st = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, studentNumber: true, firstName: true, lastName: true },
      });
      if (!st) return { error: 'Student not found.' };
      targetStudents = [st];
    } else {
      if (!schoolClassId) return { error: 'Please select a class.' };
      const enrolments = await prisma.enrolment.findMany({
        where: {
          schoolClassId,
          academicYear: term.academicYear.year,
          student: { status: StudentStatus.ENROLLED },
        },
        include: {
          student: {
            select: { id: true, studentNumber: true, firstName: true, lastName: true },
          },
        },
      });
      targetStudents = enrolments.map((e) => e.student);
    }

    if (targetStudents.length === 0) {
      return { error: 'No enrolled students found for the selected target.' };
    }

    // Check existing invoices for this term to avoid accidental double-billing
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        termId,
        studentId: { in: targetStudents.map((s) => s.id) },
      },
      select: { studentId: true },
    });
    const alreadyBilledIds = new Set(existingInvoices.map((i) => i.studentId));

    const studentsToBill = skipIfAlreadyBilled
      ? targetStudents.filter((s) => !alreadyBilledIds.has(s.id))
      : targetStudents;

    if (studentsToBill.length === 0) {
      return {
        error: `All ${targetStudents.length} student(s) already have an invoice generated for Term ${term.termNumber}.`,
      };
    }

    const baseCount = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `INV-${term.academicYear.year}-` } },
    });

    await prisma.$transaction(async (tx) => {
      for (let idx = 0; idx < studentsToBill.length; idx++) {
        const st = studentsToBill[idx];
        const invoiceNumber = `INV-${term.academicYear.year}-${String(baseCount + 1 + idx).padStart(4, '0')}`;

        const inv = await tx.invoice.create({
          data: {
            invoiceNumber,
            studentId: st.id,
            termId: term.id,
            totalDue,
            balance: totalDue,
          },
        });

        await tx.invoiceItem.createMany({
          data: validItems.map((item) => ({
            invoiceId: inv.id,
            description: item.description.trim(),
            amount: Number(item.amount),
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'INVOICES_GENERATED',
          details: `Generated ${studentsToBill.length} invoice(s) of $${totalDue.toFixed(2)} for Term ${term.termNumber} (${term.academicYear.year}).`,
        },
      });
    });

    revalidatePath('/portal/finance');
    revalidatePath('/portal/academics');
    revalidatePath('/portal');

    const skippedCount = targetStudents.length - studentsToBill.length;
    return {
      success: true,
      createdCount: studentsToBill.length,
      skippedCount,
    };
  } catch (error: any) {
    return { error: error?.message || 'Failed to generate invoices.' };
  }
}