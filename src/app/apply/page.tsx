'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { submitApplicationAction } from './actions';
import { O_LEVEL_COMBINATIONS, A_LEVEL_COMBINATIONS } from '@/lib/curriculum-data';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Award,
  Phone,
  UserCheck,
  BookMarked,
  FileSpreadsheet
} from 'lucide-react';

export default function ApplyOnlinePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ applicationNo: string; targetForm: number; chosenCombination: string | null } | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2013-05-15',
    gender: 'MALE',
    targetForm: 1,
    entryYear: 2027,
    previousSchool: '',
    chosenCombination: 'O-Level Commercials',

    // Form 1 fields
    grade7IndexNo: '',
    englishUnits: 2,
    mathUnits: 2,
    generalPaperUnits: 2,
    indigenousUnits: 2,

    // Forms 2, 3, 4 fields
    previousClass: 'Form 2 Third Term',
    previousAverage: 68.5,
    previousPosition: '5th out of 42',

    // Form 5 & 6 (A-Level) fields
    oLevelCandidateNo: '',
    oLevelPassesCount: 8,
    oLevelSummaryGrades: '4 As, 3 Bs, 1 C (passed Maths, English & Science)',

    // Guardian
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
  });

  const isForm1 = form.targetForm === 1;
  const isForm2 = form.targetForm === 2;
  const isOLevel = form.targetForm === 3 || form.targetForm === 4;
  const isALevel = form.targetForm === 5 || form.targetForm === 6;

  const totalCalculatedUnits =
    Number(form.englishUnits) +
    Number(form.mathUnits) +
    Number(form.generalPaperUnits) +
    Number(form.indigenousUnits);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitApplicationAction(form);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.applicationNo) {
      setConfirmation({
        applicationNo: res.applicationNo,
        targetForm: res.targetForm,
        chosenCombination: res.chosenCombination || null,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#0f1e36] font-sans pb-16">
      <header className="bg-white border-b border-slate-200 border-t-[3px] border-t-[#0f1e36] py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#091322] p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Phronesis Crest"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="block font-serif text-base font-bold text-[#0f1e36] leading-tight">
              Phronesis College
            </span>
            <span className="block text-[11px] text-slate-500 uppercase tracking-wider">
              12787 Glen View 7, Harare • Online Admissions
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0f1e36]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Website</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {confirmation ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg space-y-5">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif font-bold text-[#0f1e36]">
                Application Successfully Submitted!
              </h1>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for applying to Phronesis College for Form {confirmation.targetForm}. Your academic record has been registered for admission verification.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-sm mx-auto space-y-3 font-mono text-left">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Application Number</span>
                <span className="text-xl font-black text-blue-900">{confirmation.applicationNo}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Admission Level</span>
                <span className="text-sm font-bold text-slate-800">Form {confirmation.targetForm} (2027)</span>
              </div>
              {confirmation.chosenCombination && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Selected Combination</span>
                  <span className="text-xs font-bold text-emerald-700">{confirmation.chosenCombination}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 max-w-md mx-auto bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-left space-y-1">
              <strong className="text-blue-900 block font-semibold">Required for registration clearance:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Copy of certified birth certificate[cite: 5]</li>
                {confirmation.targetForm === 1 ? (
                  <li>Grade 7 result slip / mid-term report card[cite: 5]</li>
                ) : confirmation.targetForm >= 5 ? (
                  <li>ZIMSEC O-Level results slip[cite: 5]</li>
                ) : (
                  <li>Current secondary school term report card[cite: 5]</li>
                )}
                <li>Medical report & parent/guardian contact details[cite: 5]</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-[#0f1e36] text-white text-xs font-bold hover:bg-[#14294a] transition"
              >
                Return to School Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-[#0f1e36] p-6 text-white space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/10 uppercase tracking-widest text-slate-200">
                Admissions Session 2027 • Knowledge and Wisdom[cite: 5]
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">
                Student Admission Application
              </h1>
              <p className="text-xs text-slate-300">
                Form 1 requires Grade 7 results. Forms 2–4 use previous term reports. Form 5 & 6 (A-Level) require O-Level results and combinations[cite: 5].
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 text-xs">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section 1: Candidate & Level Target */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <UserCheck className="h-4 w-4 text-[#0f1e36]" />
                  <span>1. Candidate & Target Level</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Applying For Level *</label>
                    <select
                      value={form.targetForm}
                      onChange={(e) => {
                        const target = Number(e.target.value);
                        let defaultComb = 'General ZJC Subjects';
                        if (target === 3 || target === 4) defaultComb = 'Commercials';
                        if (target >= 5) defaultComb = 'Sciences 1 (Maths, Physics, Chemistry)';
                        setForm({ ...form, targetForm: target, chosenCombination: defaultComb });
                      }}
                      className="w-full px-3 py-2 border-2 border-blue-900 rounded-lg focus:ring-2 focus:ring-[#0f1e36] font-bold text-blue-950 bg-white"
                    >
                      <option value={1}>Form 1 (Grade 7 Intake)</option>
                      <option value={2}>Form 2 (Transfer)</option>
                      <option value={3}>Form 3 (O-Level Intake)</option>
                      <option value={4}>Form 4 (O-Level Candidate)</option>
                      <option value={5}>Form 5 (Lower 6 A-Level)</option>
                      <option value={6}>Form 6 (Upper 6 A-Level)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tinashe"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Last / Surname *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ndlovu"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Gender *</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36] bg-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">
                      {isForm1 ? 'Previous Primary School *' : 'Previous Secondary School *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isForm1 ? "e.g. Glen View 9 Primary" : "e.g. Highfield High School"}
                      value={form.previousSchool}
                      onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: ACADEMIC LEVEL COMBINATIONS (For Forms 3 to 6) */}
              {(isOLevel || isALevel) && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    <BookMarked className="h-4 w-4 text-blue-900" />
                    <span>2. Select Subject Combination ({isOLevel ? 'O-Level Stream' : 'A-Level Combination'})[cite: 7, 8]</span>
                  </div>

                  {isOLevel && (
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Select O-Level Stream[cite: 7]
                      </label>
                      <select
                        value={form.chosenCombination}
                        onChange={(e) => setForm({ ...form, chosenCombination: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                      >
                        {O_LEVEL_COMBINATIONS.map((c) => (
                          <option key={c.id} value={`${c.title} (${c.subjects.join(', ')})`}>
                            {c.title} — [{c.subjects.slice(6).join(', ')}][cite: 7]
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1.5 italic">
                        All O-Level candidates study core subjects: Mathematics, English, Shona, Heritage, Combined Science, Computer Science plus chosen electives[cite: 7].
                      </p>
                    </div>
                  )}

                  {isALevel && (
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Select A-Level Subject Combination[cite: 8]
                      </label>
                      <select
                        value={form.chosenCombination}
                        onChange={(e) => setForm({ ...form, chosenCombination: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                      >
                        <optgroup label="Advanced Level Sciences[cite: 8]">
                          {A_LEVEL_COMBINATIONS.filter((c) => c.category === 'Sciences').map((c) => (
                            <option key={c.id} value={`${c.title} (${c.subjects.join(', ')})`}>
                              {c.title}: {c.subjects.join(' • ')}[cite: 8]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Advanced Level Commercials[cite: 8]">
                          {A_LEVEL_COMBINATIONS.filter((c) => c.category === 'Commercials').map((c) => (
                            <option key={c.id} value={`${c.title} (${c.subjects.join(', ')})`}>
                              {c.title}: {c.subjects.join(' • ')}[cite: 8]
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Section 3: QUALIFYING ACADEMIC EVIDENCE BY LEVEL */}

              {/* CASE A: Form 1 Applicant (Grade 7 Units) */}
              {isForm1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                      <Award className="h-4 w-4 text-[#0f1e36]" />
                      <span>3. Grade 7 ZIMSEC Examination Results[cite: 5]</span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-[#0f1e36] px-2.5 py-0.5 rounded border border-slate-300">
                      Total: {totalCalculatedUnits} Units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Grade 7 Candidate/Index Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 010450/0042"
                        value={form.grade7IndexNo}
                        onChange={(e) => setForm({ ...form, grade7IndexNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">English (1-9)</label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        required
                        value={form.englishUnits}
                        onChange={(e) => setForm({ ...form, englishUnits: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-center font-bold font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">Maths (1-9)</label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        required
                        value={form.mathUnits}
                        onChange={(e) => setForm({ ...form, mathUnits: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-center font-bold font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">General Paper (1-9)</label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        required
                        value={form.generalPaperUnits}
                        onChange={(e) => setForm({ ...form, generalPaperUnits: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-center font-bold font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">Indigenous Lang (1-9)</label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        required
                        value={form.indigenousUnits}
                        onChange={(e) => setForm({ ...form, indigenousUnits: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-center font-bold font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: Forms 2, 3, 4 Transfer Applicants (Previous Report Book) */}
              {(isForm2 || isOLevel) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <FileSpreadsheet className="h-4 w-4 text-[#0f1e36]" />
                    <span>3. Previous Term Report Book Details[cite: 5]</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Previous Class & Term *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Form 2 Term 3"
                        value={form.previousClass}
                        onChange={(e) => setForm({ ...form, previousClass: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Report Average % *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 68.4"
                        value={form.previousAverage}
                        onChange={(e) => setForm({ ...form, previousAverage: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Class Position / Ranking</label>
                      <input
                        type="text"
                        placeholder="e.g. 6th out of 45"
                        value={form.previousPosition}
                        onChange={(e) => setForm({ ...form, previousPosition: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CASE C: Forms 5 & 6 (A-Level Applicants - O-Level Results) */}
              {isALevel && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <Award className="h-4 w-4 text-[#0f1e36]" />
                    <span>3. ZIMSEC O-Level Examination Results Record[cite: 5]</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">O-Level Candidate Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 020491/2042"
                        value={form.oLevelCandidateNo}
                        onChange={(e) => setForm({ ...form, oLevelCandidateNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Total Subject Passes (Grade C or better) *</label>
                      <input
                        type="number"
                        min={5}
                        max={12}
                        required
                        value={form.oLevelPassesCount}
                        onChange={(e) => setForm({ ...form, oLevelPassesCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Breakdown of Subjects and Grades Achieved *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Maths (A), English (B), Combined Science (A), Physics (B), Chemistry (A), Computer Science (A), Shona (B), Geography (C)"
                        value={form.oLevelSummaryGrades}
                        onChange={(e) => setForm({ ...form, oLevelSummaryGrades: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Parent / Guardian Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <Phone className="h-4 w-4 text-[#0f1e36]" />
                  <span>4. Parent / Guardian Details[cite: 5]</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. Patrick Moyo"
                      value={form.guardianName}
                      onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +263 77 123 4567"
                      value={form.guardianPhone}
                      onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. guardian@gmail.com"
                    value={form.guardianEmail}
                    onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Physical Residential Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 12787 Glen View 7, Harare[cite: 5]"
                    value={form.guardianAddress}
                    onChange={(e) => setForm({ ...form, guardianAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f1e36]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Phronesis College • Glen View 7, Harare[cite: 5]
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#0f1e36] hover:bg-[#14294a] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Dossier...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}