import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import Image from 'next/image';
import { PrintReportButton } from '@/components/print-report-button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const instant = false;

export default async function StudentReportCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await getSession();
  const { id: studentId } = await params;

  if (!session) {
    redirect('/login');
  }

  // RBAC Guard: Students can only view their own report card
  if (session.role === Role.STUDENT && session.studentId !== studentId) {
    redirect('/portal/academics');
  }

  // Fetch student, enrolment, marks (published or preview), and invoices
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrolments: {
        include: { schoolClass: true },
        orderBy: { academicYear: 'desc' },
        take: 1,
      },
      examMarks: {
        where: session.role === Role.STUDENT ? { status: 'PUBLISHED' } : undefined,
        include: {
          subject: true,
          exam: true,
        },
        orderBy: { subject: { name: 'asc' } },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!student) {
    redirect('/portal/students');
  }

  const currentClass = student.enrolments[0]?.schoolClass.name || 'Form 1A';
  const currentForm = student.enrolments[0]?.schoolClass.formLevel || 1;
  const latestInvoice = student.invoices[0];
  const isFeeSettled = (latestInvoice?.balance ?? 0) <= 0;

  // Performance calculations
  const totalMarks = student.examMarks.length;
  const averagePercentage =
    totalMarks > 0
      ? (
          student.examMarks.reduce((sum, m) => sum + m.percentage, 0) /
          totalMarks
        ).toFixed(1)
      : '0.0';

  const distinctions = student.examMarks.filter((m) => m.gradeLetter === 'A').length;
  const credits = student.examMarks.filter((m) => m.gradeLetter === 'B').length;
  const passes = student.examMarks.filter((m) => m.gradeLetter === 'C').length;

  return (
    <div className="space-y-6 print:space-y-0">
      {/* On-screen action bar (hidden when printing) */}
      <div className="print:hidden mx-auto max-w-[210mm] bg-white px-5 py-4 rounded-lg border border-slate-200 border-l-4 border-l-navy-900 shadow-sm flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-xs text-slate-500 block">Terminal report</span>
          <h1 className="text-base font-semibold text-navy-900 truncate">
            {student.firstName} {student.lastName}{' '}
            <span className="font-normal text-slate-500">({student.studentNumber})</span>
          </h1>
        </div>
        <PrintReportButton />
      </div>

      {/* Official A4 sheet */}
      <div className="mx-auto w-full max-w-[210mm] bg-white text-navy-900 shadow-lg ring-1 ring-slate-200 print:shadow-none print:ring-0 print:max-w-none print:w-[210mm] print:h-[296mm] print:overflow-hidden print:break-inside-avoid">
        {/* Outer navy frame with an inner hairline frame */}
        <div className="relative m-0 border-[3px] border-navy-900 p-3 sm:p-5 print:m-[8mm] print:h-[calc(296mm-16mm)] print:p-[5mm]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[5px] border border-navy-300"
          />

          <div className="relative flex h-full flex-col">
            {/* Masthead: centred crest, school name, accreditation */}
            <header className="flex flex-col items-center text-center pb-4 border-b-2 border-navy-900">
              <Image
                src="/logo.png"
                alt="Phronesis Secondary School crest"
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
                priority
              />
              <h2 className="mt-2 font-serif text-2xl sm:text-[28px] font-bold uppercase tracking-[0.08em] text-navy-900 leading-tight">
                Phronesis Secondary School
              </h2>
              <p className="mt-0.5 font-serif text-sm italic text-navy-700">
                Excellence • Integrity • Wisdom
              </p>
              <p className="mt-1.5 text-[11px] text-slate-600">
                Ministry of Primary & Secondary Education • ZIMSEC Examination Centre #7042
              </p>
              <p className="text-[10px] text-slate-500">
                Harare, Zimbabwe • registrar@phronesis.ac.zw • +263 (0242) 700000
              </p>
            </header>

            {/* Report title band */}
            <div className="mt-3 flex items-center justify-between bg-navy-900 px-4 py-2 text-white">
              <span className="font-serif text-base tracking-wide">Official Terminal Report</span>
              <span className="text-xs text-navy-200">Term 1 • 2026 Session</span>
            </div>

            {/* Candidate details */}
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-x-4 gap-y-3 bg-slate-100 px-4 py-3 text-xs border border-slate-200">
              <div>
                <dt className="text-[11px] text-slate-500">Candidate</dt>
                <dd className="mt-0.5 text-sm font-semibold text-navy-900">
                  {student.firstName} {student.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Candidate ID</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-navy-700">
                  {student.studentNumber}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Class</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {currentClass} (Form {currentForm})
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Enrolment status</dt>
                <dd className="mt-0.5 text-sm font-semibold text-navy-900 capitalize">
                  {String(student.status).toLowerCase()}
                </dd>
              </div>
            </dl>

            {/* Marks table */}
            <section className="mt-4" aria-labelledby="marks-heading">
              <div className="mb-1.5 flex items-baseline justify-between">
                <h3 id="marks-heading" className="font-serif text-sm font-bold text-navy-900">
                  Terminal assessment marks
                </h3>
                <span className="text-[10px] text-slate-500">
                  Graded to ZIMSEC secondary standards
                </span>
              </div>

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full min-w-[520px] print:min-w-0 border-collapse text-left text-xs border border-navy-900">
                  <thead>
                    <tr className="bg-navy-900 text-white text-[11px] font-semibold">
                      <th scope="col" className="px-3 py-2 border-r border-navy-700">Subject</th>
                      <th scope="col" className="px-3 py-2 border-r border-navy-700 text-center w-20">Score</th>
                      <th scope="col" className="px-3 py-2 border-r border-navy-700 text-center w-16">%</th>
                      <th scope="col" className="px-3 py-2 border-r border-navy-700 text-center w-16">Grade</th>
                      <th scope="col" className="px-3 py-2">Teacher comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.examMarks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-slate-500 italic">
                          No examination results published for this reporting cycle.
                        </td>
                      </tr>
                    ) : (
                      student.examMarks.map((m) => (
                        <tr key={m.id} className="odd:bg-white even:bg-slate-50 border-t border-slate-200">
                          <td className="px-3 py-2 print:py-1.5 border-r border-slate-200 font-semibold text-slate-900">
                            {m.subject.name}{' '}
                            <span className="font-mono text-[10px] font-normal text-slate-500">[{m.subject.code}]</span>
                          </td>
                          <td className="px-3 py-2 print:py-1.5 border-r border-slate-200 text-center font-mono tabular-nums">
                            {m.mark}/{m.maxMark}
                          </td>
                          <td className="px-3 py-2 print:py-1.5 border-r border-slate-200 text-center font-mono font-semibold tabular-nums text-navy-900">
                            {m.percentage}%
                          </td>
                          <td className="px-3 py-2 print:py-1.5 border-r border-slate-200 text-center text-sm font-bold">
                            <span
                              className={
                                m.gradeLetter === 'A'
                                  ? 'text-success'
                                  : m.gradeLetter === 'B'
                                    ? 'text-navy-700'
                                    : m.gradeLetter === 'C'
                                      ? 'text-warning'
                                      : 'text-slate-600'
                              }
                            >
                              {m.gradeLetter || 'U'}
                            </span>
                          </td>
                          <td className="px-3 py-2 print:py-1.5 text-[11px] italic text-slate-600">
                            {m.teacherNotes || 'Consistently applied effort throughout the term.'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Summary figures */}
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 divide-x divide-slate-300 border border-slate-300 bg-slate-100 text-center">
              <div className="py-2.5">
                <dt className="text-[11px] text-slate-500">Overall average</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-navy-900">{averagePercentage}%</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-[11px] text-slate-500">Grade A (distinction)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-success">{distinctions}</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-[11px] text-slate-500">Grade B (credit)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-navy-700">{credits}</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-[11px] text-slate-500">Grade C (pass)</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-warning">{passes}</dd>
              </div>
            </dl>

            {/* Remarks */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-300 border-l-4 border-l-navy-900 bg-white p-3">
                <span className="block text-[11px] font-semibold text-slate-500">Class teacher remarks</span>
                <p className="mt-1 font-serif italic leading-relaxed text-slate-800">
                  {Number(averagePercentage) >= 70
                    ? `${student.firstName} exhibits high academic initiative, self-motivation, and disciplined focus. An outstanding terminal performance.`
                    : `${student.firstName} has made steady academic progress. Consistent revision and targeted tutorial attendance will yield even greater results next term.`}
                </p>
              </div>

              <div className="border border-slate-300 border-l-4 border-l-navy-900 bg-white p-3">
                <span className="block text-[11px] font-semibold text-slate-500">Head of school remarks</span>
                <p className="mt-1 font-serif italic leading-relaxed text-slate-800">
                  Commendable effort. Cleared in good academic standing for the upcoming academic session.
                </p>
              </div>
            </div>

            {/* Endorsements and Bursar stamp */}
            <footer className="mt-auto pt-5">
              <div className="grid grid-cols-3 gap-6 border-t-2 border-navy-900 pt-4 text-center text-xs">
                <div>
                  <div className="flex h-10 items-end justify-center border-b border-slate-500 pb-1 font-serif text-sm italic text-slate-700">
                    M. Chidzero
                  </div>
                  <span className="mt-1.5 block text-[11px] text-slate-600">Class teacher</span>
                </div>

                <div>
                  <div className="flex h-10 items-end justify-center border-b border-slate-500 pb-1 font-serif text-sm italic text-slate-700">
                    Dr. E. Sibanda
                  </div>
                  <span className="mt-1.5 block text-[11px] text-slate-600">Headmaster</span>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div
                    className={`w-full -rotate-2 rounded-md border-4 border-double px-2 py-2 text-[11px] font-bold uppercase tracking-wider ${
                      isFeeSettled
                        ? 'border-success bg-success-soft text-success'
                        : 'border-warning bg-warning-soft text-warning'
                    }`}
                  >
                    {isFeeSettled ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>BURSAR CLEARED</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>ARREARS: ${latestInvoice?.balance.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <span className="mt-1.5 block text-[11px] text-slate-600">Bursar</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}