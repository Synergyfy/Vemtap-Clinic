"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useHmoClaims, useHmoAppeals, useCreateAppeal, useUpdateAppeal } from "@/hooks/useHmo";
import type { HmoAppeal, AppealStatus } from "@/services/hmo.service";
import {
  Search, Plus, ShieldAlert, CheckCircle2,
  AlertCircle, Send, Clock, X, FileText,
  Loader2, AlertTriangle, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatNGN(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`;
}

function appealBadge(status: string) {
  const map: Record<string, string> = {
    submitted: "bg-amber-50 text-amber-700",
    under_review: "bg-sky-50 text-sky-700",
    upheld: "bg-rose-50 text-rose-700",
    overturned: "bg-emerald-50 text-emerald-700",
    closed: "bg-slate-100 text-slate-600",
  };
  return <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", map[status] || "bg-slate-100 text-slate-600")}>{status?.replace(/_/g, " ")}</Badge>;
}

const emptyForm = { claimId: "", appealNumber: "", reason: "", disputedAmount: 0, supportingDocuments: "" };

export default function AppealsPage() {
  const { user } = useAuth();
  const { data: appeals = [], isLoading: loadingAppeals } = useHmoAppeals();
  const { data: claims = [] } = useHmoClaims();
  const createAppealMut = useCreateAppeal();
  const updateAppealMut = useUpdateAppeal();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showDismissConfirm, setShowDismissConfirm] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filtered = appeals.filter((a) => {
    const claimNum = a.claim?.claimNumber || a.claimId;
    const hmoName = a.claim?.hmo?.name || "";
    const patName = a.claim?.patient ? `${a.claim.patient.firstName} ${a.claim.patient.lastName}` : "";
    return (
      !search ||
      a.appealNumber.toLowerCase().includes(search.toLowerCase()) ||
      claimNum.toLowerCase().includes(search.toLowerCase()) ||
      hmoName.toLowerCase().includes(search.toLowerCase()) ||
      patName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const detail = showDetail ? appeals.find((a) => a.id === showDetail) : null;
  const queriedClaims = claims.filter((c) => c.status === "denied" || c.status === "appealed");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.claimId.trim()) errors.claimId = "Claim selection is required";
    if (!form.appealNumber.trim()) errors.appealNumber = "Appeal number is required";
    if (!form.reason.trim()) errors.reason = "Appeal reason is required";
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
    createAppealMut.mutate({
      appealNumber: form.appealNumber,
      claimId: form.claimId,
      reason: form.reason,
      disputedAmount: Number(form.disputedAmount) || undefined,
      supportingDocuments: form.supportingDocuments || undefined,
    }, {
      onSuccess: () => {
        setForm({ ...emptyForm });
        setFormErrors({});
        setShowAddModal(false);
        showNotification("success", `Appeal ${form.appealNumber} created successfully`);
      },
      onError: () => showNotification("error", "Failed to submit appeal"),
    });
  };

  const handleQuickCreate = (claimId: string) => {
    const c = claims.find((cl) => cl.id === claimId);
    if (!c) return;
    const autoNumber = `APL-${Date.now().toString().slice(-4)}`;
    setForm({
      claimId: c.id,
      appealNumber: autoNumber,
      reason: `Appeal for claim ${c.claimNumber} \u2014 ${c.diagnosis || "service dispute"}`,
      disputedAmount: c.amountClaimed - c.amountApproved,
      supportingDocuments: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleUpdateStatus = (id: string, status: AppealStatus, notes?: string) => {
    updateAppealMut.mutate({
      id,
      dto: { status, resolutionNotes: notes || resolutionInput || undefined },
    }, {
      onSuccess: () => {
        setShowDetail(null);
        setShowDismissConfirm(null);
        setResolutionInput("");
        showNotification("success", `Appeal status updated to ${status.replace(/_/g, " ")}`);
      },
      onError: () => showNotification("error", "Failed to update appeal status"),
    });
  };


  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Claim Appeals"
        description="Challenge denied and queried claims. Track appeal status and recover denied revenue."
        actions={[
          { label: "New Appeal", variant: "default", onClick: () => { setForm({ ...emptyForm }); setFormErrors({}); setShowAddModal(true); } },
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
            <p className="text-xl font-black text-amber-600 mt-1">{appeals.filter((a) => a.status === "submitted" || a.status === "under_review").length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overturned (Won)</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{appeals.filter((a) => a.status === "overturned").length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claims Appealable</p>
            <p className="text-xl font-black text-rose-600 mt-1">{queriedClaims.length}</p>
          </CardContent>
        </Card>
      </div>

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
                  <Scale size={12} /> {c.claimNumber}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appeal #</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim #</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Disputed</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a) => (
                  <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setShowDetail(a.id)}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{a.appealNumber}</td>
                    <td className="px-6 py-4 text-sm text-sky-600 font-bold">{a.claim?.claimNumber || a.claimId}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.claim?.hmo?.name || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {a.claim?.patient ? `${a.claim.patient.firstName} ${a.claim.patient.lastName}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 tabular-nums">
                      {a.disputedAmount ? formatNGN(Number(a.disputedAmount)) : "—"}
                    </td>
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
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Appeal">
        <div className="space-y-5">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Claim Selection</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Disputed Claim <span className="text-rose-500">*</span></label>
                <select
                  value={form.claimId}
                  onChange={(e) => {
                    const selected = claims.find((c) => c.id === e.target.value);
                    setForm({
                      ...form,
                      claimId: e.target.value,
                      disputedAmount: selected ? selected.amountClaimed - selected.amountApproved : 0,
                    });
                    clearFieldError("claimId");
                  }}
                  className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all",
                    formErrors.claimId ? "border-rose-300 bg-rose-50/50" : "border-slate-200")}
                >
                  <option value="">-- Choose a claim --</option>
                  {claims.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.claimNumber} • {c.hmo?.name || "HMO"} • {c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : "Patient"} • ({c.status})
                    </option>
                  ))}
                </select>
                {formErrors.claimId && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.claimId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Appeal # <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.appealNumber} onChange={(e) => { setForm({ ...form, appealNumber: e.target.value }); clearFieldError("appealNumber"); }}
                    placeholder="e.g. APL-2026-001"
                    className={cn("w-full h-10 px-3 rounded-xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 transition-all",
                      formErrors.appealNumber ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                  {formErrors.appealNumber && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.appealNumber}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Disputed Amount (NGN)</label>
                  <input type="number" value={form.disputedAmount || ""} onChange={(e) => setForm({ ...form, disputedAmount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">Appeal Justification</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Appeal Reason <span className="text-rose-500">*</span></label>
                <textarea value={form.reason} onChange={(e) => { setForm({ ...form, reason: e.target.value }); clearFieldError("reason"); }}
                  placeholder="Explain why the claim deduction/denial was incorrect..."
                  rows={3}
                  className={cn("w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300 resize-none transition-all",
                    formErrors.reason ? "border-rose-300 bg-rose-50/50" : "border-slate-200")} />
                {formErrors.reason && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.reason}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Supporting Documents URL / Notes</label>
                <input type="text" value={form.supportingDocuments} onChange={(e) => setForm({ ...form, supportingDocuments: e.target.value })}
                  placeholder="e.g. /uploads/documents/appeal-justification.pdf"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleAddAppeal} disabled={createAppealMut.isPending} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {createAppealMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              Submit Appeal to API
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setShowDetail(null)} title={detail ? `Appeal ${detail.appealNumber}` : ""}>
        {detail && (
          <div className="space-y-5">
            <div className={cn("p-4 rounded-xl flex items-center justify-between",
              detail.status === "overturned" ? "bg-emerald-50" :
              detail.status === "upheld" ? "bg-rose-50" :
              detail.status === "submitted" || detail.status === "under_review" ? "bg-amber-50" : "bg-slate-50"
            )}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <div className="mt-1">{appealBadge(detail.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disputed Amount</p>
                <p className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                  {detail.disputedAmount ? formatNGN(Number(detail.disputedAmount)) : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Associated Claim</p>
                <p className="text-sm font-bold text-sky-600 mt-0.5">{detail.claim?.claimNumber || detail.claimId}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO Partner</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.claim?.hmo?.name || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Appeal Reason</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">{detail.reason}</p>
            </div>

            {detail.supportingDocuments && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Supporting Documents</p>
                <p className="text-sm text-sky-600 bg-slate-50 p-3 rounded-xl truncate font-medium">{detail.supportingDocuments}</p>
              </div>
            )}

            {detail.resolutionNotes && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Resolution Notes</p>
                <p className="text-sm text-slate-800 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">{detail.resolutionNotes}</p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Update Resolution Notes</label>
              <input
                type="text"
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                placeholder="Enter notes on HMO decision or appeal outcome..."
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                onClick={() => handleUpdateStatus(detail.id, "under_review")}
                variant="outline"
                disabled={updateAppealMut.isPending}
                className="flex-1 h-10 rounded-xl font-bold text-xs"
              >
                Mark Under Review
              </Button>
              <Button
                onClick={() => handleUpdateStatus(detail.id, "overturned")}
                variant="default"
                disabled={updateAppealMut.isPending}
                className="flex-1 h-10 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 size={14} className="mr-1" /> Overturn (Approve)
              </Button>
              <Button
                onClick={() => handleUpdateStatus(detail.id, "upheld")}
                variant="default"
                disabled={updateAppealMut.isPending}
                className="flex-1 h-10 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700"
              >
                <X size={14} className="mr-1" /> Uphold (Reject)
              </Button>
              <Button onClick={() => setShowDetail(null)} variant="outline" className="h-10 rounded-xl font-bold text-xs border-slate-200 px-4">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

