'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { SessionPayload } from '@/lib/auth';

interface PortalSidebarProps {
  session: SessionPayload;
}

export function PortalSidebar({ session }: PortalSidebarProps) {
  const pathname = usePathname();
  const isStaff = session.role !== 'STUDENT';
  const isAdmin = session.role === 'ADMIN';
  const isFinance = session.role === 'ADMIN' || session.role === 'FINANCE';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/portal',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Admissions Desk',
      href: '/portal/admissions',
      icon: FileText,
      show: isStaff,
    },
    {
      label: 'Student Directory',
      href: '/portal/students',
      icon: Users,
      show: isStaff,
    },
    {
      label: 'Marks & Academics',
      href: '/portal/academics',
      icon: GraduationCap,
      show: true,
    },
    {
      label: 'Fee Statements',
      href: '/portal/finance',
      icon: CreditCard,
      show: true,
    },
    {
      label: 'Library Vault',
      href: '/portal/library',
      icon: BookOpen,
      show: true,
    },
    {
      label: 'Settings & Security',
      href: '/portal/settings',
      icon: Settings,
      show: true,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#091322] text-slate-200 flex flex-col shrink-0 border-r border-white/10 md:min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
          <Image
            src="/logo.svg"
            alt="Phronesis Crest"
            width={34}
            height={34}
            className="object-contain"
            priority
          />
        </div>
        <div className="overflow-hidden">
          <span className="block font-serif font-bold text-sm tracking-wide text-white leading-tight truncate">
            Phronesis College
          </span>
          <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            {session.role} Portal
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="p-4 space-y-1.5 flex-1 text-xs font-semibold overflow-y-auto">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* User Status Bar & Logout */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#070f1c]">
        <div className="overflow-hidden pr-2">
          <p className="text-xs font-bold text-white truncate font-mono uppercase">
            {session.username}
          </p>
          <p className="text-[10px] text-slate-400 capitalize">
            {session.role.toLowerCase()}
          </p>
        </div>
        <Link
          href="/api/auth/logout"
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition"
          title="Sign out of portal"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}