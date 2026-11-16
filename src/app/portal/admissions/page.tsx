import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { UserPlus, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { enrolApplicationAction } from './actions';

export const instant = false;

export default async function AdmissionsPortalPage() {
  await connection();
  const session = await getSession();

  if (!session || (session.role !== Role.ADMIN && session.role !== Role.TEACHER)) {
    redirect('/portal');
  }

  const [applications, classes] = await Promise.all([
    prisma.application.findMany({
      orderBy: [{ targetForm: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.schoolClass.findMany({
      orderBy: [{ formLevel: 'asc' }, { name: 'asc' }],
    }),
  ]);

  async function updateStatusAction(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as any;

    await prisma.application.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/portal/admissions');
  }

  async function handleEnrol(formData: FormData) {
    'use server';
    const applicationId = formData.get('applicationId') as string;
    const classId = formData.get('classId') as string;
    await enrolApplicationAction(applicationId, classId);
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-[#0f1e36]" />
            <h1 className="text-xl font-bold text-[#0f1e36]">
              Admissions & Intake Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant qualifications (Grade 7, transfer reports, or O-Levels) and assign classes.
          </p>
        </div>
        <div className="text-right">
          <span className="block text-xs font-bold text-slate-400 uppercase">Total Applicants</span>
          <span className="text-2xl font-black text-[#0f1e36]">{applications.length} Candidates</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">App Ref</th>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Target Form</th>
                <th className="p-4">Previous School</th>
                <th className="p-4">Academic Results & Combination</th>
                <th className="p-4">Guardian Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Decision / Enrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No online applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-mono font-bold text-blue-900">
                      {app.applicationNo}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {app.firstName} {app.lastName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {app.gender} • Born {new Date(app.dateOfBirth).toLocaleDateString('en-GB')}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      Form {app.targetForm} ({app.entryYear})
                    </td>
                    <td className="p-4 text-slate-600">
                      {app.previousSchool}
                    </td>

                    {/* DYNAMIC RESULTS COLUMN BASED ON FORM LEVEL */}
                    <td className="p-4">
                      {app.targetForm === 1 ? (
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-xs bg-blue-50 text-blue-900 border border-blue-200">
                            {app.totalUnits} Grade 7 Units
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            Eng:{app.englishUnits} Math:{app.mathUnits} GP:{app.generalPaperUnits} Ind:{app.indigenousUnits}
                          </span>
                        </div>
                      ) : app.targetForm >= 5 ? (
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-purple-50 text-purple-900 border border-purple-200">
                            {app.oLevelPassesCount} O-Level Passes[cite: 5]
                          </span>
                          <span className="block text-[10px] text-slate-600 mt-0.5 max-w-[200px] truncate" title={app.oLevelSummaryGrades || ''}>
                            {app.oLevelSummaryGrades}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {app.previousAverage}% Average[cite: 5]
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {app.previousClass} • {app.previousPosition}
                          </span>
                        </div>
                      )}

                      {app.chosenCombination && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-[#1e3a5f] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {app.chosenCombination.split('(')[0]}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{app.guardianName}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{app.guardianPhone}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'ACCEPTED' ? (
                          <form action={handleEnrol} className="flex items-center gap-1.5">
                            <input type="hidden" name="applicationId" value={app.id} />
                            <select
                              name="classId"
                              defaultValue={classes.find((c) => c.formLevel === app.targetForm)?.id || ''}
                              className="px-2 py-1 text-[11px] border border-slate-300 rounded bg-white font-medium"
                            >
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 bg-[#0f1e36] hover:bg-[#1e3a5f] text-white px-2.5 py-1 rounded text-[11px] font-bold transition shadow-xs cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Enrol</span>
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <form action={updateStatusAction}>
                              <input type="hidden" name="id" value={app.id} />
                              <input type="hidden" name="status" value="ACCEPTED" />
                              <button
                                type="submit"
                                title="Accept candidate"
                                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-700 font-bold transition cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </form>
                            <form action={updateStatusAction}>
                              <input type="hidden" name="id" value={app.id} />
                              <input type="hidden" name="status" value="REJECTED" />
                              <button
                                type="submit"
                                title="Reject candidate"
                                className="p-1.5 rounded hover:bg-rose-50 text-rose-700 font-bold transition cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}