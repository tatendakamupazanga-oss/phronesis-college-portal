'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { staffGateLoginAction } from '@/app/login/actions';
import { ShieldCheck, Lock, KeyRound, Loader2, AlertCircle } from 'lucide-react';

export default function StaffAdminGatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await staffGateLoginAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    }
  }

  return (
    <div className="min-h-screen bg-[#070e18] text-slate-100 font-sans flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Matrix/Accent Effect */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 relative z-10">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shadow-lg backdrop-blur-md">
          <ShieldCheck className="h-8 w-8 text-slate-200" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white uppercase">
          Faculty & Admin Gateway
        </h1>
        <p className="text-[11px] text-slate-400">
          Authorized personnel only • Strictly monitored & rate-limited access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0f1e36]/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                Staff Identity / ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#091322] border border-white/15 rounded-xl font-mono text-white focus:outline-none focus:border-blue-400 placeholder-slate-600"
                />
                <KeyRound className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#091322] border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400 placeholder-slate-600"
                />
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
            Unauthorised attempts are logged and flagged with origin IP address.
          </div>
        </div>
      </div>
    </div>
  );
}