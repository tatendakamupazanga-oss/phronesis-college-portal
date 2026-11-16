import Link from 'next/link';
import { SessionPayload } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function PortalHeader({ session }: { session: SessionPayload }) {
  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    redirect('/login');
  }

  return (
    <header className="print:hidden bg-white border-b border-slate-200 border-t-[3px] border-t-navy-900 h-16 px-4 sm:px-6 flex items-center justify-between">
      {/* Clickable Header Title -> Links back to Home Page "/" */}
      <div className="min-w-0">
        <Link href="/" className="group block">
          <span className="block font-serif text-base sm:text-lg text-navy-900 group-hover:text-navy-700 leading-tight truncate">
            Phronesis Management Portal
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 leading-tight group-hover:underline">
            <span>&larr; Exit to Public Website</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="block text-sm font-semibold text-slate-900 leading-tight">
              {session.name}
            </span>
            <span className="block text-xs text-slate-500 leading-tight capitalize">
              {String(session.role).toLowerCase()}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-9 w-9 rounded-full bg-navy-900 text-white text-sm font-semibold flex items-center justify-center"
          >
            {session.name?.trim().charAt(0).toUpperCase()}
          </div>
        </div>

        <span aria-hidden="true" className="h-6 w-px bg-slate-200" />

        <form action={handleLogout}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900 cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

export default PortalHeader;