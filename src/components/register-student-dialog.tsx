'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStudentAction } from '@/app/portal/students/actions';
import { UserPlus, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SchoolClassOption {
  id: string;
  name: string;
  formLevel: number;
}

export function RegisterStudentDialog({ classes }: { classes: SchoolClassOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ studentNumber: string; fullName: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2012-01-15',
    admissionYear: 2026,
    schoolClassId: classes[0]?.id || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    const res = await createStudentAction(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else if (res.student) {
      setSuccessInfo({
        studentNumber: res.student.studentNumber,
        fullName: res.student.fullName,
      });
      router.refresh();
    }
  }

  function handleClose() {
    setIsOpen(false);
    setError(null);
    setSuccessInfo(null);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '2012-01-15',
      admissionYear: 2026,
      schoolClassId: classes[0]?.id || '',
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
      >
        <UserPlus className="h-4 w-4" />
        <span>New Student Enrolment</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm tracking-tight">Admit New Learner</h3>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {successInfo ? (
                <div className="space-y-4 text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Enrolment Successful!</h4>
                  <p className="text-xs text-slate-600">
                    Student account and academic record generated for <strong>{successInfo.fullName}</strong>.
                  </p>
                  <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
                    Assigned Student ID: <span className="font-bold text-blue-700">{successInfo.studentNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Default student portal password: <code className="bg-slate-200 px-1 py-0.5 rounded">Password123!</code>
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tendai"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mutasa"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Admission Year
                      </label>
                      <input
                        type="number"
                        required
                        min="2020"
                        max="2030"
                        value={formData.admissionYear}
                        onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Assigned Class Stream
                    </label>
                    <select
                      value={formData.schoolClassId}
                      onChange={(e) => setFormData({ ...formData, schoolClassId: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Form {c.formLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
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
                          <span>Generating Record...</span>
                        </>
                      ) : (
                        <span>Confirm Enrolment</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}