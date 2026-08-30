"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useHmoClaims, useCreateClaim, useUpdateClaim } from "@/hooks/useHmo";
import type { HmoClaim, CreateClaimData } from "@/services/hmo.service";
import {
  Search, Plus, CheckCircle2, AlertCircle, Clock, X,
  Eye, Send, FileText, Trash2, Loader2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatNGN(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`;
}

function getDaysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const claimStatuses = ["all", "submitted", "under_review", "approved", "partially_approved", "denied", "appealed", "settled"] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    submitted: "bg-amber-50 text-amber-700",
    under_review: "bg-sky-50 text-sky-700",
    approved: "bg-emerald-50 text-emerald-700",
    partially_approved: "bg-emerald-50 text-emerald-700",
    denied: "bg-rose-50 text-rose-700",
    appealed: "bg-orange-50 text-orange-700",
    settled: "bg-emerald-50 text-emerald-700",
  };
  return <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", map[status] || "bg-slate-100 text-slate-600")}>{status.replace(/_/g, " ")}</Badge>;
}

export default function ClaimsPage() {
  const { user } = useAuth();
  const { data: claims = [], isLoading } = useHmoClaims();
  const createClaimMut = useCreateClaim();
  const updateClaimMut = useUpdateClaim();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClaimDetail, setShowClaimDetail] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    claimNumber: "",
    amountClaimed: 0,
    diagnosis: "",
    treatmentDetails: "",
    notes: "",
    hmoId: "",
    patientId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paidAmountInput, setPaidAmountInput] = useState("");

  const filtered = useMemo(() =>
    claims.filter((c) => {
      const mSearch = !search || c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        (c.patient?.firstName + " " + c.patient?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        (c.hmo?.name || "").toLowerCase().includes(search.toLowerCase());
      const mStatus = statusFilter === "all" || c.status === statusFilter;
      return mSearch && mStatus;
    }), [claims, search, statusFilter]);

  const claimDetail = showClaimDetail ? claims.find((c) => c.id === showClaimDetail) : null;

  const selectedTotal = useMemo(() =>
    claims.filter((c) => selectedIds.has(c.id)).reduce((s, c) => s + c.amountClaimed, 0),
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.claimNumber.trim()) errors.claimNumber = "Claim number is required";
    if (form.amountClaimed <= 0) errors.amountClaimed = "Amount must be > 0";
    if (!form.hmoId.trim()) errors.hmoId = "HMO ID is required";
    if (!form.patientId.trim()) errors.patientId = "Patient ID is required";
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

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddClaim = () => {
    if (!validateForm()) return;
    createClaimMut.mutate(form, {
      onSuccess: () => {
        setForm({ claimNumber: "", amountClaimed: 0, diagnosis: "", treatmentDetails: "", notes: "", hmoId: "", patientId: "" });
        setFormErrors({});
        setShowAddModal(false);
        showNotification("success", `Claim created successfully`);
      },
      onError: () => showNotification("error", "Failed to create claim"),
    });
  };

  const handleBulkSubmit = () => {
    const ids = Array.from(selectedIds);
    let completed = 0;
    ids.forEach((id) => {
      updateClaimMut.mutate({ id, dto: { status: "submitted" } }, {
        onSuccess: () => {
          completed++;
          if (completed === ids.length) {
            setSelectedIds(new Set());
            setShowBulkConfirm(false);
            showNotification("success", `${ids.length} claims submitted successfully.`);
          }
        },
      });
    });
  };

  const handleStatusAction = (id: string, status: HmoClaim["status"], extras?: { amountApproved?: number }) => {
    updateClaimMut.mutate({ id, dto: { status, ...extras } }, {
      onSuccess: () => {
        setShowClaimDetail(null);
        showNotification("success", `Claim updated.`);
      },
      onError: () => showNotification("error", "Failed to update claim"),
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Claims Management"
        description="Create, submit, and track HMO claims. Bulk operations and status tracking."
        actions={[
          { label: "New Claim", variant: "primary", onClick: () => { setForm({ claimNumber: "", amountClaimed: 0, diagnosis: "", treatmentDetails: "", notes: "", hmoId: "", patientId: "" }); setFormErrors({}); setShowAddModal(true); } },
        ]}
      />

      {notification && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all duration-300",
          notification.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        )}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}

      {(createClaimMut.isPending || updateClaimMut.isPending) && (
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
              placeholder="Search by claim number, patient, or HMO..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              {claimStatuses.map((s) => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
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
      {isLoading ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 size={32} className="text-sky-600 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-400">Loading claims...</p>
          </CardContent>
        </Card>
      ) : claims.length === 0 ? (
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
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim #</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const days = c.submittedDate ? getDaysSince(String(c.submittedDate)) : 0;
                  return (
                    <tr key={c.id} className={cn("group hover:bg-slate-50/50 transition-colors cursor-pointer", selectedIds.has(c.id) && "bg-sky-50/50")} onClick={() => setShowClaimDetail(c.id)}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">{c.claimNumber}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{c.hmo?.name || c.hmoId}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId}</td>
                      <td className="px-4 py-4 text-sm font-black text-slate-900">{formatNGN(c.amountClaimed)}</td>
                      <td className="px-4 py-4">{statusBadge(c.status)}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{c.submittedDate ? `${days}d` : "-"}</td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button onClick={() => setShowClaimDetail(c.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                          <Eye size={15} />
                        </Button>
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
      <Modal isOpen={showAddModal} onClose={() => !createClaimMut.isPending && setShowAddModal(false)} title="New HMO Claim">
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Claim Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Claim Number <span className="text-rose-500">*</span></label>
                <input type="text" value={form.claimNumber} onChange={(e) => { setForm({ ...form, claimNumber: e.target.value }); clearFieldError("claimNumber"); }}
                  placeholder="e.g. CLM-001"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.claimNumber ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                {formErrors.claimNumber && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.claimNumber}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (&#x20A6;) <span className="text-rose-500">*</span></label>
                <input type="number" min={0} value={form.amountClaimed || ""} onChange={(e) => { setForm({ ...form, amountClaimed: Math.max(0, Number(e.target.value)) }); clearFieldError("amountClaimed"); }}
                  placeholder="0"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.amountClaimed ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                {formErrors.amountClaimed && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.amountClaimed}</p>}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">HMO & Patient</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">HMO ID <span className="text-rose-500">*</span></label>
                <input type="text" value={form.hmoId} onChange={(e) => { setForm({ ...form, hmoId: e.target.value }); clearFieldError("hmoId"); }}
                  placeholder="HMO UUID"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.hmoId ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                {formErrors.hmoId && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.hmoId}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient ID <span className="text-rose-500">*</span></label>
                <input type="text" value={form.patientId} onChange={(e) => { setForm({ ...form, patientId: e.target.value }); clearFieldError("patientId"); }}
                  placeholder="Patient UUID"
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                    formErrors.patientId ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                {formErrors.patientId && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.patientId}</p>}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Clinical Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Diagnosis</label>
                <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Primary diagnosis"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Treatment Details</label>
                <input type="text" value={form.treatmentDetails} onChange={(e) => setForm({ ...form, treatmentDetails: e.target.value })}
                  placeholder="Treatment provided"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Total Claim Amount</span>
            <span className="text-lg font-black text-sky-600">{formatNGN(form.amountClaimed)}</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => setShowAddModal(false)} disabled={createClaimMut.isPending} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleAddClaim} disabled={createClaimMut.isPending} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {createClaimMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {createClaimMut.isPending ? "Creating..." : "Create Claim"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Claim Detail Modal */}
      <Modal isOpen={!!claimDetail} onClose={() => setShowClaimDetail(null)} title={claimDetail ? claimDetail.claimNumber : ""}>
        {claimDetail && (
          <div className="space-y-5">
            <div className={cn("p-3 rounded-xl flex items-center justify-between",
              claimDetail.status === "settled" ? "bg-emerald-50" :
              claimDetail.status === "approved" ? "bg-sky-50" :
              claimDetail.status === "submitted" || claimDetail.status === "under_review" ? "bg-amber-50" :
              claimDetail.status === "denied" || claimDetail.status === "appealed" ? "bg-rose-50" : "bg-slate-50"
            )}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <div className="mt-1">{statusBadge(claimDetail.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{formatNGN(claimDetail.amountClaimed)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.hmo?.name || claimDetail.hmoId}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.patient ? `${claimDetail.patient.firstName} ${claimDetail.patient.lastName}` : claimDetail.patientId}</p>
              </div>
              {claimDetail.diagnosis && (
                <div className="p-3 rounded-xl bg-slate-50 col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{claimDetail.diagnosis}</p>
                </div>
              )}
            </div>

            {claimDetail.amountApproved > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Amount Approved</span>
                <span className="text-base font-black text-emerald-700">{formatNGN(claimDetail.amountApproved)}</span>
              </div>
            )}

            {claimDetail.submittedDate && (
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1.5"><Clock size={12} /> Submitted {String(claimDetail.submittedDate)} ({getDaysSince(String(claimDetail.submittedDate))} days ago)</span>
                {claimDetail.reviewedDate && <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Reviewed {String(claimDetail.reviewedDate)}</span>}
                {claimDetail.settledDate && <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Settled {String(claimDetail.settledDate)}</span>}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {claimDetail.status === "submitted" && (
                <Button onClick={() => handleStatusAction(claimDetail.id, "approved")}
                  disabled={updateClaimMut.isPending} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                  {updateClaimMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve
                </Button>
              )}
              {claimDetail.status === "approved" && (
                <div className="flex gap-2 w-full">
                  <input type="number" min={0} value={paidAmountInput} onChange={(e) => setPaidAmountInput(e.target.value)}
                    placeholder="Paid amount"
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
                  <Button onClick={() => {
                    const amt = Number(paidAmountInput) || 0;
                    handleStatusAction(claimDetail.id, "settled", { amountApproved: amt });
                    setPaidAmountInput("");
                  }} disabled={updateClaimMut.isPending} variant="default" className="h-11 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    Settle
                  </Button>
                </div>
              )}
              {claimDetail.status !== "submitted" && claimDetail.status !== "approved" && <div className="flex-1" />}
              <Button onClick={() => setShowClaimDetail(null)} variant="outline" className="h-11 rounded-xl font-bold border-slate-200 px-6">Close</Button>
            </div>
          </div>
        )}
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
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowBulkConfirm(false)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleBulkSubmit} disabled={updateClaimMut.isPending} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {updateClaimMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {updateClaimMut.isPending ? "Submitting..." : `Submit ${selectedIds.size} Claims`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
