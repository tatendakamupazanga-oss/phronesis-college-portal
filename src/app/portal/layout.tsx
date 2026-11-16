import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getSession } from '@/lib/auth';
import { PortalSidebar } from '@/components/portal-sidebar';
import { PortalHeader } from '@/components/portal-header';

// Allow dynamic blocking route for Next.js 16 authenticated portal layout
export const instant = false;

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <PortalSidebar session={session} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader session={session} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}