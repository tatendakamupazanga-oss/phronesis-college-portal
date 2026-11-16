'use client';

import { useState } from 'react';
import { generateInvoicesAction } from '@/app/portal/finance/actions';
import { FilePlus2, Plus, Trash2, Users, User, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GenerateInvoiceDialogProps {
  terms: { id: string; termNumber: number; year: number }[];
  classes: { id: string; name: string; formLevel: number }[];
  students: { id: string; studentNumber: string; fullName: string; className: string }[];
}

export function GenerateInvoiceDialog({ terms, classes, students }: GenerateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS');
  const [termId, setTermId] = useState(terms[0]?.id || '');
  const [schoolClassId, setSchoolClassId] = useState(classes[0]?.id || '');
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [skipIfAlreadyBilled, setSkipIfAlreadyBilled] = useState(true);

  const [items, setItems] = useState<{ description: string; amount: string }[]>([
    { description: 'Term Tuition Fees', amount: '210' },
    { description: 'Stationery & Amenities Levy', amount: '5' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalAmount = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  function addLineItem() {
    setItems([...items, { description: '', amount: '' }]);
  }

  function removeLineItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  }

  function updateItem(index: number, field: 'description' | 'amount', value: string) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function applyNewIntakePreset() {
    setItems([
      { description: 'Term Tuition Fees', amount: '210' },
      { description: 'Complete School Uniform Set', amount: '180' },
      { description: 'Registration Fee', amount: '15' },
      { description: 'Stationery & Bond Paper Levy', amount: '5' },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await generateInvoicesAction({
      mode,
      studentId: mode === 'INDIVIDUAL' ? studentId : undefined,
      schoolClassId: mode === 'CLASS' ? schoolClassId : undefined,
      termId,
      items: items.map((i) => ({
        description: i.description,
        amount: parseFloat(i.amount) || 0,
      })),
      skipIfAlreadyBilled,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      const skippedText = res.skippedCount ? ` (${res.skippedCount} already billed skipped)` : '';
      setSuccessMsg(`Successfully generated ${res.createdCount} invoice(s)${skippedText}.`);
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
      }, 1600);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-[#0f1e36] hover:bg-[#1a335c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
      >
        <FilePlus2 className="h-4 w-4" />
        <span>Generate Invoices</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0f1e36] text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Generate Term Fee Invoices</h2>
                <p className="text-[11px] text-slate-300">Bill an entire class or an individual student</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
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

              {/* Billing Target Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('CLASS')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    mode === 'CLASS' ? 'bg-white text-[#0f1e36] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Whole Class / Stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('INDIVIDUAL')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    mode === 'INDIVIDUAL' ? 'bg-white text-[#0f1e36] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Single Student</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Academic Term
                  </label>
                  <select
                    value={termId}
                    onChange={(e) => setTermId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                  >
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        Term {t.termNumber} ({t.year})
                      </option>
                    ))}
                  </select>
                </div>

                {mode === 'CLASS' ? (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Target Class
                    </label>
                    <select
                      value={schoolClassId}
                      onChange={(e) => setSchoolClassId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Target Student
                    </label>
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.studentNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Fee Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Fee Breakdown Items (USD)
                  </label>
                  <button
                    type="button"
                    onClick={applyNewIntakePreset}
                    className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Load $410 New Intake Preset
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Fee description (e.g. Tuition)"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        required
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                        required
                        className="w-24 px-3 py-2 border border-slate-300 rounded-xl font-mono text-right focus:outline-none focus:ring-2 focus:ring-[#0f1e36]"
                      />
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f1e36] hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Fee Line</span>
                  </button>
                  <div className="text-right font-mono">
                    <span className="text-[11px] text-slate-500 mr-2">Invoice Total:</span>
                    <span className="text-sm font-extrabold text-[#0f1e36]">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {mode === 'CLASS' && (
                <label className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipIfAlreadyBilled}
                    onChange={(e) => setSkipIfAlreadyBilled(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Skip students who already have an invoice for this term</span>
                </label>
              )}

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
                  <span>{mode === 'CLASS' ? 'Generate Class Invoices' : 'Generate Student Invoice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}