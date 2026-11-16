'use client';

import { useState } from 'react';
import { changePasswordAction } from './actions';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changePasswordAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success) {
      setSuccess(true);
      setLoading(false);
      form.reset();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#0f1e36]">
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your portal access credentials and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0f1e36]">Security Guidance</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              If this is your first time logging in with your default assigned password (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Password123!</code>), please update it immediately to protect your academic and financial records.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p>• At least 8 characters long</p>
            <p>• Never share with peers or third parties</p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <KeyRound className="h-4 w-4 text-[#0f1e36]" />
            <h2 className="text-sm font-bold text-[#0f1e36]">Update Password</h2>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Your password has been successfully updated.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f1e36] focus:outline-none"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f1e36] focus:outline-none"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  placeholder="Re-type new password"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f1e36] focus:outline-none"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0f1e36] hover:bg-[#1a335c] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating Security Key...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}