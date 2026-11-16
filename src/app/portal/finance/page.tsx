import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { Coins } from 'lucide-react';
import { RecordPaymentDialog } from '@/components/record-payment-dialog';
import { GenerateInvoiceDialog } from '@/components/generate-invoice-dialog';
import { BursaryLedgerClient, SerializedInvoice } from '@/components/bursary-ledger-client';

export const instant = false;

export default async function FinancePage() {
  await connection();
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const isStudent = session.role === Role.STUDENT;
  const canManage = session.role === Role.ADMIN || session.role === Role.FINANCE;

  const whereClause: any = {};
  if (isStudent && session.studentId) {
    whereClause.studentId = session.studentId;
  }

  const [invoices, terms, classes, students] = await prisma.$transaction([
    prisma.invoice.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            enrolments: {
              include: { schoolClass: true },
              orderBy: { academicYear: 'desc' },
              take: 1,
            },
          },
        },
        term: { include: { academicYear: true } },
        items: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    canManage
      ? prisma.term.findMany({
          include: { academicYear: true },
          orderBy: [{ academicYear: { year: 'desc' } }, { termNumber: 'asc' }],
        })
      : prisma.term.findMany({ take: 0, include: { academicYear: true } }),
    canManage
      ? prisma.schoolClass.findMany({ orderBy: [{ formLevel: 'asc' }, { name: 'asc' }] })
      : prisma.schoolClass.findMany({ take: 0 }),
    canManage
      ? prisma.student.findMany({
          where: { status: 'ENROLLED' },
          include: {
            enrolments: {
              include: { schoolClass: true },
              orderBy: { academicYear: 'desc' },
              take: 1,
            },
          },
          orderBy: { firstName: 'asc' },
        })
      : prisma.student.findMany({
          take: 0,
          include: { enrolments: { include: { schoolClass: true } } },
        }),
  ]);

  const serializedInvoices: SerializedInvoice[] = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    studentId: inv.studentId,
    studentNumber: inv.student.studentNumber,
    studentName: `${inv.student.firstName} ${inv.student.lastName}`,
    className: inv.student.enrolments[0]?.schoolClass.name || 'Unassigned',
    termNumber: inv.term.termNumber,
    academicYear: inv.term.academicYear.year,
    totalDue: inv.totalDue,
    balance: inv.balance,
    items: inv.items.map((i) => ({
      id: i.id,
      description: i.description,
      amount: i.amount,
    })),
    payments: inv.payments.map((p) => ({
      id: p.id,
      receiptNo: p.receiptNo,
      amountPaid: p.amountPaid,
      method: p.method,
      reference: p.reference,
      paymentDate: p.paymentDate.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-[#0f1e36]" />
            <h1 className="text-xl font-serif font-bold text-[#0f1e36]">
              {isStudent ? 'My Fee Statement & Receipts' : 'Bursary & Fee Accounting Control'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent
              ? 'View your termly tuition invoices, payment receipts, and balance clearance status.'
              : 'Termly and annual fee summaries, bulk class invoicing, payment receipting, and debtors reporting.'}
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <GenerateInvoiceDialog
              terms={terms.map((t) => ({
                id: t.id,
                termNumber: t.termNumber,
                year: t.academicYear.year,
              }))}
              classes={classes.map((c) => ({
                id: c.id,
                name: c.name,
                formLevel: c.formLevel,
              }))}
              students={students.map((s) => ({
                id: s.id,
                studentNumber: s.studentNumber,
                fullName: `${s.firstName} ${s.lastName}`,
                className: s.enrolments[0]?.schoolClass.name || 'Unassigned',
              }))}
            />

            {invoices.some((i) => i.balance > 0) && (
              <RecordPaymentDialog
                invoices={invoices
                  .filter((i) => i.balance > 0)
                  .map((i) => ({
                    id: i.id,
                    invoiceNumber: i.invoiceNumber,
                    studentName: `${i.student.firstName} ${i.student.lastName} (${i.student.studentNumber})`,
                    balance: i.balance,
                  }))}
              />
            )}
          </div>
        )}
      </div>

      <BursaryLedgerClient invoices={serializedInvoices} isStudent={isStudent} />
    </div>
  );
}