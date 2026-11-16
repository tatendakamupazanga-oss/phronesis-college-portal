import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { ShieldCheck, Users, Activity } from 'lucide-react';

export const instant = false;

export default async function AdminAuditPage() {
  await connection();
  const session = await getSession();

  if (!session || session.role !== Role.ADMIN) {
    redirect('/portal');
  }

  const [staffMembers, auditLogs] = await prisma.$transaction([
    prisma.staff.findMany({
      include: {
        user: {
          select: { username: true, email: true, role: true, isActive: true },
        },
        teachingAssignments: {
          include: { subject: true, schoolClass: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.findMany({
      include: {
        user: { select: { username: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#0f1e36]" />
          <h1 className="text-xl font-serif font-bold text-[#0f1e36]">
            Staff Directory & System Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Administrative oversight of faculty accounts, teaching assignments, and security activity logs.
        </p>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#0f1e36]" />
          <h2 className="text-sm font-bold text-[#0f1e36]">
            Registered Faculty & Administrative Staff ({staffMembers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assignments</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map((st: any) => (
                <tr key={st.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-[#0f1e36]">{st.staffNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {st.firstName} {st.lastName}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      {st.user?.email || st.user?.username || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] uppercase">
                    {st.user?.role || 'STAFF'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {st.teachingAssignments?.length > 0
                      ? st.teachingAssignments
                          .map((tc: any) => `${tc.subject.code} (${tc.schoolClass.name})`)
                          .join(', ')
                      : st.department || 'Administration'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.user?.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {st.user?.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#0f1e36]" />
          <h2 className="text-sm font-bold text-[#0f1e36]">Recent Security & Financial Audit Logs</h2>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No audit entries recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[10px] bg-slate-100 text-[#0f1e36] px-2 py-0.5 rounded mr-2">
                    {log.action}
                  </span>
                  <span className="text-slate-700">{log.details}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {log.user?.username || 'system'} • {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}