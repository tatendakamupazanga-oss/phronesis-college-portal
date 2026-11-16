'use client';

import { useState, useMemo } from 'react';
import { Download, AlertTriangle, CheckCircle, Receipt, Search, Filter } from 'lucide-react';

export interface SerializedInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  className: string;
  termNumber: number;
  academicYear: number;
  totalDue: number;
  balance: number;
  items: { id: string; description: string; amount: number }[];
  payments: {
    id: string;
    receiptNo: string;
    amountPaid: number;
    method: string;
    reference: string | null;
    paymentDate: string;
  }[];
}

interface BursaryLedgerClientProps {
  invoices: SerializedInvoice[];
  isStudent: boolean;
}

export function BursaryLedgerClient({ invoices, isStudent }: BursaryLedgerClientProps) {
  const [selectedScope, setSelectedScope] = useState<'ALL_YEAR' | '1' | '2' | '3'>('ALL_YEAR');
  const [viewMode, setViewMode] = useState<'ALL' | 'DEBTORS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter invoices by Term or Full Year
  const scopeInvoices = useMemo(() => {
    if (selectedScope === 'ALL_YEAR') return invoices;
    return invoices.filter((inv) => String(inv.termNumber) === selectedScope);
  }, [invoices, selectedScope]);

  // Financial Summary Totals for selected scope
  const metrics = useMemo(() => {
    const totalBilled = scopeInvoices.reduce((sum, inv) => sum + inv.totalDue, 0);
    const totalArrears = scopeInvoices.reduce((sum, inv) => sum + inv.balance, 0);
    const totalPaid = Number((totalBilled - totalArrears).toFixed(2));
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

    // Channel breakdown
    const channels: Record<string, number> = { Cash: 0, Ecocash: 0, 'Bank Transfer': 0, Other: 0 };
    scopeInvoices.forEach((inv) => {
      inv.payments.forEach((p) => {
        if (p.method in channels) {
          channels[p.method] += p.amountPaid;
        } else {
          channels.Other += p.amountPaid;
        }
      });
    });

    return { totalBilled, totalPaid, totalArrears, collectionRate, channels };
  }, [scopeInvoices]);

  // Aggregate Debtors List (Students with unpaid balances in the selected scope)
  const debtorsList = useMemo(() => {
    const map = new Map<
      string,
      {
        studentId: string;
        studentNumber: string;
        studentName: string;
        className: string;
        totalBilled: number;
        totalPaid: number;
        balance: number;
        invoiceCount: number;
      }
    >();

    scopeInvoices.forEach((inv) => {
      if (inv.balance <= 0) return;
      const existing = map.get(inv.studentId);
      const paidOnInv = inv.totalDue - inv.balance;
      if (existing) {
        existing.totalBilled += inv.totalDue;
        existing.totalPaid += paidOnInv;
        existing.balance += inv.balance;
        existing.invoiceCount += 1;
      } else {
        map.set(inv.studentId, {
          studentId: inv.studentId,
          studentNumber: inv.studentNumber,
          studentName: inv.studentName,
          className: inv.className,
          totalBilled: inv.totalDue,
          totalPaid: paidOnInv,
          balance: inv.balance,
          invoiceCount: 1,
        });
      }
    });

    return Array.from(map.values())
      .filter(
        (d) =>
          d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.className.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.balance - a.balance);
  }, [scopeInvoices, searchQuery]);

  // Filtered Invoices for Statements view
  const filteredInvoices = useMemo(() => {
    return scopeInvoices.filter(
      (inv) =>
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scopeInvoices, searchQuery]);

  // Export Debtors List to CSV (Excel-compatible)
  function exportDebtorsCsv() {
    const scopeLabel = selectedScope === 'ALL_YEAR' ? 'Full_Year' : `Term_${selectedScope}`;
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Billing Scope',
      'Total Billed (USD)',
      'Total Paid (USD)',
      'Outstanding Balance (USD)',
      'Academic Result Status',
    ];

    const rows = debtorsList.map((d) => [
      d.studentNumber,
      `"${d.studentName}"`,
      `"${d.className}"`,
      scopeLabel,
      d.totalBilled.toFixed(2),
      d.totalPaid.toFixed(2),
      d.balance.toFixed(2),
      'RESULTS HELD (ARREARS)',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Phronesis_Debtors_Report_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Period Selector & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Accounting Period:</span>
          </span>
          {(
            [
              { key: 'ALL_YEAR', label: 'Full Academic Year' },
              { key: '1', label: 'Term 1' },
              { key: '2', label: 'Term 2' },
              { key: '3', label: 'Term 3' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedScope(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedScope === tab.key
                  ? 'bg-[#0f1e36] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Search student name, ID, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Accounting Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
            {selectedScope === 'ALL_YEAR' ? 'Annual Fees Billed' : `Term ${selectedScope} Billed`}
          </span>
          <span className="text-2xl font-black text-[#0f1e36] mt-1 block">
            ${metrics.totalBilled.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 font-sans">
            {scopeInvoices.length} invoice(s) issued
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
            Total Collected
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ${metrics.totalPaid.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-600 font-sans font-semibold">
            {metrics.collectionRate}% collection rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
            Outstanding Balances
          </span>
          <span
            className={`text-2xl font-black mt-1 block ${
              metrics.totalArrears > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            ${metrics.totalArrears.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 font-sans">
            {debtorsList.length} student(s) with arrears
          </span>
        </div>

        {!isStudent && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs font-sans">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Channel Breakdown
            </span>
            <div className="mt-2 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Desk:</span>
                <span className="font-bold text-slate-800">${metrics.channels.Cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EcoCash:</span>
                <span className="font-bold text-slate-800">${metrics.channels.Ecocash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Transfer:</span>
                <span className="font-bold text-slate-800">${metrics.channels['Bank Transfer'].toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin View Mode Switcher & CSV Export */}
      {!isStudent && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('ALL')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                viewMode === 'ALL' ? 'bg-white text-[#0f1e36] shadow-xs' : 'text-slate-600'
              }`}
            >
              All Fee Statements ({filteredInvoices.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('DEBTORS')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'DEBTORS' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Debtors & Arrears List ({debtorsList.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportDebtorsCsv}
            disabled={debtorsList.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Debtors CSV / Excel ({debtorsList.length})</span>
          </button>
        </div>
      )}

      {/* VIEW 1: DEBTORS AGING & ARREARS TABLE */}
      {!isStudent && viewMode === 'DEBTORS' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0f1e36]">
                Students with Outstanding Fee Balances
              </h2>
              <p className="text-[11px] text-slate-500">
                Academic exam results are automatically withheld for students listed below until balance reaches $0.00.
              </p>
            </div>
          </div>

          {debtorsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No students carry outstanding balances for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right">Billed</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Balance</th>
                    <th className="py-3 px-4 text-center">Portal Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtorsList.map((d) => (
                    <tr key={d.studentId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-[#0f1e36]">
                        {d.studentNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{d.studentName}</td>
                      <td className="py-3 px-4 text-slate-600">{d.className}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${d.totalBilled.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        ${d.totalPaid.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-700">
                        ${d.balance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Results Blocked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: DETAILED FEE STATEMENTS & RECEIPTS */
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
              No fee invoices match your selected period or search.
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isSettled = inv.balance <= 0;

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {inv.invoiceNumber}
                      </span>
                      <h2 className="text-base font-bold text-[#0f1e36] mt-1">
                        {inv.studentName} ({inv.studentNumber})
                      </h2>
                      <span className="text-xs text-slate-500 font-medium">
                        Class: {inv.className} • Term {inv.termNumber} ({inv.academicYear})
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isSettled ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isSettled ? 'Settled in Full' : `Balance: $${inv.balance.toFixed(2)}`}
                        </span>
                      </span>
                      <span className="block font-mono text-[11px] text-slate-400 mt-1">
                        Total Billed: ${inv.totalDue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Line Items */}
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Itemized Fee Charges
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                        {inv.items.length === 0 ? (
                          <div className="p-3 text-slate-500">
                            Consolidated Term Tuition & Levies — ${inv.totalDue.toFixed(2)}
                          </div>
                        ) : (
                          inv.items.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between">
                              <span className="font-medium text-slate-800">{item.description}</span>
                              <span className="font-mono font-bold text-[#0f1e36]">
                                ${item.amount.toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Receipts */}
                    {inv.payments.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-[#0f1e36]" />
                          <span>Confirmed Payment Receipts</span>
                        </h4>
                        <div className="space-y-1.5">
                          {inv.payments.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-emerald-950 font-mono">{p.receiptNo}</span>
                                <span className="text-[11px] text-slate-600 ml-2">
                                  {new Date(p.paymentDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                                  {p.reference ? `(${p.reference})` : ''}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-emerald-800">
                                +${p.amountPaid.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}