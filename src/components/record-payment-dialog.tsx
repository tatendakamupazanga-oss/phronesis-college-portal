'use client';

import { useState } from 'react';
import { recordPaymentAction } from '@/app/portal/finance/actions';
import { Banknote, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentNumber?: string;
  balance: number;
}

type PaymentMethod = 'Ecocash' | 'Bank Transfer' | 'Cash' | 'Direct Deposit';

export function RecordPaymentDialog({ invoices }: { invoices: InvoiceOption[] }) {
  const [open, setOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await recordPaymentAction({
      invoiceId,
      amount: parseFloat(amount),
      method,
      reference,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMsg(`Payment recorded! Receipt #${res.receiptNo}`);
      setAmount('');
      setReference('');
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
      }, 1500);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
      >
        <Banknote className="h-4 w-4" />
        <span>Record Fee Payment</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0f1e36] text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Record Student Fee Payment</h2>
                <p className="text-[11px] text-slate-300">Issue official receipt and update balance</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Select Student Invoice
                </label>
                <select
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.studentName} (Bal: ${inv.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Amount Paid (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedInvoice?.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Ecocash">EcoCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Direct Deposit">Direct Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. MP270114.1022.A49102 or Desk Receipt"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}