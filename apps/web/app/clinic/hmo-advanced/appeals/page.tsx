"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useHmoAdvancedStore, formatNGN } from "@/store/hmoAdvancedStore";
import { exportAppealsCsv } from "@/lib/claim-exports";
import {
  Search, Plus, ShieldAlert, CheckCircle2,
  AlertCircle, ArrowLeft, Send, Clock, X, FileText,
  Loader2, AlertTriangle, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

function appealBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-amber-50 text-amber-700',
    under_review: 'bg-sky-50 text-sky-700',
    approved: 'bg-emerald-50 text-emerald-700',
    dismissed: 'bg-rose-50 text-rose-700',
  };
  return <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", map[status] || 'bg-slate-100 text-slate-600')}>{status.replace('_', ' ')}</Badge>;
}

const emptyForm = { claimId: '', hmoName: '', patientName: '', reason: '', supportingNotes: '' };

export default function AppealsPage() {
  const { appeals, claims, addAppeal, updateAppeal } = useHmoAdvancedStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showDismissConfirm, setShowDismissConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filtered = appeals.filter((a) =>
    !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.hmoName.toLowerCase().includes(search.toLowerCase()) || a.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const detail = showDetail ? appeals.find((a) => a.id === showDetail) : null;
  const queriedClaims = claims.filter((c) => c.status === 'queried' || c.status === 'rejected');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.claimId.trim()) errors.claimId = 'Claim ID is required';
    if (!form.hmoName.trim()) errors.hmoName = 'HMO name is required';
    if (!form.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!form.reason.trim()) errors.reason = 'Appeal reason is required';
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

  const handleAddAppeal = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addAppeal({
        claimId: form.claimId,
        hmoName: form.hmoName,
        patientName: form.patientName,
        reason: form.reason,
        supportingNotes: form.supportingNotes,
      });
      setForm({ ...emptyForm });
      setFormErrors({});
      setIsSubmitting(false);
      setShowAddModal(false);
      showNotification('success', `Appeal created for ${form.claimId}`);
    }, 600);
  };

  const handleQuickCreate = (claimId: string) => {
    const c = claims.find((cl) => cl.id === claimId);
    if (!c) return;
    setForm({
      claimId: c.id,
      hmoName: c.hmoName,
      patientName: c.patientName,
      reason: `Appeal for ${c.id} — ${c.diagnosis}`,
      supportingNotes: '',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleDismiss = () => {
    if (!showDismissConfirm) return;
    setIsSubmitting(true);
    setTimeout(() => {
      updateAppeal(showDismissConfirm, {
        status: 'dismissed',
        responseDate: new Date().toISOString().slice(0, 10),
        response: 'Appeal dismissed by HMO.',
      });
      setIsSubmitting(false);
      setShowDismissConfirm(null);
      setShowDetail(null);
      showNotification('success', 'Appeal dismissed.');
    }, 400);
  };

  const handleApprove = (id: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      updateAppeal(id, {
        status: 'approved',
        responseDate: new Date().toISOString().slice(0, 10),
        response: 'Appeal approved — claim reinstated.',
      });
      setIsSubmitting(false);
      setShowDetail(null);
      showNotification('success', 'Appeal approved — claim reinstated.');
    }, 400);
  };

  const handleSubmit = (id: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      updateAppeal(id, { status: 'submitted', submittedDate: new Date().toISOString().slice(0, 10) });
      setIsSubmitting(false);
      setShowDetail(null);
      showNotification('success', 'Appeal submitted.');
    }, 400);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Claim Appeals"
        description="Challenge rejected and queried claims. Track appeal status and recover denied revenue."
        actions={[
          { label: "New Appeal", variant: "primary", onClick: () => { setForm({ ...emptyForm }); setFormErrors({}); setShowAddModal(true); } },
          { label: "Export CSV", onClick: () => exportAppealsCsv(appeals) },
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Appeals</p>
            <p className="text-xl font-black text-slate-900 mt-1">{appeals.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open</p>
            <p className="text-xl font-black text-amber-600 mt-1">{appeals.filter((a) => a.status !== 'approved' && a.status !== 'dismissed').length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{appeals.filter((a) => a.status === 'approved').length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claims Appealable</p>
            <p className="text-xl font-black text-rose-600 mt-1">{queriedClaims.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick-create from queried claims */}
      {queriedClaims.length > 0 && (
        <Card className="border-none shadow-sm rounded-2xl bg-rose-50/50 border border-rose-200">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">{queriedClaims.length} claim(s) need appeal</p>
                <p className="text-[10px] text-rose-600 font-medium">Click a claim to create an appeal with details pre-filled</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {queriedClaims.slice(0, 5).map((c) => (
                <Button key={c.id} onClick={() => handleQuickCreate(c.id)} variant="default" size="sm"
                  className="h-8 rounded-lg text-[10px] font-bold bg-rose-600 hover:bg-rose-700 gap-1">
                  <Scale size={12} /> {c.id}
                </Button>
              ))}
              {queriedClaims.length > 5 && (
                <span className="text-[10px] text-rose-500 font-bold self-center ml-1">+{queriedClaims.length - 5} more</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appeals..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400" />
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {appeals.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <Scale size={32} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No appeals yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">When an HMO queries or rejects a claim, create an appeal to challenge the decision.</p>
            {queriedClaims.length > 0 ? (
              <p className="text-xs text-rose-600 font-bold mb-4">{queriedClaims.length} claim(s) are ready to appeal</p>
            ) : (
              <Button onClick={() => { setForm({ ...emptyForm }); setFormErrors({}); setShowAddModal(true); }} variant="default" className="h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700">
                <Plus size={16} /> New Appeal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Search size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">No matching appeals</h3>
            <p className="text-sm text-slate-400">Try adjusting your search.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appeal ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a) => (
                  <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setShowDetail(a.id)}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{a.id}</td>
                    <td className="px-6 py-4 text-sm text-sky-600 font-bold">{a.claimId}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.hmoName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.patientName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{a.reason}</td>
                    <td className="px-6 py-4">{appealBadge(a.status)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button onClick={() => setShowDetail(a.id)} variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filtered.length} of {appeals.length} appeals</p>
          </div>
        </Card>
      )}

      {/* Add Appeal Modal */}
      <Modal isOpen={showAddModal} onClose={() => !isSubmitting && setShowAddModal(false)} title="New Appeal">
        <div className="space-y-5">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Claim Reference</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Claim ID <span className="text-rose-500">*</span></label>
                <input type="text" value={form.claimId} onChange={(e) => { setForm({ ...form, claimId: e.target.value }); clearFieldError('claimId'); }}
                  placeholder="e.g. HMC-1005" list="appeal-claim-ids"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.claimId ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                <datalist id="appeal-claim-ids">
                  {queriedClaims.map((c) => <option key={c.id} value={c.id} />)}
                </datalist>
                {formErrors.claimId && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.claimId}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO <span className="text-rose-500">*</span></label>
                <input type="text" value={form.hmoName} onChange={(e) => { setForm({ ...form, hmoName: e.target.value }); clearFieldError('hmoName'); }}
                  placeholder="e.g. Hygeia HMO"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.hmoName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.hmoName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.hmoName}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name <span className="text-rose-500">*</span></label>
              <input type="text" value={form.patientName} onChange={(e) => { setForm({ ...form, patientName: e.target.value }); clearFieldError('patientName'); }}
                placeholder="Full name"
                className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                  formErrors.patientName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
              {formErrors.patientName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.patientName}</p>}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Appeal Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Appeal Reason <span className="text-rose-500">*</span></label>
                <textarea value={form.reason} onChange={(e) => { setForm({ ...form, reason: e.target.value }); clearFieldError('reason'); }}
                  placeholder="Explain why the claim should be reconsidered..."
                  rows={3}
                  className={cn("w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 resize-none transition-all",
                    formErrors.reason ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200')} />
                {formErrors.reason && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.reason}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Supporting Notes <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span></label>
                <textarea value={form.supportingNotes} onChange={(e) => setForm({ ...form, supportingNotes: e.target.value })}
                  placeholder="Attach additional context or documentation references..."
                  rows={2} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 resize-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => setShowAddModal(false)} disabled={isSubmitting} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleAddAppeal} disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Appeal'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setShowDetail(null)} title={detail ? detail.id : ''}>
        {detail && (
          <div className="space-y-5">
            {/* Status banner */}
            <div className={cn("p-3 rounded-xl flex items-center justify-between",
              detail.status === 'approved' ? 'bg-emerald-50' :
              detail.status === 'dismissed' ? 'bg-rose-50' :
              detail.status === 'submitted' || detail.status === 'under_review' ? 'bg-amber-50' : 'bg-slate-50'
            )}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <div className="mt-1">{appealBadge(detail.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim</p>
                <p className="text-sm font-bold text-sky-600 mt-0.5">{detail.claimId}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.hmoName}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.patientName}</p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Appeal Reason</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">{detail.reason}</p>
            </div>

            {detail.supportingNotes && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Supporting Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">{detail.supportingNotes}</p>
              </div>
            )}

            {detail.response && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">HMO Response</p>
                <p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">{detail.response}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
              {detail.submittedDate && <span className="flex items-center gap-1.5"><Clock size={12} /> Submitted {detail.submittedDate}</span>}
              {detail.responseDate && <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Responded {detail.responseDate}</span>}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              {detail.status === 'draft' && (
                <Button onClick={() => handleSubmit(detail.id)}
                  disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
                </Button>
              )}
              {detail.status === 'submitted' && (
                <>
                  <Button onClick={() => handleApprove(detail.id)}
                    disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {isSubmitting ? 'Approving...' : 'Approve Appeal'}
                  </Button>
                  <Button onClick={() => setShowDismissConfirm(detail.id)}
                    disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50">
                    <X size={16} /> Dismiss
                  </Button>
                </>
              )}
              <Button onClick={() => setShowDetail(null)} variant="outline" className="h-11 rounded-xl font-bold border-slate-200 px-6">Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dismiss Confirmation Modal */}
      <Modal isOpen={!!showDismissConfirm} onClose={() => setShowDismissConfirm(null)} title="Dismiss Appeal">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900">Dismiss this appeal?</p>
              <p className="text-xs text-rose-700 mt-1">This will mark {showDismissConfirm} as dismissed. The associated claim will remain in its current state.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowDismissConfirm(null)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleDismiss} disabled={isSubmitting} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              {isSubmitting ? 'Dismissing...' : 'Dismiss Appeal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
