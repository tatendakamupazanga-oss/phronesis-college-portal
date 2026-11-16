import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RegisterStudentDialog } from '@/components/register-student-dialog';
import { Users, GraduationCap, Search, Filter } from 'lucide-react';
import { Role } from '@prisma/client';

export const instant = false;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; form?: string }>;
}) {
  await connection();
  const session = await getSession();
  const { query, form } = await searchParams;

  // Build filter conditions
  const whereCondition: any = {};

  if (query) {
    whereCondition.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { studentNumber: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (form) {
    whereCondition.enrolments = {
      some: {
        schoolClass: {
          formLevel: Number(form),
        },
      },
    };
  }

 // Consolidate into a single pooled transaction to prevent Neon cold-start connection drops
  const [students, classes] = await prisma.$transaction([
    prisma.student.findMany({
      where: whereCondition,
      include: {
        enrolments: {
          include: { schoolClass: true },
          orderBy: { academicYear: 'desc' },
          take: 1,
        },
        user: {
          select: { email: true, isActive: true },
        },
        invoices: {
          select: { balance: true },
        },
      },
      orderBy: { studentNumber: 'asc' },
    }),
    prisma.schoolClass.findMany({
      orderBy: [{ formLevel: 'asc' }, { name: 'asc' }],
    }),
  ]);

  const canRegister = session?.role === Role.ADMIN || session?.role === Role.TEACHER;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
          </div>
          <p className="text-xs text-slate-500">
            Official enrolments, admission records, and student numbers across Forms 1 to 6.
          </p>
        </div>

        {canRegister && <RegisterStudentDialog classes={classes} />}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <form className="relative flex-1 w-full" method="GET">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="query"
            defaultValue={query || ''}
            placeholder="Search by student name or SCH number (e.g. SCH-2026-0001)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-600">Form:</span>
          <div className="flex gap-1.5 flex-wrap">
            <a
              href="/portal/students"
              className={`px-2.5 py-1 rounded-md font-semibold ${
                !form ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </a>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <a
                key={lvl}
                href={`/portal/students?form=${lvl}`}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  form === String(lvl)
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Form {lvl}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Student Number</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Class Stream</th>
                <th className="p-4">Admission Year</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Fee Balance</th>
               <th className="p-4 text-right">Fee Balance</th>
               <th className="p-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No student records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentClass = student.enrolments[0]?.schoolClass.name || 'Unassigned';
                  const balance = student.invoices[0]?.balance ?? 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-mono font-bold text-blue-700">
                        {student.studentNumber}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                          <span>{currentClass}</span>
                        </span>
                      </td>
                      <td className="p-4">{student.admissionYear}</td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {balance > 0 ? (
                          <span className="text-amber-600">${balance.toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-600">Settled</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-semibold">
  {balance > 0 ? (
    <span className="text-amber-600">${balance.toFixed(2)}</span>
  ) : (
    <span className="text-emerald-600">Settled</span>
  )}
</td>

{/* --- THIS IS THE NEW CELL BESIDE THE FEE BALANCE --- */}
<td className="p-4 text-right">
  <a
    href={`/portal/students/${student.id}/report-card`}
    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
  >
    <span>View Slip</span>
    <span aria-hidden="true">&rarr;</span>
  </a>
</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}