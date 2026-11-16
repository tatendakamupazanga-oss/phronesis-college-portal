'use client';

import { useState } from 'react';
import { bulkUploadMarksAction, BulkMarkRow } from '@/app/portal/academics/bulk-actions';
import { FileUp, Loader2, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';

interface BulkMarksDialogProps {
  exams: { id: string; title: string }[];
  subjects: { id: string; name: string; code: string }[];
}

export function BulkMarksDialog({ exams, subjects }: BulkMarksDialogProps) {
  const [open, setOpen] = useState(false);
  const [examId, setExamId] = useState(exams[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [csvText, setCsvText] = useState(
    'SCH-2026-0001, 84, 100, Excellent understanding\nSCH-2027-0001, 72, 100, Good essay structure'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpload() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const rows: BulkMarkRow[] = [];

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        rows.push({
          studentNumber: parts[0],
          mark: Number(parts[1]),
          maxMark: parts[2] ? Number(parts[2]) : 100,
          notes: parts[3] || undefined,
        });
      }
    }

    if (rows.length === 0) {
      setError('Please provide at least one valid line formatted as: StudentNumber, Mark, MaxMark, Notes');
      setLoading(false);
      return;
    }

    const res = await bulkUploadMarksAction(examId, subjectId, rows);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Successfully imported ${res.processedCount} assessment marks.`);
      if (res.errors && res.errors.length > 0) {
        setError(`Partial notices: ${res.errors.join(' | ')}`);
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
      >
        <FileUp className="h-4 w-4" />
        <span>Bulk CSV Marks</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-navy-900" />
                <h3 className="font-bold text-navy-900 text-sm">Bulk Assessment Marks Uploader</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Examination</label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700">
                Paste CSV Data (StudentNumber, Mark, MaxMark, Remarks)
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="SCH-2026-0001, 78, 100, Very good effort"
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
              <span className="text-[10px] text-slate-400 block">
                Format: <code className="text-blue-900 font-bold">SCH-YYYY-XXXX, Score, Total, Notes</code> (one per line).
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-[#0f1e36] hover:bg-[#14294a] text-white px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                <span>Import Marks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}