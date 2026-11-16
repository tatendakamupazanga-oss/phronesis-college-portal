'use client';

import { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  User, 
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { ResultStatus } from '@prisma/client';

export interface MarkRecord {
  id: string;
  mark: number;
  maxMark: number;
  percentage: number;
  gradeLetter: string | null;
  status: ResultStatus;
  teacherNotes: string | null;
  examTitle: string;
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    className: string;
    formLevel: number;
  };
}

export interface SubjectFolderData {
  id: string;
  name: string;
  code: string;
  classes: {
    className: string;
    formLevel: number;
    marks: MarkRecord[];
  }[];
}

export function AcademicsFolderView({ 
  folders, 
  isStudent 
}: { 
  folders: SubjectFolderData[]; 
  isStudent: boolean; 
}) {
  // Currently active subject tab/folder
  const [activeSubjectId, setActiveSubjectId] = useState<string>(folders[0]?.id || '');
  // Track open class sub-folders
  const [openClasses, setOpenClasses] = useState<Record<string, boolean>>({
    // Keep first class open by default
    [`${folders[0]?.id}-${folders[0]?.classes[0]?.className}`]: true,
  });

  const activeSubject = folders.find((f) => f.id === activeSubjectId) || folders[0];

  function toggleClassFolder(subjectId: string, className: string) {
    const key = `${subjectId}-${className}`;
    setOpenClasses((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  if (folders.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
        <Folder className="h-10 w-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-semibold">No subject folders or marks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Subject Folder Navigation Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center space-x-1.5">
          <BookOpen className="h-3.5 w-3.5 text-blue-600" />
          <span>Select Subject Folder</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {folders.map((subj) => {
            const isSelected = subj.id === activeSubject?.id;
            const totalMarksCount = subj.classes.reduce((acc, c) => acc + c.marks.length, 0);

            return (
              <button
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isSelected ? (
                  <FolderOpen className="h-4 w-4 text-blue-200" />
                ) : (
                  <Folder className="h-4 w-4 text-slate-400" />
                )}
                <span>{subj.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {subj.code}
                </span>
                <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {totalMarksCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Subject Header */}
      {activeSubject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                {activeSubject.name} — Class Streams & Marks Roster
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {activeSubject.classes.length} Class Streams with records
            </span>
          </div>

          {/* 3. Class Stream Accordions / Sub-Folders */}
          {activeSubject.classes.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              No classes currently have assessment marks recorded under {activeSubject.name}.
            </div>
          ) : (
            activeSubject.classes.map((cls) => {
              const key = `${activeSubject.id}-${cls.className}`;
              const isOpen = openClasses[key] ?? true;

              // Compute average percentage for this class stream
              const avgScore = cls.marks.length > 0
                ? (cls.marks.reduce((sum, m) => sum + m.percentage, 0) / cls.marks.length).toFixed(1)
                : '0';

              return (
                <div
                  key={cls.className}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
                >
                  {/* Folder Bar */}
                  <button
                    onClick={() => toggleClassFolder(activeSubject.id, cls.className)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition text-left border-b border-slate-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {cls.className}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Form {cls.formLevel} • {cls.marks.length} Student Record{cls.marks.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {cls.marks.length > 0 && (
                        <div className="hidden sm:flex items-center space-x-2 text-xs">
                          <span className="text-slate-400">Class Avg:</span>
                          <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {avgScore}%
                          </span>
                        </div>
                      )}

                      <div className="text-slate-400">
                        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                    </div>
                  </button>

                  {/* Marks Table inside Class Folder */}
                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            {!isStudent && <th className="p-4">Student Number</th>}
                            <th className="p-4">Learner Name</th>
                            <th className="p-4">Assessment / Exam</th>
                            <th className="p-4">Score</th>
                            <th className="p-4">Percentage</th>
                            <th className="p-4">ZIMSEC Grade</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Teacher Commentary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {cls.marks.length === 0 ? (
                            <tr>
                              <td colSpan={isStudent ? 7 : 8} className="p-6 text-center text-slate-400">
                                No assessment marks recorded for {cls.className} in {activeSubject.name}.
                              </td>
                            </tr>
                          ) : (
                            cls.marks.map((m) => {
                              const grade = m.gradeLetter || 'U';
                              const isDistinction = grade === 'A';
                              const isCredit = grade === 'B';
                              const isPass = grade === 'C';

                              return (
                                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                                  {!isStudent && (
                                    <td className="p-4 font-mono font-bold text-blue-700">
                                      {m.student.studentNumber}
                                    </td>
                                  )}
                                  <td className="p-4 font-semibold text-slate-900">
                                    {m.student.firstName} {m.student.lastName}
                                  </td>
                                  <td className="p-4 text-slate-600">{m.examTitle}</td>
                                  <td className="p-4 font-mono font-bold">
                                    {m.mark} / {m.maxMark}
                                  </td>
                                  <td className="p-4 font-bold text-slate-900">{m.percentage}%</td>
                                  <td className="p-4">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                        isDistinction
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isCredit
                                          ? 'bg-blue-100 text-blue-800'
                                          : isPass
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      Grade {grade}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        m.status === ResultStatus.PUBLISHED
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {m.status === ResultStatus.PUBLISHED ? (
                                        <CheckCircle className="h-3 w-3" />
                                      ) : (
                                        <Clock className="h-3 w-3" />
                                      )}
                                      <span>{m.status}</span>
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-500 italic">
                                    {m.teacherNotes || '—'}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}