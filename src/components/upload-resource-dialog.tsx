'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadResourceAction } from '@/app/portal/resources/actions';
import { FileUp, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

export function UploadResourceDialog({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    resourceType: 'Past Paper' as 'Past Paper' | 'Syllabus' | 'Revision Note' | 'Marking Scheme',
    formLevel: 4,
    subjectId: subjects[0]?.id || '',
    fileUrl: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await uploadResourceAction({
      title: formData.title,
      resourceType: formData.resourceType,
      formLevel: Number(formData.formLevel),
      subjectId: formData.subjectId,
      fileUrl: formData.fileUrl,
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
        setFormData({
          title: '',
          resourceType: 'Past Paper',
          formLevel: 4,
          subjectId: subjects[0]?.id || '',
          fileUrl: '',
        });
      }, 1200);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
      >
        <FileUp className="h-4 w-4" />
        <span>Publish Resource</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Publish Learning Resource</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>Resource published to curriculum vault!</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZIMSEC O-Level Mathematics Paper 2 (Nov 2024)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Target Form
                  </label>
                  <select
                    value={formData.formLevel}
                    onChange={(e) => setFormData({ ...formData, formLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value={1}>Form 1</option>
                    <option value={2}>Form 2</option>
                    <option value={3}>Form 3</option>
                    <option value={4}>Form 4 (O-Level)</option>
                    <option value={5}>Form 5 (L6)</option>
                    <option value={6}>Form 6 (U6)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Resource Category
                </label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="Past Paper">ZIMSEC Past Exam Paper</option>
                  <option value="Marking Scheme">Green Book / Marking Scheme</option>
                  <option value="Revision Note">Study Notes & Summary</option>
                  <option value="Syllabus">Curriculum Syllabus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Document Storage Path / Download URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /vault/past-papers/zimsec-math-2024-p2.pdf"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Publish Document</span>
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