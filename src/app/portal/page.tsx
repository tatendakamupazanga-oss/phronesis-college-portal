import { connection } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  Users, 
  Award, 
  BookMarked, 
  GraduationCap, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';

export const instant = false;

export default async function PortalDashboardPage() {
  await connection();
  const session = await getSession();

 // Fetch dashboard stats using a single pooled transaction connection
  const [studentCount, staffCount, bookCount, examCount] = await prisma.$transaction([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.book.count(),
    prisma.exam.count(),
  ]);

  // If student is logged in, grab their personal summary
  let studentDetails = null;
  if (session?.role === 'STUDENT' && session.studentId) {
    studentDetails = await prisma.student.findUnique({
      where: { id: session.studentId },
      include: {
        enrolments: { include: { schoolClass: true } },
        invoices: true,
        examMarks: { include: { subject: true } },
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {session?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            2026 Academic Session • Term 1 (Jan – Apr) • System Role: {session?.role}
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-200">
          <Calendar className="h-4 w-4" />
          <span>ZIMSEC Term 1 In Progress</span>
        </div>
      </div>

      {/* Role-Specific Content */}
      {session?.role === 'STUDENT' && studentDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Current Enrolment</span>
            <div className="text-xl font-bold text-slate-900">
              {studentDetails.enrolments[0]?.schoolClass.name || 'Unassigned'}
            </div>
            <p className="text-xs text-slate-400">Student ID: {studentDetails.studentNumber}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fee Status</span>
            <div className="text-xl font-bold text-slate-900">
              ${studentDetails.invoices[0]?.balance.toFixed(2) || '0.00'} Due
            </div>
            <p className="text-xs text-amber-600 font-medium">Invoice #{studentDetails.invoices[0]?.invoiceNumber || 'N/A'}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Assessment Results</span>
              <div className="text-xl font-bold text-blue-700">
                {studentDetails.examMarks.length} Published Marks
              </div>
              <p className="text-xs text-slate-400">Term 1 Assessment</p>
            </div>
            <Link
              href={`/portal/students/${studentDetails.id}/report-card`}
              className="inline-block text-xs font-bold text-blue-700 hover:underline pt-2"
            >
              Download Official Report Card &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Staff / Admin High-Level Metrics */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Enrolled Students</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{studentCount}</div>
            <p className="text-[11px] text-slate-400">Forms 1 to 6</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Teaching Staff</span>
              <GraduationCap className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{staffCount}</div>
            <p className="text-[11px] text-slate-400">Active allocations</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Exams</span>
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{examCount}</div>
            <p className="text-[11px] text-slate-400">Internal Term 1</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Library Titles</span>
              <BookMarked className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{bookCount}</div>
            <p className="text-[11px] text-slate-400">Catalogued copies</p>
          </div>
        </div>
      )}

      {/* Quick Access Action Hub */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Workflows
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/portal/students"
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group flex items-center justify-between"
          >
            <div>
              <span className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">
                Student Enrolment
              </span>
              <span className="text-xs text-slate-500">
                Register student & generate SCH IDs
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
          </Link>

          <Link
            href="/portal/academics"
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group flex items-center justify-between"
          >
            <div>
              <span className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">
                Marks & Results
              </span>
              <span className="text-xs text-slate-500">
                Grade submissions & approvals
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
          </Link>

          <Link
            href="/portal/finance"
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group flex items-center justify-between"
          >
            <div>
              <span className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">
                Fee Statements
              </span>
              <span className="text-xs text-slate-500">
                Invoices, payments & balances
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
          </Link>
        </div>
      </div>
    </div>
  );
}