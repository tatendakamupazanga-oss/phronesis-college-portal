'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveExamMarkAction } from '@/app/portal/academics/actions';
import { PlusCircle, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentOption {
  id: string;
  fullName: string;
  studentNumber: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface ExamOption {
  id: string;
  title: string;
}

export function RecordMarkDialog({
  students,
  subjects,
  exams,
}: {
  students: StudentOption[];
  subjects: SubjectOption[];
  exams: ExamOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    examId: exams[0]?.id || '',
    studentId: students[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    mark: '',
    teacherNotes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const markNumber = parseFloat(formData.mark);
    if (isNaN(markNumber)) {
      setError('Please provide a valid numeric score.');
      setLoading(false);
      return;
    }

    const res = await saveExamMarkAction({
      examId: formData.examId,
      studentId: formData.studentId,
      subjectId: formData.subjectId,
      mark: markNumber,
      teacherNotes: formData.teacherNotes,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFormData((prev) => ({ ...prev, mark: '', teacherNotes: '' }));
      }, 1200);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Record Assessment Mark</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Assessment Score</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Mark submitted successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Examination / Assessment
                </label>
                <select
                  value={formData.examId}
                  onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Student
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.studentNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Score (Out of 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  placeholder="e.g. 78"
                  value={formData.mark}
                  onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Teacher Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Exemplary work in geometric proofs."
                  value={formData.teacherNotes}
                  onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Submit Score</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}