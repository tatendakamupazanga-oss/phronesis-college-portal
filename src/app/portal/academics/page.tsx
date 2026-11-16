import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RecordMarkDialog } from '@/components/record-mark-dialog';
import { AcademicsFolderView, SubjectFolderData, MarkRecord } from '@/components/academics-folder-view';
import { Award, Layers } from 'lucide-react';
import { Role, ResultStatus } from '@prisma/client';
import { BulkMarksDialog } from '@/components/bulk-marks-dialog';

export const instant = false;

export default async function AcademicsPage() {
  await connection();
  const session = await getSession();
// Block results if student carries an unpaid fee balance
  if (session?.role === Role.STUDENT && session?.studentId) {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        studentId: session.studentId,
        balance: { gt: 0 },
      },
      include: { term: { include: { academicYear: true } } },
    });

    if (unpaidInvoices.length > 0) {
      const totalArrears = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);

      return (
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden font-sans">
          <div className="bg-amber-600 text-white px-6 py-4 flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
              !
            </span>
            <div>
              <h1 className="text-base font-bold">Academic Results Withheld — Fee Clearance Required</h1>
              <p className="text-xs text-amber-100">Phronesis College Bursary & Examinations Policy</p>
            </div>
          </div>

          <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>
              Access to your published terminal examination marks and report cards is temporarily restricted because your student account carries an outstanding fee balance of{' '}
              <span className="font-mono font-extrabold text-amber-700 text-sm">
                ${totalArrears.toFixed(2)}
              </span>
              .
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="block font-bold text-slate-600 uppercase text-[10px]">
                Unsettled Invoices
              </span>
              {unpaidInvoices.map((inv) => (
                <div key={inv.id} className="flex justify-between font-mono text-xs">
                  <span>
                    {inv.invoiceNumber} (Term {inv.term.termNumber} • {inv.term.academicYear.year})
                  </span>
                  <span className="font-bold text-amber-700">${inv.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-500">
              Once your balance is settled at the Bursar&apos;s Office or via bank transfer and receipted on the portal, your academic results will unlock automatically.
            </p>

            <div className="pt-2">
              <a
                href="/portal/finance"
                className="inline-flex items-center gap-2 bg-[#0f1e36] hover:bg-[#1a335c] text-white font-bold px-5 py-2.5 rounded-xl transition"
              >
                <span>View Fee Statement & Receipts &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  const isStudent = session?.role === Role.STUDENT;
  const canRecord = session?.role === Role.TEACHER || session?.role === Role.ADMIN;

  // Query filter: students only see their own PUBLISHED results
  const marksWhere: any = {};
  if (isStudent && session?.studentId) {
    marksWhere.studentId = session.studentId;
    marksWhere.status = ResultStatus.PUBLISHED;
  }

  // Fetch data sequentially to prevent pooler timeout on cold Neon compute
  const subjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
  });

  const classes = await prisma.schoolClass.findMany({
    orderBy: [{ formLevel: 'asc' }, { name: 'asc' }],
  });

  const marks = await prisma.examMark.findMany({
    where: marksWhere,
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
      subject: true,
      exam: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const students = canRecord
    ? await prisma.student.findMany({
        orderBy: { studentNumber: 'asc' },
        select: { id: true, firstName: true, lastName: true, studentNumber: true },
      })
    : [];

  const exams = canRecord
    ? await prisma.exam.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true },
      })
    : [];

  // Structure marks into Subject Folders -> Class Streams
  const folders: SubjectFolderData[] = subjects.map((subject) => {
    const subjectMarks = marks.filter((m) => m.subjectId === subject.id);
    const classMap: Record<string, { className: string; formLevel: number; marks: MarkRecord[] }> = {};

    subjectMarks.forEach((m) => {
      const enrolment = m.student.enrolments[0];
      const className = enrolment?.schoolClass.name || 'Unassigned Stream';
      const formLevel = enrolment?.schoolClass.formLevel || 1;

      if (!classMap[className]) {
        classMap[className] = {
          className,
          formLevel,
          marks: [],
        };
      }

      classMap[className].marks.push({
        id: m.id,
        mark: m.mark,
        maxMark: m.maxMark,
        percentage: m.percentage,
        gradeLetter: m.gradeLetter,
        status: m.status,
        teacherNotes: m.teacherNotes,
        examTitle: m.exam.title,
        student: {
          id: m.student.id,
          studentNumber: m.student.studentNumber,
          firstName: m.student.firstName,
          lastName: m.student.lastName,
          className,
          formLevel,
        },
      });
    });

    // Populate empty class entries for subjects with no entered marks yet
    classes.forEach((c) => {
      if (!classMap[c.name]) {
        classMap[c.name] = {
          className: c.name,
          formLevel: c.formLevel,
          marks: [],
        };
      }
    });

    const classList = Object.values(classMap).sort(
      (a, b) => a.formLevel - b.formLevel || a.className.localeCompare(b.className)
    );

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      classes: classList,
    };
  });

  const studentOptions = students.map((s) => ({
    id: s.id,
    fullName: `${s.firstName} ${s.lastName}`,
    studentNumber: s.studentNumber,
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-900">
              {isStudent ? 'My Academic Report Dossier' : 'Subject & Class Examination Ledger'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isStudent
              ? 'Official verified ZIMSEC and internal assessment results catalogued by subject.'
              : 'Marks structured cleanly by Subject Folders and Class Streams with automatic grade computations.'}
          </p>
        </div>

        {canRecord && (
          <RecordMarkDialog
            students={studentOptions}
            subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
            exams={exams}
          />
        )}
        {canRecord && (
          <div className="flex items-center gap-2">
            <BulkMarksDialog
              exams={exams}
              subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
            />
            <RecordMarkDialog
              students={studentOptions}
              subjects={subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
              exams={exams}
            />
          </div>
        )}
      </div>

      {/* ZIMSEC Grading Legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700 uppercase flex items-center space-x-1.5">
          <Award className="h-3.5 w-3.5 text-blue-600" />
          <span>ZIMSEC Grade Scale:</span>
        </span>
        <div className="flex items-center space-x-2.5 text-slate-600 font-semibold text-[11px]">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">A (75–100%)</span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">B (65–74%)</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">C (50–64%)</span>
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">D (40–49%)</span>
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">U (Below 40%)</span>
        </div>
      </div>

      {/* Structured Folder View */}
      <AcademicsFolderView folders={folders} isStudent={isStudent} />
    </div>
  );
}