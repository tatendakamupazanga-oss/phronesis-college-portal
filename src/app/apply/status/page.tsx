'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { checkApplicationStatusAction } from './actions';
import { Search, Loader2, ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function ApplicationStatusPage() {
  const [appNo, setAppNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await checkApplicationStatusAction(appNo);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setResult(res.application);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#0f1e36] font-sans pb-16">
      {/* Top Navigation */}
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
              Admissions Status Tracker
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

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-900">
              Track Your Application Status
            </h1>
            <p className="text-xs text-slate-500">
              Enter the application reference code generated during online submission (e.g., <span className="font-mono font-bold">APP-2027-0001</span>).
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter Reference Number (e.g. APP-2027-0001)"
                value={appNo}
                onChange={(e) => setAppNo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 font-mono text-sm uppercase font-bold focus:outline-none focus:border-navy-900"
              />
              <Search className="h-5 w-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f1e36] hover:bg-[#1e3a5f] text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching Registry...</span>
                </>
              ) : (
                <span>Check Status</span>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-sans">
                  <span className="text-slate-500 font-semibold">Candidate:</span>
                  <span className="font-bold text-navy-900 text-sm">
                    {result.firstName} {result.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-bold text-blue-900">{result.applicationNo}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Level:</span>
                  <span className="font-bold text-slate-800">
                    Form {result.targetForm} ({result.entryYear})
                  </span>
                </div>

                {result.chosenCombination && (
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-slate-500 text-xs">Combination:</span>
                    <span className="font-bold text-emerald-800 text-xs">{result.chosenCombination}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-slate-500 font-sans font-semibold">Current Decision:</span>
                  <div>
                    {result.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>ACCEPTED / PROVISIONAL OFFER</span>
                      </span>
                    ) : result.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <XCircle className="h-4 w-4" />
                        <span>UNSUCCESSFUL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="h-4 w-4" />
                        <span>UNDER ADMISSIONS REVIEW</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.status === 'ACCEPTED' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-1">
                  <p className="font-bold">Next Steps for Clearance:</p>
                  <p>
                    Please visit the Phronesis College Bursary at 12787 Glen View 7 with the candidate's original birth certificate and medical report to complete uniform fitting ($180) and term registration ($15)[cite: 5].
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}