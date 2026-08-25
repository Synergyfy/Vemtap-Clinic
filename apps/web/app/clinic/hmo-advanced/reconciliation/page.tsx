"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useHmoAdvancedStore, formatNGN, type HmoRemittance } from "@/store/hmoAdvancedStore";
import { exportRemittancesCsv } from "@/lib/claim-exports";
import {
  Search, Plus, CheckCircle2, AlertCircle,
  ArrowLeft, DollarSign, Download, X,
  Loader2, FileSpreadsheet, Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";

const emptyForm = { hmoId: '', hmoName: '', receivedDate: '', amount: 0, reference: '', notes: '' };

export default function ReconciliationPage() {
  const { remittances, claims, addRemittance, matchRemittance } = useHmoAdvancedStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const unmatchedClaims = claims.filter((c) => c.status === 'approved' || c.status === 'paid');

  const filtered = remittances.filter((r) =>
    !search || r.reference.toLowerCase().includes(search.toLowerCase()) || r.hmoName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMatch = (id: string) => {
    setSelectedMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.hmoName.trim()) errors.hmoName = 'HMO name is required';
    if (!form.reference.trim()) errors.reference = 'Reference is required';
    if (form.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!form.receivedDate) errors.receivedDate = 'Received date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: string) => {
    if (formErrors[field]) {
      const next = { ...formErrors };
      delete next[field];
      setFormErrors(next);
    }
  };

  const handleAddRemittance = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addRemittance({
        hmoId: form.hmoId || 'HMO-000',
        hmoName: form.hmoName,
        receivedDate: form.receivedDate,
        amount: form.amount,
        reference: form.reference,
        matchedClaimIds: [],
        status: 'pending',
        notes: form.notes,
      });
      setForm({ ...emptyForm });
      setFormErrors({});
      setIsSubmitting(false);
      setShowAddModal(false);
      showNotification('success', `Remittance ${form.reference} recorded — ${formatNGN(form.amount)}`);
    }, 600);
  };

  const handleMatch = () => {
    if (showMatchModal && selectedMatchIds.size > 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        matchRemittance(showMatchModal, Array.from(selectedMatchIds));
        setSelectedMatchIds(new Set());
        setIsSubmitting(false);
        setShowMatchModal(null);
        showNotification('success', `${selectedMatchIds.size} claim(s) matched successfully.`);
      }, 400);
    }
  };

  const remittanceMatch = showMatchModal ? remittances.find((r) => r.id === showMatchModal) : null;

  const matchedAmount = useMemo(() => {
    if (!remittanceMatch) return 0;
    return unmatchedClaims
      .filter((c) => selectedMatchIds.has(c.id))
      .reduce((s, c) => s + (c.paidAmount || c.total), 0);
  }, [unmatchedClaims, selectedMatchIds, remittanceMatch]);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Remittance Reconciliation"
        description="Match HMO payments to claims, track partial settlements, and reconcile outstanding balances."
        actions={[
          { label: "Record Remittance", variant: "primary", onClick: () => { setForm({ ...emptyForm }); setFormErrors({}); setShowAddModal(true); } },
          { label: "Export CSV", onClick: () => exportRemittancesCsv(remittances) },
        ]}
      />

      {notification && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all duration-300",
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
        )}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 px-8 py-6 flex items-center gap-4">
            <Loader2 size={22} className="text-sky-600 animate-spin" />
            <span className="text-sm font-bold text-slate-700">Processing...</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Remittances</p>
            <p className="text-xl font-black text-slate-900 mt-1">{formatNGN(remittances.reduce((s, r) => s + r.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconciled</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{remittances.filter((r) => r.status === 'reconciled').length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending / Partial</p>
            <p className="text-xl font-black text-amber-600 mt-1">{remittances.filter((r) => r.status !== 'reconciled').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or HMO..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400" />
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {remittances.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <Banknote size={32} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No remittances recorded</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">Record HMO payments and match them to approved claims to reconcile your accounts.</p>
            <Button onClick={() => setShowAddModal(true)} variant="default" className="h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700">
              <Plus size={16} /> Record Remittance
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Search size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No matching remittances</h3>
            <p className="text-sm text-slate-400">Try adjusting your search.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Received</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched Claims</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{r.reference}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{r.hmoName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{r.receivedDate}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">{formatNGN(r.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{r.matchedClaimIds.length} claims</td>
                    <td className="px-6 py-4">
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0",
                        r.status === 'reconciled' ? 'bg-emerald-50 text-emerald-700' :
                        r.status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      )}>{r.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== 'reconciled' && (
                        <Button onClick={() => { setSelectedMatchIds(new Set(r.matchedClaimIds)); setShowMatchModal(r.id); }}
                          variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50">
                          Match Claims
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filtered.length} of {remittances.length} remittances</p>
          </div>
        </Card>
      )}

      {/* Add Remittance Modal */}
      <Modal isOpen={showAddModal} onClose={() => !isSubmitting && setShowAddModal(false)} title="Record Remittance">
        <div className="space-y-5">
          {/* HMO Details */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">HMO Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO Name <span className="text-rose-500">*</span></label>
                <input type="text" value={form.hmoName} onChange={(e) => { setForm({ ...form, hmoName: e.target.value }); clearFieldError('hmoName'); }}
                  placeholder="e.g. AXA Mansard"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.hmoName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.hmoName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.hmoName}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO ID</label>
                <input type="text" value={form.hmoId} onChange={(e) => setForm({ ...form, hmoId: e.target.value })}
                  placeholder="e.g. HMO-001" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Payment Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference <span className="text-rose-500">*</span></label>
                <input type="text" value={form.reference} onChange={(e) => { setForm({ ...form, reference: e.target.value }); clearFieldError('reference'); }}
                  placeholder="e.g. AXA-PAY-0422"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.reference ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.reference && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.reference}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Received Date <span className="text-rose-500">*</span></label>
                <input type="date" value={form.receivedDate} onChange={(e) => { setForm({ ...form, receivedDate: e.target.value }); clearFieldError('receivedDate'); }}
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all",
                    formErrors.receivedDate ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.receivedDate && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.receivedDate}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (₦) <span className="text-rose-500">*</span></label>
              <input type="number" min={0} value={form.amount || ''} onChange={(e) => { setForm({ ...form, amount: Math.max(0, Number(e.target.value)) }); clearFieldError('amount'); }}
                placeholder="0"
                className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                  formErrors.amount ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
              {formErrors.amount && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.amount}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span></label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Full settlement for March batch"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => setShowAddModal(false)} disabled={isSubmitting} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleAddRemittance} disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
              {isSubmitting ? 'Recording...' : 'Record Remittance'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Match Claims Modal */}
      <Modal isOpen={!!showMatchModal} onClose={() => !isSubmitting && setShowMatchModal(null)} title={remittanceMatch ? `Match Claims` : ''}>
        {remittanceMatch && (
          <div className="space-y-5">
            {/* Balance overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remittance</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{formatNGN(remittanceMatch.amount)}</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Selected</p>
                <p className="text-base font-black text-sky-600 mt-0.5">{formatNGN(matchedAmount)}</p>
              </div>
              <div className={cn("p-3 rounded-xl",
                remittanceMatch.amount - matchedAmount >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
              )}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest",
                  remittanceMatch.amount - matchedAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>Remaining</p>
                <p className={cn("text-base font-black mt-0.5",
                  remittanceMatch.amount - matchedAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>{formatNGN(remittanceMatch.amount - matchedAmount)}</p>
              </div>
            </div>

            {/* Matching claims list */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {unmatchedClaims.length} claim(s) available to match
              </p>
              {unmatchedClaims.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No approved or paid claims available to match.</p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5">
                  {unmatchedClaims.map((c) => {
                    const claimTotal = c.paidAmount || c.total;
                    const isSelected = selectedMatchIds.has(c.id);
                    return (
                      <label key={c.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        isSelected ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white hover:border-slate-200'
                      )}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleMatch(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">{c.id} — {c.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{c.hmoName} · {c.diagnosis}</p>
                        </div>
                        <span className="text-sm font-black text-slate-900">{formatNGN(claimTotal)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button onClick={() => { setShowMatchModal(null); setSelectedMatchIds(new Set()); }} disabled={isSubmitting} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
              <Button onClick={handleMatch} disabled={selectedMatchIds.size === 0 || isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isSubmitting ? 'Matching...' : `Match ${selectedMatchIds.size} Claim${selectedMatchIds.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
