'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { studentLoginAction, staffGateLoginAction } from './actions';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'student' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = tab === 'student' 
        ? await studentLoginAction(formData)
        : await staffGateLoginAction(formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success && res?.redirectUrl) {
        // Use hard navigation so the browser immediately sends the new session cookie
        window.location.href = res.redirectUrl;
      } else {
        setError('Unexpected response from authentication server.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Connection timed out while verifying credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#0f1e36] font-sans flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#091322] p-2 flex items-center justify-center shadow-md">
            <Image
              src="/logo.svg"
              alt="Phronesis Crest"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-2xl font-serif font-bold text-[#0f1e36]">
          Phronesis College Portal
        </h1>
        <p className="text-xs text-slate-500">
          Knowledge and Wisdom • Centralized Institutional Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Role Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('student'); setError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              tab === 'student' 
                ? 'bg-white text-[#0f1e36] shadow-xs' 
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student & Parent</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('staff'); setError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              tab === 'staff' 
                ? 'bg-[#0f1e36] text-white shadow-xs' 
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Faculty & Staff</span>
          </button>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-md space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {tab === 'student' ? 'Student Number / ID' : 'Staff Identifier / Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  placeholder={tab === 'student' ? 'phr27k8m4' : 'admin or PHRTCH4M9'}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#0f1e36] focus:outline-none"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f1e36] focus:outline-none"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-sm text-white ${
                tab === 'student' ? 'bg-[#0f1e36] hover:bg-[#1a335c]' : 'bg-blue-700 hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'student' ? 'Access Student Dossier' : 'Authenticate Staff Portal'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/apply" className="font-semibold text-[#0f1e36] hover:underline">
              New Application &rarr;
            </Link>
            <Link href="/apply/status" className="hover:underline">
              Check Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}