'use client';

import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PrintReportButton() {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <button
        onClick={() => window.print()}
        className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition active:scale-95"
      >
        <Printer className="h-4 w-4" />
        <span>Print / Save as PDF</span>
      </button>
    </div>
  );
}