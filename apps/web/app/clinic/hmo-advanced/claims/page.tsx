"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useHmoAdvancedStore, formatNGN, getDaysSince, type HmoClaimItem } from "@/store/hmoAdvancedStore";
import { exportClaimsCsv } from "@/lib/claim-exports";
import {
  Search, Filter, Plus, Download, Upload,
  CheckCircle2, AlertCircle, Clock, X,
  Eye, ArrowLeft, Send, FileText, Trash2,
  FileSpreadsheet, Loader2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const claimStatuses = ['all', 'draft', 'submitted', 'approved', 'paid', 'queried', 'rejected'] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-amber-50 text-amber-700',
    approved: 'bg-sky-50 text-sky-700',
    paid: 'bg-emerald-50 text-emerald-700',
    queried: 'bg-rose-50 text-rose-700',
    rejected: 'bg-red-50 text-red-700',
  };
  return <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", map[status] || 'bg-slate-100 text-slate-600')}>{status}</Badge>;
}

const emptyItem = { code: '', description: '', amount: 0 };

export default function ClaimsPage() {
  const { claims, addClaim, updateClaimStatus, deleteClaim } = useHmoAdvancedStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClaimDetail, setShowClaimDetail] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    hmoId: '', hmoName: '', patientId: '', patientName: '',
    diagnosis: '', items: [{ ...emptyItem }] as HmoClaimItem[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [paidAmountInput, setPaidAmountInput] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() =>
    claims.filter((c) => {
      const mSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.patientName.toLowerCase().includes(search.toLowerCase()) || c.hmoName.toLowerCase().includes(search.toLowerCase());
      const mStatus = statusFilter === 'all' || c.status === statusFilter;
      return mSearch && mStatus;
    }), [claims, search, statusFilter]);

  const claimDetail = showClaimDetail ? claims.find((c) => c.id === showClaimDetail) : null;

  const selectedTotal = useMemo(() =>
    claims.filter((c) => selectedIds.has(c.id)).reduce((s, c) => s + c.total, 0),
  [claims, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(filtered.map((c) => c.id))); }
  };

  const handleAddItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const handleRemoveItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const handleItemChange = (i: number, field: keyof HmoClaimItem, value: string | number) => {
    const items = form.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    setForm({ ...form, items });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.hmoName.trim()) errors.hmoName = 'HMO name is required';
    if (!form.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!form.diagnosis.trim()) errors.diagnosis = 'Diagnosis is required';
    const hasInvalidItem = form.items.some((i, idx) => {
      if (!i.code.trim()) { errors[`item_${idx}_code`] = 'Required'; return true; }
      if (!i.description.trim()) { errors[`item_${idx}_desc`] = 'Required'; return true; }
      if (i.amount <= 0) { errors[`item_${idx}_amt`] = 'Must be > 0'; return true; }
      return false;
    });
    if (form.items.length === 0 || hasInvalidItem) {
      if (!hasInvalidItem) errors.items = 'At least one line item is required';
    }
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddClaim = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const total = form.items.reduce((s, i) => s + i.amount, 0);
    setTimeout(() => {
      addClaim({
        hmoId: form.hmoId || 'HMO-000',
        hmoName: form.hmoName,
        patientId: form.patientId,
        patientName: form.patientName,
        diagnosis: form.diagnosis,
        items: form.items,
        total,
      });
      setForm({ hmoId: '', hmoName: '', patientId: '', patientName: '', diagnosis: '', items: [{ ...emptyItem }] });
      setFormErrors({});
      setIsSubmitting(false);
      setShowAddModal(false);
      showNotification('success', `Claim created successfully — ${total > 0 ? formatNGN(total) : ''}`);
    }, 600);
  };

  const handleBulkSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      selectedIds.forEach((id) => updateClaimStatus(id, 'submitted', { submittedDate: new Date().toISOString().slice(0, 10) }));
      setSelectedIds(new Set());
      setIsSubmitting(false);
      setShowBulkConfirm(false);
      showNotification('success', `${selectedIds.size} claims submitted successfully.`);
    }, 400);
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) return;
    deleteClaim(showDeleteConfirm);
    setShowDeleteConfirm(null);
    showNotification('success', 'Claim deleted.');
  };

  const handleStatusAction = (id: string, status: string, extras?: Record<string, unknown>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      updateClaimStatus(id, status as never, extras as never);
      setIsSubmitting(false);
      setShowClaimDetail(null);
      showNotification('success', `Claim ${status === 'paid' ? 'marked as paid' : status === 'approved' ? 'approved' : status === 'submitted' ? 'submitted' : 'updated'}.`);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Claims Management"
        description="Create, submit, and track HMO claims. Bulk operations and status tracking."
        actions={[
          { label: "New Claim", variant: "primary", onClick: () => { setForm({ hmoId: '', hmoName: '', patientId: '', patientName: '', diagnosis: '', items: [{ ...emptyItem }] }); setFormErrors({}); setShowAddModal(true); } },
          { label: "Export CSV", onClick: () => exportClaimsCsv(claims) },
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

      {/* Toolbar */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by claim ID, patient, or HMO..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              {claimStatuses.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            {selectedIds.size > 0 && (
              <Button onClick={() => setShowBulkConfirm(true)} variant="default" size="sm" className="h-10 rounded-xl gap-1.5 bg-sky-600 hover:bg-sky-700 text-xs font-bold">
                <Send size={14} /> Submit {selectedIds.size}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {claims.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No claims yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">Create your first HMO claim to start tracking submissions, approvals, and payments.</p>
            <Button onClick={() => setShowAddModal(true)} variant="default" className="h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700">
              <Plus size={16} /> New Claim
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Search size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No matching claims</h3>
            <p className="text-sm text-slate-400">Try adjusting your search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 py-4 w-10">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={selectAll} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim ID</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const days = c.submittedDate ? getDaysSince(c.submittedDate) : 0;
                  return (
                    <tr key={c.id} className={cn("group hover:bg-slate-50/50 transition-colors cursor-pointer", selectedIds.has(c.id) && 'bg-sky-50/50')} onClick={() => setShowClaimDetail(c.id)}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">{c.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{c.hmoName}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{c.patientName}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 max-w-[180px] truncate">{c.diagnosis}</td>
                      <td className="px-4 py-4 text-sm font-black text-slate-900">{formatNGN(c.total)}</td>
                      <td className="px-4 py-4">{statusBadge(c.status)}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{c.submittedDate ? `${days}d` : '-'}</td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => setShowClaimDetail(c.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Eye size={15} />
                          </Button>
                          <Button onClick={() => setShowDeleteConfirm(c.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50">
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filtered.length} of {claims.length} claims</p>
          </div>
        </Card>
      )}

      {/* Add Claim Modal */}
      <Modal isOpen={showAddModal} onClose={() => !isSubmitting && setShowAddModal(false)} title="New HMO Claim">
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* Section: Patient Information */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Patient Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name <span className="text-rose-500">*</span></label>
                <input type="text" value={form.patientName} onChange={(e) => { setForm({ ...form, patientName: e.target.value }); clearFieldError('patientName'); }}
                  placeholder="Full name"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.patientName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.patientName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.patientName}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient ID</label>
                <input type="text" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  placeholder="e.g. PT-001" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          {/* Section: HMO Details */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">HMO Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO Name <span className="text-rose-500">*</span></label>
                <input type="text" value={form.hmoName} onChange={(e) => { setForm({ ...form, hmoName: e.target.value }); clearFieldError('hmoName'); }}
                  placeholder="e.g. AXA Mansard"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.hmoName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.hmoName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.hmoName}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO ID</label>
                <input type="text" value={form.hmoId} onChange={(e) => setForm({ ...form, hmoId: e.target.value })}
                  placeholder="e.g. HMO-001" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          {/* Section: Claim Details */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Claim Details</h4>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Diagnosis <span className="text-rose-500">*</span></label>
              <input type="text" value={form.diagnosis} onChange={(e) => { setForm({ ...form, diagnosis: e.target.value }); clearFieldError('diagnosis'); }}
                placeholder="Primary diagnosis"
                className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                  formErrors.diagnosis ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
              {formErrors.diagnosis && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.diagnosis}</p>}
            </div>
          </div>

          {/* Section: Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Items <span className="text-rose-500">*</span></h4>
              <button onClick={handleAddItem} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add Item
              </button>
            </div>
            {formErrors.items && <p className="text-[10px] font-bold text-rose-500 mb-2">{formErrors.items}</p>}
            <div className="space-y-2.5">
              {form.items.map((item, i) => (
                <div key={i} className={cn("flex items-center gap-2 p-2.5 rounded-xl transition-all",
                  formErrors[`item_${i}_code`] || formErrors[`item_${i}_desc`] || formErrors[`item_${i}_amt`] ? 'bg-rose-50/50 border border-rose-200' : 'bg-slate-50 border border-slate-100')}>
                  <div className="flex-1 grid grid-cols-[80px_1fr_100px] gap-2">
                    <div>
                      <input type="text" value={item.code} onChange={(e) => { handleItemChange(i, 'code', e.target.value); clearFieldError(`item_${i}_code`); }}
                        placeholder="Code"
                        className={cn("w-full h-9 px-2 rounded-lg bg-white border text-[10px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                          formErrors[`item_${i}_code`] ? 'border-rose-300' : 'border-slate-200')} />
                      {formErrors[`item_${i}_code`] && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{formErrors[`item_${i}_code`]}</p>}
                    </div>
                    <div>
                      <input type="text" value={item.description} onChange={(e) => { handleItemChange(i, 'description', e.target.value); clearFieldError(`item_${i}_desc`); }}
                        placeholder="Description"
                        className={cn("w-full h-9 px-2 rounded-lg bg-white border text-[10px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                          formErrors[`item_${i}_desc`] ? 'border-rose-300' : 'border-slate-200')} />
                      {formErrors[`item_${i}_desc`] && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{formErrors[`item_${i}_desc`]}</p>}
                    </div>
                    <div>
                      <input type="number" min={0} value={item.amount || ''} onChange={(e) => { handleItemChange(i, 'amount', Math.max(0, Number(e.target.value))); clearFieldError(`item_${i}_amt`); }}
                        placeholder="Amount"
                        className={cn("w-full h-9 px-2 rounded-lg bg-white border text-[10px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                          formErrors[`item_${i}_amt`] ? 'border-rose-300' : 'border-slate-200')} />
                      {formErrors[`item_${i}_amt`] && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{formErrors[`item_${i}_amt`]}</p>}
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button onClick={() => handleRemoveItem(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Total Claim Amount</span>
            <span className="text-lg font-black text-sky-600">{formatNGN(form.items.reduce((s, i) => s + i.amount, 0))}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => setShowAddModal(false)} disabled={isSubmitting} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleAddClaim} disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Claim'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Claim Detail Modal */}
      <Modal isOpen={!!claimDetail} onClose={() => setShowClaimDetail(null)} title={claimDetail ? claimDetail.id : ''}>
        {claimDetail && (
          <div className="space-y-5">
            {/* Status banner */}
            <div className={cn("p-3 rounded-xl flex items-center justify-between",
              claimDetail.status === 'paid' ? 'bg-emerald-50' :
              claimDetail.status === 'approved' ? 'bg-sky-50' :
              claimDetail.status === 'submitted' ? 'bg-amber-50' :
              claimDetail.status === 'queried' || claimDetail.status === 'rejected' ? 'bg-rose-50' : 'bg-slate-50'
            )}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <div className="mt-1">{statusBadge(claimDetail.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{formatNGN(claimDetail.total)}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.hmoName}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.patientName}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.diagnosis}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Line Items</p>
              <div className="space-y-1.5">
                {claimDetail.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">{item.code}</span>
                      <span className="font-medium text-slate-700">{item.description}</span>
                    </div>
                    <span className="font-black text-slate-900">{formatNGN(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paid info */}
            {claimDetail.paidAmount !== undefined && claimDetail.paidAmount > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Amount Paid</span>
                <span className="text-base font-black text-emerald-700">{formatNGN(claimDetail.paidAmount)}</span>
              </div>
            )}

            {/* Timestamps */}
            {claimDetail.submittedDate && (
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1.5"><Clock size={12} /> Submitted {claimDetail.submittedDate} ({getDaysSince(claimDetail.submittedDate)} days ago)</span>
                {claimDetail.approvedDate && <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Approved {claimDetail.approvedDate}</span>}
                {claimDetail.paidDate && <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Paid {claimDetail.paidDate}</span>}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              {claimDetail.status === 'draft' && (
                <Button onClick={() => handleStatusAction(claimDetail.id, 'submitted', { submittedDate: new Date().toISOString().slice(0, 10) })}
                  disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
              )}
              {claimDetail.status === 'submitted' && (
                <Button onClick={() => handleStatusAction(claimDetail.id, 'approved', { approvedDate: new Date().toISOString().slice(0, 10) })}
                  disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isSubmitting ? 'Approving...' : 'Mark Approved'}
                </Button>
              )}
              {claimDetail.status === 'approved' && (
                <div className="flex gap-2 w-full">
                  <div className="flex-1">
                    <input type="number" min={0} value={paidAmountInput} onChange={(e) => setPaidAmountInput(e.target.value)}
                      placeholder="Enter paid amount"
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
                  </div>
                  <Button onClick={() => {
                    const amt = Number(paidAmountInput) || 0;
                    handleStatusAction(claimDetail.id, 'paid', { paidDate: new Date().toISOString().slice(0, 10), paidAmount: amt });
                    setPaidAmountInput('');
                  }} disabled={isSubmitting} variant="default" className="h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {isSubmitting ? 'Processing...' : 'Mark Paid'}
                  </Button>
                </div>
              )}
              {claimDetail.status !== 'draft' && claimDetail.status !== 'submitted' && claimDetail.status !== 'approved' && (
                <div className="flex-1" />
              )}
              <Button onClick={() => setShowClaimDetail(null)} variant="outline" className="h-11 rounded-xl font-bold border-slate-200 px-6">Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Delete Claim">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900">Are you sure?</p>
              <p className="text-xs text-rose-700 mt-1">This will permanently delete claim <span className="font-bold">{showDeleteConfirm}</span>. This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleDelete} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-rose-600 hover:bg-rose-700">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Submit Confirmation Modal */}
      <Modal isOpen={showBulkConfirm} onClose={() => setShowBulkConfirm(false)} title="Submit Claims">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <Send size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Submit {selectedIds.size} claim(s)?</p>
              <p className="text-xs text-amber-700 mt-1">Selected claims total: <span className="font-bold">{formatNGN(selectedTotal)}</span>. They will be moved to &quot;submitted&quot; status.</p>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {claims.filter((c) => selectedIds.has(c.id)).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-xs">
                <span className="font-bold text-slate-900">{c.id}</span>
                <span className="text-slate-500">{c.patientName} · {c.hmoName}</span>
                <span className="font-bold text-slate-700">{formatNGN(c.total)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowBulkConfirm(false)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleBulkSubmit} disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {isSubmitting ? 'Submitting...' : `Submit ${selectedIds.size} Claims`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
