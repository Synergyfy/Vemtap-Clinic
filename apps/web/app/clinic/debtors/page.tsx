"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";
import { useStaff } from "@/hooks/useStaff";
import { useHmoList } from "@/hooks/useHmo";
import {
  useDebtors,
  useDebtorStats,
  useAgingReport,
  useCreateDebtor,
  useUpdateDebtor,
  useDeleteDebtor,
  useRecalculateDebtors,
  usePaymentPlans,
  useCreatePaymentPlan,
  useUpdatePaymentPlan,
  useCollectionActivities,
  useCreateCollectionActivity,
  type Debtor,
  type PaymentPlan,
  type CollectionActivity,
  type DebtorType,
  type DebtorStatus,
  type PaymentPlanStatus,
  type CollectionActivityType,
  type CollectionOutcome,
} from "@/hooks/useDebtors";
import {
  Receipt, Plus, Search, Filter, Phone, Mail, MessageSquare,
  AlertCircle, CheckCircle2, Clock, RefreshCw, Calendar,
  ShieldCheck, ArrowUpRight, DollarSign, User, Building2,
  Trash2, Edit3, Eye, FileText, Ban, Layers, TrendingUp
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const DEBTOR_STATUS_MAP: Record<DebtorStatus, { label: string; bg: string; text: string; border: string }> = {
  active: { label: "Active Debt", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  on_plan: { label: "On Payment Plan", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  in_collection: { label: "In Collection", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  settled: { label: "Fully Settled", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  write_off: { label: "Written Off", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

const PLAN_STATUS_MAP: Record<PaymentPlanStatus, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700" },
  defaulted: { label: "Defaulted", bg: "bg-rose-50", text: "text-rose-700" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-500" },
};

const ACTIVITY_TYPE_ICONS: Record<CollectionActivityType, React.ElementType> = {
  phone_call: Phone,
  email: Mail,
  sms: MessageSquare,
  letter: FileText,
  in_person: User,
  payment_received: CheckCircle2,
  promise_to_pay: Clock,
  dispute: AlertCircle,
  legal_action: ShieldCheck,
  write_off: Ban,
};

type ActiveTab = "debtors" | "aging" | "plans" | "activities";

export default function DebtorsPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  const [activeTab, setActiveTab] = useState<ActiveTab>("debtors");

  // Queries
  const { data: debtors = [], isLoading: loadingDebtors } = useDebtors();
  const { data: stats, isLoading: loadingStats } = useDebtorStats();
  const { data: agingData = [], isLoading: loadingAging } = useAgingReport();
  const { data: paymentPlans = [], isLoading: loadingPlans } = usePaymentPlans();
  const { data: activities = [], isLoading: loadingActivities } = useCollectionActivities();

  // Reference Queries for selectors
  const { data: patientsData } = usePatients({ clinicId, limit: 100 });
  const patientsList = Array.isArray(patientsData?.data) ? patientsData.data : Array.isArray(patientsData) ? patientsData : [];
  const { data: staffData } = useStaff({ clinicId, limit: 100 });
  const staffList = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];
  const { data: hmoList = [] } = useHmoList();

  // Mutations
  const createDebtorMut = useCreateDebtor();
  const updateDebtorMut = useUpdateDebtor();
  const deleteDebtorMut = useDeleteDebtor();
  const recalculateMut = useRecalculateDebtors();
  const createPlanMut = useCreatePaymentPlan();
  const updatePlanMut = useUpdatePaymentPlan();
  const createActivityMut = useCreateCollectionActivity();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [showCreateDebtorModal, setShowCreateDebtorModal] = useState(false);
  const [debtorForm, setDebtorForm] = useState<{
    type: DebtorType;
    patientId: string;
    hmoId: string;
    totalOutstanding: number;
    assignedCollectorId: string;
    notes: string;
    nextFollowUpDate: string;
  }>({
    type: "patient",
    patientId: "",
    hmoId: "",
    totalOutstanding: 0,
    assignedCollectorId: "",
    notes: "",
    nextFollowUpDate: "",
  });

  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [showUpdateDebtorModal, setShowUpdateDebtorModal] = useState(false);
  const [updateDebtorForm, setUpdateDebtorForm] = useState<{
    status: DebtorStatus;
    assignedCollectorId: string;
    notes: string;
    nextFollowUpDate: string;
  }>({
    status: "active",
    assignedCollectorId: "",
    notes: "",
    nextFollowUpDate: "",
  });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<{
    debtorId: string;
    totalAmount: number;
    totalInstallments: number;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    debtorId: "",
    totalAmount: 0,
    totalInstallments: 3,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState<{
    debtorId: string;
    activityType: CollectionActivityType;
    outcome: CollectionOutcome;
    description: string;
    amountPromised: number;
    promiseDate: string;
    nextActionDate: string;
    nextActionNotes: string;
  }>({
    debtorId: "",
    activityType: "phone_call",
    outcome: "successful",
    description: "",
    amountPromised: 0,
    promiseDate: "",
    nextActionDate: "",
    nextActionNotes: "",
  });

  // Filtered Debtors
  const filteredDebtors = useMemo(() => {
    return debtors.filter((d) => {
      const matchType = typeFilter === "all" || d.type === typeFilter;
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.debtorNumber.toLowerCase().includes(q) ||
        (d.patient && `${d.patient.firstName} ${d.patient.lastName}`.toLowerCase().includes(q)) ||
        (d.hmo && d.hmo.name.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q));
      return matchType && matchStatus && matchSearch;
    });
  }, [debtors, typeFilter, statusFilter, searchQuery]);

  // Handlers
  const handleRecalculate = async () => {
    try {
      const res = await recalculateMut.mutateAsync();
      alert(`Recalculation complete. Updated ${res?.updated ?? 0} debtor balances from invoices.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Recalculation failed");
    }
  };

  const handleOpenCreateDebtor = () => {
    setDebtorForm({
      type: "patient",
      patientId: patientsList[0]?.id || "",
      hmoId: hmoList[0]?.id || "",
      totalOutstanding: 10000,
      assignedCollectorId: staffList[0]?.id || "",
      notes: "",
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setShowCreateDebtorModal(true);
  };

  const handleCreateDebtorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (debtorForm.type === "patient" && !debtorForm.patientId) {
      alert("Please select a patient");
      return;
    }
    if (debtorForm.type === "hmo" && !debtorForm.hmoId) {
      alert("Please select an HMO");
      return;
    }
    try {
      await createDebtorMut.mutateAsync({
        type: debtorForm.type,
        patientId: debtorForm.type === "patient" ? debtorForm.patientId : undefined,
        hmoId: debtorForm.type === "hmo" ? debtorForm.hmoId : undefined,
        totalOutstanding: Number(debtorForm.totalOutstanding) || 0,
        assignedCollectorId: debtorForm.assignedCollectorId || undefined,
        notes: debtorForm.notes.trim() || undefined,
        nextFollowUpDate: debtorForm.nextFollowUpDate || undefined,
      });
      setShowCreateDebtorModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create debtor record");
    }
  };

  const handleOpenUpdateDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setUpdateDebtorForm({
      status: debtor.status,
      assignedCollectorId: debtor.assignedCollectorId || "",
      notes: debtor.notes || "",
      nextFollowUpDate: debtor.nextFollowUpDate ? debtor.nextFollowUpDate.slice(0, 10) : "",
    });
    setShowUpdateDebtorModal(true);
  };

  const handleUpdateDebtorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    try {
      await updateDebtorMut.mutateAsync({
        id: selectedDebtor.id,
        dto: {
          status: updateDebtorForm.status,
          assignedCollectorId: updateDebtorForm.assignedCollectorId || undefined,
          notes: updateDebtorForm.notes.trim() || undefined,
          nextFollowUpDate: updateDebtorForm.nextFollowUpDate || undefined,
        },
      });
      setShowUpdateDebtorModal(false);
      setSelectedDebtor(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update debtor");
    }
  };

  const handleDeleteDebtor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this debtor record? (Allowed only if balance is settled)")) return;
    try {
      await deleteDebtorMut.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete debtor");
    }
  };

  const handleOpenPlanModal = (debtor?: Debtor) => {
    const target = debtor || debtors[0];
    setPlanForm({
      debtorId: target?.id || "",
      totalAmount: target?.currentBalance || 10000,
      totalInstallments: 3,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: "",
    });
    setShowPlanModal(true);
  };

  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.debtorId) {
      alert("Please select a debtor");
      return;
    }
    try {
      await createPlanMut.mutateAsync({
        debtorId: planForm.debtorId,
        totalAmount: Number(planForm.totalAmount),
        totalInstallments: Number(planForm.totalInstallments),
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        notes: planForm.notes.trim() || undefined,
      });
      setShowPlanModal(false);
      setActiveTab("plans");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create payment plan");
    }
  };

  const handleOpenActivityModal = (debtor?: Debtor) => {
    const target = debtor || debtors[0];
    setActivityForm({
      debtorId: target?.id || "",
      activityType: "phone_call",
      outcome: "successful",
      description: "",
      amountPromised: 0,
      promiseDate: "",
      nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      nextActionNotes: "",
    });
    setShowActivityModal(true);
  };

  const handleCreateActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.debtorId) {
      alert("Please select a debtor");
      return;
    }
    try {
      await createActivityMut.mutateAsync({
        debtorId: activityForm.debtorId,
        activityType: activityForm.activityType,
        outcome: activityForm.outcome,
        description: activityForm.description.trim() || undefined,
        amountPromised: activityForm.amountPromised ? Number(activityForm.amountPromised) : undefined,
        promiseDate: activityForm.promiseDate || undefined,
        nextActionDate: activityForm.nextActionDate || undefined,
        nextActionNotes: activityForm.nextActionNotes.trim() || undefined,
      });
      setShowActivityModal(false);
      setActiveTab("activities");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to log collection activity");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
              <Receipt size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Debtors & Receivables
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Credit management, aging debt schedules, installment payment plans, and collection activities
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculateMut.isPending}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} className={recalculateMut.isPending ? "animate-spin" : ""} />
            Sync Balances
          </button>
          <button
            onClick={handleOpenCreateDebtor}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> New Debtor Record
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Outstanding",
            value: formatNGN(stats?.totalOutstanding ?? 0),
            sub: `${stats?.totalDebtors ?? debtors.length} debtors logged`,
            icon: DollarSign,
            bg: "bg-rose-50",
            color: "text-rose-600",
          },
          {
            label: "Current (<30 Days)",
            value: formatNGN(stats?.aging?.current ?? 0),
            sub: "fresh credit balances",
            icon: Clock,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
          {
            label: "Overdue 60+ Days",
            value: formatNGN((stats?.aging?.overdue60 ?? 0) + (stats?.aging?.overdue90 ?? 0) + (stats?.aging?.overdue120Plus ?? 0)),
            sub: "critical collection bucket",
            icon: AlertCircle,
            bg: "bg-amber-50",
            color: "text-amber-600",
          },
          {
            label: "Active Payment Plans",
            value: stats?.paymentPlans?.active ?? paymentPlans.filter((p) => p.status === "active").length,
            sub: `${stats?.paymentPlans?.completed ?? 0} completed plans`,
            icon: ShieldCheck,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
              <item.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">{item.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        {[
          { id: "debtors", label: "Debtors Registry", count: debtors.length, icon: Receipt },
          { id: "aging", label: "Aging Analysis", icon: TrendingUp },
          { id: "plans", label: "Payment Plans", count: paymentPlans.length, icon: Layers },
          { id: "activities", label: "Collection Log", count: activities.length, icon: Phone },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ActiveTab);
              setSearchQuery("");
            }}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "border-rose-600 text-rose-600 bg-rose-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Debtors Registry */}
      {activeTab === "debtors" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by debtor #, patient name, HMO, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="patient">Patients</option>
                <option value="hmo">HMO Providers</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Debt</option>
                <option value="on_plan">On Plan</option>
                <option value="in_collection">In Collection</option>
                <option value="settled">Settled</option>
                <option value="write_off">Written Off</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loadingDebtors ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-rose-600 mx-auto mb-2" size={28} />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading debtors registry...</p>
              </div>
            ) : filteredDebtors.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Receipt size={26} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No debtors found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click &quot;Sync Balances&quot; to recalculate outstanding debt from unpaid patient and HMO invoices, or add a debtor manually.
                </p>
                <button
                  onClick={handleOpenCreateDebtor}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Plus size={14} /> New Debtor Record
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Debtor #</th>
                      <th className="py-3 px-4">Entity / Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Current Balance</th>
                      <th className="py-3 px-4">Aging Overdue</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Next Follow-Up</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDebtors.map((debtor) => {
                      const statusMeta = DEBTOR_STATUS_MAP[debtor.status] || DEBTOR_STATUS_MAP.active;
                      const debtorName =
                        debtor.type === "patient" && debtor.patient
                          ? `${debtor.patient.firstName} ${debtor.patient.lastName}`
                          : debtor.type === "hmo" && debtor.hmo
                          ? debtor.hmo.name
                          : "Unknown Entity";

                      return (
                        <tr key={debtor.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {debtor.debtorNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              {debtor.type === "patient" ? (
                                <User size={14} className="text-blue-500" />
                              ) : (
                                <Building2 size={14} className="text-purple-500" />
                              )}
                              <span>{debtorName}</span>
                            </div>
                            {debtor.notes && (
                              <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">{debtor.notes}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                              debtor.type === "patient" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                            )}>
                              {debtor.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-rose-600 tabular-nums">
                            {formatNGN(debtor.currentBalance || debtor.totalOutstanding)}
                          </td>
                          <td className="py-3.5 px-4 text-[11px] tabular-nums">
                            {debtor.overdue60 > 0 || debtor.overdue90 > 0 || debtor.overdue120Plus > 0 ? (
                              <span className="text-amber-700 font-bold">
                                {formatNGN(debtor.overdue60 + debtor.overdue90 + debtor.overdue120Plus)} (60d+)
                              </span>
                            ) : debtor.overdue30 > 0 ? (
                              <span className="text-blue-700 font-semibold">{formatNGN(debtor.overdue30)} (30d)</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">Current</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                              statusMeta.bg,
                              statusMeta.text,
                              statusMeta.border
                            )}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {debtor.nextFollowUpDate ? (
                              <span className="font-medium text-slate-800 flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {new Date(debtor.nextFollowUpDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleOpenActivityModal(debtor)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                              title="Log Collection Activity"
                            >
                              <Phone size={11} /> Call / Log
                            </button>
                            <button
                              onClick={() => handleOpenPlanModal(debtor)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
                              title="Setup Payment Plan"
                            >
                              Plan
                            </button>
                            <button
                              onClick={() => handleOpenUpdateDebtor(debtor)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <Edit3 size={14} />
                            </button>
                            {debtor.currentBalance <= 0 && (
                              <button
                                onClick={() => handleDeleteDebtor(debtor.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Settled Debtor"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Aging Analysis */}
      {activeTab === "aging" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Aging Schedule Analysis</h3>
            <p className="text-xs text-slate-500 mb-6">Receivables categorized by overdue duration</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Current (0-30d)", amount: stats?.aging?.current || 0, color: "bg-blue-50 text-blue-700 border-blue-200" },
                { label: "31-60 Days", amount: stats?.aging?.overdue30 || 0, color: "bg-sky-50 text-sky-700 border-sky-200" },
                { label: "61-90 Days", amount: stats?.aging?.overdue60 || 0, color: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "91-120 Days", amount: stats?.aging?.overdue90 || 0, color: "bg-orange-50 text-orange-700 border-orange-200" },
                { label: "120+ Days", amount: stats?.aging?.overdue120Plus || 0, color: "bg-rose-50 text-rose-700 border-rose-200" },
              ].map((bucket, i) => (
                <div key={i} className={cn("p-4 rounded-xl border", bucket.color)}>
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-75">{bucket.label}</p>
                  <p className="text-lg font-black mt-1 tabular-nums">{formatNGN(bucket.amount)}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] font-black border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Debtor #</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Current</th>
                    <th className="py-2.5 px-3 text-right">30d</th>
                    <th className="py-2.5 px-3 text-right">60d</th>
                    <th className="py-2.5 px-3 text-right">90d</th>
                    <th className="py-2.5 px-3 text-right">120d+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {agingData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold">{item.debtorNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 tabular-nums">{formatNGN(item.totalOutstanding)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatNGN(item.current)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatNGN(item.overdue30)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-amber-700">{formatNGN(item.overdue60)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-orange-700">{formatNGN(item.overdue90)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-rose-700 font-bold">{formatNGN(item.overdue120Plus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Plans */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Installment Payment Plans</h3>
            <button
              onClick={() => handleOpenPlanModal()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentPlans.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No active payment plans found. Setup a structured payment agreement for an active debtor.
              </div>
            ) : (
              paymentPlans.map((plan) => {
                const statusMeta = PLAN_STATUS_MAP[plan.status] || PLAN_STATUS_MAP.active;
                const progressPct = plan.totalAmount > 0 ? Math.round((plan.amountPaid / plan.totalAmount) * 100) : 0;

                return (
                  <div key={plan.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {plan.planNumber}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider", statusMeta.bg, statusMeta.text)}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mt-1">
                        {plan.debtor?.debtorNumber} &middot; {plan.debtor?.type?.toUpperCase()}
                      </h4>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Agreed:</span>
                          <span className="font-bold text-slate-900 tabular-nums">{formatNGN(plan.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Paid So Far:</span>
                          <span className="font-bold text-emerald-600 tabular-nums">{formatNGN(plan.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Remaining Balance:</span>
                          <span className="font-bold text-rose-600 tabular-nums">{formatNGN(plan.amountRemaining)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Installments:</span>
                          <span className="font-bold text-slate-700">{plan.installmentsPaid} of {plan.totalInstallments} paid</span>
                        </div>

                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                          <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Timeline: {plan.startDate} → {plan.endDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Collection Log */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Collection Activities & Contact History</h3>
            <button
              onClick={() => handleOpenActivityModal()}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> Log Contact / Promise
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No collection activities logged. Record phone calls, reminder letters, or promise-to-pay commitments.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activities.map((act) => {
                  const Icon = ACTIVITY_TYPE_ICONS[act.activityType] || Phone;
                  return (
                    <div key={act.id} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 capitalize">{act.activityType.replace(/_/g, " ")}</span>
                            {act.outcome && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {act.outcome}
                              </span>
                            )}
                            <span className="text-slate-400">&middot; Debtor {act.debtor?.debtorNumber}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>

                        {act.description && <p className="text-slate-600 mt-1">{act.description}</p>}

                        {(act.amountPromised || act.promiseDate) && (
                          <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-emerald-800 font-semibold inline-flex items-center gap-3">
                            <span>Promised: {formatNGN(act.amountPromised || 0)}</span>
                            {act.promiseDate && <span>Promise Date: {act.promiseDate}</span>}
                          </div>
                        )}

                        {act.nextActionDate && (
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            <strong>Next Action:</strong> {act.nextActionDate} — {act.nextActionNotes || "Follow-up contact"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Debtor */}
      <Modal
        isOpen={showCreateDebtorModal}
        onClose={() => setShowCreateDebtorModal(false)}
        title="Add Debtor Record"
        className="max-w-md"
      >
        <form onSubmit={handleCreateDebtorSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Debtor Type *
            </label>
            <select
              value={debtorForm.type}
              onChange={(e) => setDebtorForm({ ...debtorForm, type: e.target.value as DebtorType })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="patient">Patient Debtor</option>
              <option value="hmo">HMO Provider Debtor</option>
            </select>
          </div>

          {debtorForm.type === "patient" ? (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Select Patient *
              </label>
              <select
                value={debtorForm.patientId}
                onChange={(e) => setDebtorForm({ ...debtorForm, patientId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                <option value="">-- Choose Patient --</option>
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientNumber || p.phone})</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Select HMO Provider *
              </label>
              <select
                value={debtorForm.hmoId}
                onChange={(e) => setDebtorForm({ ...debtorForm, hmoId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                <option value="">-- Choose HMO --</option>
                {hmoList.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Total Outstanding (₦)
              </label>
              <input
                type="number"
                min={0}
                value={debtorForm.totalOutstanding}
                onChange={(e) => setDebtorForm({ ...debtorForm, totalOutstanding: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Assigned Collector
              </label>
              <select
                value={debtorForm.assignedCollectorId}
                onChange={(e) => setDebtorForm({ ...debtorForm, assignedCollectorId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Next Follow-Up Date
            </label>
            <input
              type="date"
              value={debtorForm.nextFollowUpDate}
              onChange={(e) => setDebtorForm({ ...debtorForm, nextFollowUpDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Clinical or billing context..."
              value={debtorForm.notes}
              onChange={(e) => setDebtorForm({ ...debtorForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateDebtorModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDebtorMut.isPending}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {createDebtorMut.isPending ? "Creating..." : "Save Record"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Debtor Status */}
      <Modal
        isOpen={showUpdateDebtorModal}
        onClose={() => setShowUpdateDebtorModal(false)}
        title={`Update Debtor: ${selectedDebtor?.debtorNumber}`}
        className="max-w-md"
      >
        <form onSubmit={handleUpdateDebtorSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Status *
            </label>
            <select
              value={updateDebtorForm.status}
              onChange={(e) => setUpdateDebtorForm({ ...updateDebtorForm, status: e.target.value as DebtorStatus })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="active">Active Debt</option>
              <option value="on_plan">On Plan</option>
              <option value="in_collection">In Collection</option>
              <option value="settled">Settled</option>
              <option value="write_off">Written Off</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Assigned Collector
            </label>
            <select
              value={updateDebtorForm.assignedCollectorId}
              onChange={(e) => setUpdateDebtorForm({ ...updateDebtorForm, assignedCollectorId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">-- Unassigned --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Next Follow-Up Date
            </label>
            <input
              type="date"
              value={updateDebtorForm.nextFollowUpDate}
              onChange={(e) => setUpdateDebtorForm({ ...updateDebtorForm, nextFollowUpDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={updateDebtorForm.notes}
              onChange={(e) => setUpdateDebtorForm({ ...updateDebtorForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowUpdateDebtorModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateDebtorMut.isPending}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {updateDebtorMut.isPending ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Payment Plan */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Setup Payment Plan"
        className="max-w-md"
      >
        <form onSubmit={handleCreatePlanSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Debtor *
            </label>
            <select
              value={planForm.debtorId}
              onChange={(e) => setPlanForm({ ...planForm, debtorId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              required
            >
              <option value="">-- Choose Debtor --</option>
              {debtors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.debtorNumber} &middot; {d.patient ? `${d.patient.firstName} ${d.patient.lastName}` : d.hmo?.name} (₦{d.currentBalance})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Total Plan Amount (₦) *
              </label>
              <input
                type="number"
                min={1}
                value={planForm.totalAmount}
                onChange={(e) => setPlanForm({ ...planForm, totalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Installments *
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={planForm.totalInstallments}
                onChange={(e) => setPlanForm({ ...planForm, totalInstallments: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={planForm.startDate}
                onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={planForm.endDate}
                onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Agreement Notes
            </label>
            <textarea
              rows={2}
              placeholder="Terms agreed with patient/HMO..."
              value={planForm.notes}
              onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPlanMut.isPending}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {createPlanMut.isPending ? "Creating..." : "Save Payment Plan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Collection Activity */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Log Collection Contact"
        className="max-w-md"
      >
        <form onSubmit={handleCreateActivitySubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Debtor *
            </label>
            <select
              value={activityForm.debtorId}
              onChange={(e) => setActivityForm({ ...activityForm, debtorId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              required
            >
              <option value="">-- Choose Debtor --</option>
              {debtors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.debtorNumber} &middot; {d.patient ? `${d.patient.firstName} ${d.patient.lastName}` : d.hmo?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Activity Type *
              </label>
              <select
                value={activityForm.activityType}
                onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value as CollectionActivityType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="phone_call">Phone Call</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="letter">Letter</option>
                <option value="in_person">In Person</option>
                <option value="promise_to_pay">Promise to Pay</option>
                <option value="payment_received">Payment Received</option>
                <option value="dispute">Dispute</option>
                <option value="legal_action">Legal Action</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Outcome
              </label>
              <select
                value={activityForm.outcome}
                onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value as CollectionOutcome })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="successful">Successful</option>
                <option value="promised">Promised</option>
                <option value="disputed">Disputed</option>
                <option value="no_contact">No Contact / Unreachable</option>
                <option value="unsuccessful">Unsuccessful</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Amount Promised (₦)
              </label>
              <input
                type="number"
                min={0}
                value={activityForm.amountPromised}
                onChange={(e) => setActivityForm({ ...activityForm, amountPromised: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Promise Date
              </label>
              <input
                type="date"
                value={activityForm.promiseDate}
                onChange={(e) => setActivityForm({ ...activityForm, promiseDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Call / Contact Notes
            </label>
            <textarea
              rows={2}
              placeholder="Summary of conversation, patient responses, or dispute details..."
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Next Action Date
              </label>
              <input
                type="date"
                value={activityForm.nextActionDate}
                onChange={(e) => setActivityForm({ ...activityForm, nextActionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Next Action Notes
              </label>
              <input
                type="text"
                placeholder="e.g., Follow up on promise"
                value={activityForm.nextActionNotes}
                onChange={(e) => setActivityForm({ ...activityForm, nextActionNotes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowActivityModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createActivityMut.isPending}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {createActivityMut.isPending ? "Saving..." : "Log Activity"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
