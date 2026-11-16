import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { UploadResourceDialog } from '@/components/upload-resource-dialog';
import { BookOpen, FileText, Download, Filter, Search } from 'lucide-react';
import { Role } from '@prisma/client';

export const instant = false;

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; form?: string; query?: string }>;
}) {
  await connection();
  const session = await getSession();
  const { type, form, query } = await searchParams;

  const canUpload = session?.role === Role.TEACHER || session?.role === Role.ADMIN;

  // Filter conditions
  const where: any = {};
  if (type) where.resourceType = type;
  if (form) where.formLevel = Number(form);
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { subject: { name: { contains: query, mode: 'insensitive' } } },
      { subject: { code: { contains: query, mode: 'insensitive' } } },
    ];
  }

  const [resources, subjects] = await Promise.all([
    prisma.learningResource.findMany({
      where,
      include: {
        subject: true,
      },
      orderBy: [{ formLevel: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.subject.findMany({
      orderBy: { code: 'asc' },
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-900">
              Curriculum & Learning Resources Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            ZIMSEC syllabus documents, previous examination question papers, and teacher revision notes.
          </p>
        </div>

        {canUpload && <UploadResourceDialog subjects={subjects} />}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <form className="relative flex-1 w-full" method="GET">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="query"
            defaultValue={query || ''}
            placeholder="Search by topic, paper title, or subject code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Type:</span>
            <div className="flex gap-1">
              {[
                { label: 'All', val: '' },
                { label: 'Past Papers', val: 'Past Paper' },
                { label: 'Schemes', val: 'Marking Scheme' },
                { label: 'Notes', val: 'Revision Note' },
              ].map((t) => (
                <a
                  key={t.val}
                  href={`/portal/resources?type=${encodeURIComponent(t.val)}${form ? `&form=${form}` : ''}`}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                    (type || '') === t.val
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No learning materials found matching your search or filters.
          </div>
        ) : (
          resources.map((r) => {
            const isPaper = r.resourceType === 'Past Paper';
            const isScheme = r.resourceType === 'Marking Scheme';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                   <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Form {r.formLevel} • {r.subject.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaper
                          ? 'bg-purple-100 text-purple-800'
                          : isScheme
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.resourceType}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Subject: {r.subject.name}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400 truncate max-w-[170px]">
                    {r.fileUrl}
                  </span>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Access</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}