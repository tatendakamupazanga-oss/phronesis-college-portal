import Link from 'next/link';
import Image from 'next/image';
import { 
  Award, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Calendar,
  Users
} from 'lucide-react';

export default function SchoolHomePage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#0f1e36] font-sans flex flex-col">
      {/* Top Notification Strip */}
      <div className="bg-[#091322] text-slate-300 text-[11px] py-2 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-navy-400" />
            <span>12787 Glen View 7, Harare</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-navy-400" />
            <span>ZIMSEC Examination Centre</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-navy-400" />
            <span>+263 772 579 758 / +263 774 464 999</span>
          </span>
          <span className="text-slate-600">•</span>
          {/* Public login only points to the Student/Parent Portal */}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Student Portal Login &rarr;
          </Link>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-sm">
              <Image
                src="/logo.svg"
                alt="Phronesis College Crest"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="block font-serif text-lg sm:text-xl font-bold tracking-tight text-[#0f1e36] leading-none uppercase">
                Phronesis College
              </span>
              <span className="mt-1 block text-[11px] text-slate-500 tracking-widest uppercase font-medium">
                Knowledge and Wisdom
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/apply/status"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-600 hover:text-navy-900"
            >
              Track Application
            </Link>

            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-[#0f1e36] hover:bg-[#1e3a5f] text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95"
            >
              <span>Apply Online (2027)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#0f1e36] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium border border-white/15">
            <Calendar className="h-3.5 w-3.5" />
            <span>Form 1 to 6 Admissions for 2027 Now Open</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Nurturing Inquiring Minds, <br />
            <span className="text-slate-300 italic font-normal">Character & Academic Distinction.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Phronesis College delivers premier ZIMSEC secondary and high school education in Glen View, Harare, offering tailored Form 3 & 4 streams and comprehensive A-Level Science & Commercial combinations.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#0f1e36] hover:bg-slate-100 font-bold px-7 py-3.5 rounded-xl shadow-lg transition text-sm active:scale-95"
            >
              <span>Start Online Application</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-6 py-3.5 rounded-xl transition text-sm"
            >
              <Users className="h-4 w-4" />
              <span>Student & Parent Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Institutional Pillars */}
      <section className="py-16 max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Institutional Pillars
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f1e36]">
            Academic Rigour & Character Formation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#0f1e36] flex items-center justify-center">
              <Award className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <h3 className="font-bold text-base text-[#0f1e36]">ZIMSEC O & A-Level Excellence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored Commercial and Science combinations with disciplined exam revision, past-paper practice, and individualized teacher mentoring.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#0f1e36] flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <h3 className="font-bold text-base text-[#0f1e36]">Comprehensive Curriculum Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access to syllabus outlines, green books, library book tracking, and academic support across all forms.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#0f1e36] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <h3 className="font-bold text-base text-[#0f1e36]">Transparent Bursary & Statements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear fee structures, official receipts, and instant terminal grade card generation for parents and guardians.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#091322] text-slate-400 text-xs py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="font-serif text-base font-bold text-white uppercase block">
              Phronesis College
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Excellence in secondary education, fostering knowledge, wisdom, and leadership across Zimbabwe.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
              Quick Links
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/apply" className="hover:text-white">Online Application (2027)</Link></li>
              <li><Link href="/apply/status" className="hover:text-white">Check Application Status</Link></li>
              <li><Link href="/login" className="hover:text-white">Student & Parent Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
              Campus Location
            </span>
            <p className="text-[11px] leading-relaxed">
              12787 Glen View 7, opposite Glen View 9 Primary School New Stands, Harare<br />
              Phones: +263 772 579 758 / +263 774 464 999[cite: 5]<br />
              Email: phronesiscollegegroup@gmail.com[cite: 5]
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-slate-500">
          © 2026 Phronesis College. Knowledge and Wisdom. All rights reserved.[cite: 5]
        </div>
      </footer>
    </div>
  );
}