"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useBranches } from "@/hooks/useBranches";
import { useCashierProducts } from "@/hooks/useCashier";
import { useDrugs } from "@/hooks/usePharmacy";
import {
  useTransfers,
  useTransferStats,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
  useApproveTransfer,
  useShipTransfer,
  useReceiveTransfer,
  useCancelTransfer,
  type TransferRequest,
  type TransferType,
  type TransferStatus,
  type ItemType,
  type TransferItemDto,
} from "@/hooks/useInventoryTransfers";
import {
  ArrowLeftRight, Plus, Search, Filter, Clock, CheckCircle2,
  AlertCircle, Truck, PackageCheck, Ban, Trash2, Edit3, Eye,
  Building2, ShieldCheck, Loader2, RefreshCw, Send, Check
} from "lucide-react";

const STATUS_MAP: Record<TransferStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", icon: Clock },
  requested: { label: "Requested", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
  approved: { label: "Approved", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: ShieldCheck },
  in_transit: { label: "In Transit", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Truck },
  received: { label: "Partially Received", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: PackageCheck },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: Ban },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: AlertCircle },
};

const TYPE_BADGES: Record<TransferType, { label: string; bg: string; text: string }> = {
  product: { label: "POS Product", bg: "bg-indigo-50", text: "text-indigo-700" },
  drug: { label: "Pharmacy Drug", bg: "bg-teal-50", text: "text-teal-700" },
  optical: { label: "Optical Stock", bg: "bg-sky-50", text: "text-sky-700" },
  mixed: { label: "Mixed Items", bg: "bg-purple-50", text: "text-purple-700" },
};

export default function InventoryTransfersPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  // Data Queries
  const { data: transfers = [], isLoading: loadingTransfers } = useTransfers();
  const { data: stats } = useTransferStats();
  const { data: branches = [] } = useBranches();
  const { data: cashierProducts = [] } = useCashierProducts();
  const { data: drugs = [] } = useDrugs(clinicId);

  // Mutations
  const createMut = useCreateTransfer();
  const deleteMut = useDeleteTransfer();
  const approveMut = useApproveTransfer();
  const shipMut = useShipTransfer();
  const receiveMut = useReceiveTransfer();
  const cancelMut = useCancelTransfer();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Action Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");

  const [showShipModal, setShowShipModal] = useState(false);
  const [shipNotes, setShipNotes] = useState("");
  const [shipQuantities, setShipQuantities] = useState<Record<string, number>>({});

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveNotes, setReceiveNotes] = useState("");
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Create Form State
  const [formType, setFormType] = useState<TransferType>("product");
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formItems, setFormItems] = useState<TransferItemDto[]>([
    { itemType: "product", productId: "", quantityRequested: 1, batchNumber: "", expiryDate: "" },
  ]);

  // Filtered transfers list
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchBranch =
        branchFilter === "all" || t.fromBranchId === branchFilter || t.toBranchId === branchFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.transferNumber.toLowerCase().includes(q) ||
        (t.reason && t.reason.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.fromBranch && t.fromBranch.name.toLowerCase().includes(q)) ||
        (t.toBranch && t.toBranch.name.toLowerCase().includes(q));

      return matchStatus && matchType && matchBranch && matchSearch;
    });
  }, [transfers, statusFilter, typeFilter, branchFilter, searchQuery]);

  // Handlers
  const handleOpenCreate = () => {
    const firstBranch = branches[0]?.id || "";
    const secondBranch = branches[1]?.id || "";
    setFormType("product");
    setFromBranchId(firstBranch);
    setToBranchId(secondBranch);
    setFormReason("");
    setFormNotes("");
    setFormItems([
      {
        itemType: "product",
        productId: cashierProducts[0]?.id || "",
        quantityRequested: 1,
        batchNumber: "",
        expiryDate: "",
      },
    ]);
    setShowCreateModal(true);
  };

  const handleAddItemRow = () => {
    setFormItems([
      ...formItems,
      {
        itemType: formType === "mixed" ? "product" : (formType as ItemType),
        productId: cashierProducts[0]?.id || "",
        quantityRequested: 1,
        batchNumber: "",
        expiryDate: "",
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromBranchId || !toBranchId) {
      alert("Source and destination branches are required");
      return;
    }
    if (fromBranchId === toBranchId) {
      alert("Source and destination branches cannot be the same");
      return;
    }
    if (formItems.length === 0) {
      alert("Please add at least one item to transfer");
      return;
    }

    try {
      await createMut.mutateAsync({
        type: formType,
        fromBranchId,
        toBranchId,
        reason: formReason.trim() || undefined,
        notes: formNotes.trim() || undefined,
        items: formItems.map((item) => ({
          itemType: item.itemType,
          productId: item.itemType === "product" ? item.productId : undefined,
          drugId: item.itemType === "drug" ? item.drugId : undefined,
          opticalItemId: item.itemType === "optical" ? item.opticalItemId : undefined,
          quantityRequested: Number(item.quantityRequested) || 1,
          batchNumber: item.batchNumber?.trim() || undefined,
          expiryDate: item.expiryDate || undefined,
        })),
      });
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create transfer request");
    }
  };

  const handleOpenShip = (transfer: TransferRequest) => {
    setSelectedTransfer(transfer);
    const initialQty: Record<string, number> = {};
    (transfer.items || []).forEach((item) => {
      const remainingToShip = item.quantityRequested - item.quantityShipped;
      initialQty[item.id] = remainingToShip > 0 ? remainingToShip : 0;
    });
    setShipQuantities(initialQty);
    setShipNotes("");
    setShowShipModal(true);
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;
    try {
      const shipItems = Object.entries(shipQuantities).map(([itemId, quantityShipped]) => ({
        itemId,
        quantityShipped: Number(quantityShipped) || 0,
      }));
      await shipMut.mutateAsync({
        id: selectedTransfer.id,
        dto: {
          items: shipItems,
          notes: shipNotes.trim() || undefined,
        },
      });
      setShowShipModal(false);
      setSelectedTransfer(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to ship transfer");
    }
  };

  const handleOpenReceive = (transfer: TransferRequest) => {
    setSelectedTransfer(transfer);
    const initialQty: Record<string, number> = {};
    (transfer.items || []).forEach((item) => {
      const remainingToReceive = item.quantityShipped - item.quantityReceived;
      initialQty[item.id] = remainingToReceive > 0 ? remainingToReceive : 0;
    });
    setReceiveQuantities(initialQty);
    setReceiveNotes("");
    setShowReceiveModal(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;
    try {
      const receiveItems = Object.entries(receiveQuantities).map(([itemId, quantityReceived]) => ({
        itemId,
        quantityReceived: Number(quantityReceived) || 0,
      }));
      await receiveMut.mutateAsync({
        id: selectedTransfer.id,
        dto: {
          items: receiveItems,
          notes: receiveNotes.trim() || undefined,
        },
      });
      setShowReceiveModal(false);
      setSelectedTransfer(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to receive transfer");
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;
    try {
      await approveMut.mutateAsync({
        id: selectedTransfer.id,
        dto: { notes: approveNotes.trim() || undefined },
      });
      setShowApproveModal(false);
      setSelectedTransfer(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to approve transfer");
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer || !cancelReason.trim()) return;
    try {
      await cancelMut.mutateAsync({
        id: selectedTransfer.id,
        dto: { reason: cancelReason.trim() },
      });
      setShowCancelModal(false);
      setSelectedTransfer(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to cancel transfer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this transfer?")) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete transfer");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Inventory Transfers
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Inter-branch stock requisition, shipment fulfillment, and destination receiving
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> New Transfer Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Transfers",
            value: stats?.totalTransfers ?? transfers.length,
            sub: "all logged requests",
            icon: ArrowLeftRight,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
          {
            label: "Pending Approval",
            value: (stats?.byStatus?.requested || 0) + (stats?.byStatus?.draft || 0),
            sub: "requires management review",
            icon: Clock,
            bg: "bg-purple-50",
            color: "text-purple-600",
          },
          {
            label: "In Transit",
            value: stats?.byStatus?.in_transit || 0,
            sub: "dispatched & en route",
            icon: Truck,
            bg: "bg-amber-50",
            color: "text-amber-600",
          },
          {
            label: "Completed",
            value: stats?.byStatus?.completed || 0,
            sub: "fully received stock",
            icon: CheckCircle2,
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
              <p className="text-2xl font-black text-slate-900 tabular-nums">{item.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by transfer #, reason, notes, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="in_transit">In Transit</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="drug">Drugs</option>
            <option value="optical">Optical</option>
            <option value="mixed">Mixed</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loadingTransfers ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={28} />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading transfers...</p>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <ArrowLeftRight size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No inventory transfers found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a stock transfer request between clinic branches to replenish inventory or balance supplies.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Plus size={14} /> New Transfer Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="py-3 px-4">Transfer #</th>
                  <th className="py-3 px-4">Source & Destination</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Items / Quantities</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransfers.map((transfer) => {
                  const statusMeta = STATUS_MAP[transfer.status] || STATUS_MAP.draft;
                  const StatusIcon = statusMeta.icon;
                  const typeMeta = TYPE_BADGES[transfer.type] || TYPE_BADGES.product;
                  const totalRequested = (transfer.items || []).reduce((acc, i) => acc + i.quantityRequested, 0);
                  const totalShipped = (transfer.items || []).reduce((acc, i) => acc + i.quantityShipped, 0);
                  const totalReceived = (transfer.items || []).reduce((acc, i) => acc + i.quantityReceived, 0);

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {transfer.transferNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{transfer.fromBranch?.name || "Source Branch"}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-blue-600">{transfer.toBranch?.name || "Destination Branch"}</span>
                        </div>
                        {transfer.reason && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{transfer.reason}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                          typeMeta.bg,
                          typeMeta.text
                        )}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-900">{transfer.items?.length || 0} line items</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Req: <strong className="text-slate-700">{totalRequested}</strong></span>
                            <span>Ship: <strong className="text-slate-700">{totalShipped}</strong></span>
                            <span>Recv: <strong className="text-slate-700">{totalReceived}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          statusMeta.bg,
                          statusMeta.text,
                          statusMeta.border
                        )}>
                          <StatusIcon size={12} />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <span className="block font-medium">{new Date(transfer.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-400">
                          {transfer.requestedBy?.user
                            ? `${transfer.requestedBy.user.firstName || ""} ${transfer.requestedBy.user.lastName || ""}`.trim()
                            : "Staff"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Lifecycle Actions */}
                        {transfer.status === "requested" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setApproveNotes("");
                                setShowApproveModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setCancelReason("");
                                setShowCancelModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel Transfer"
                            >
                              <Ban size={15} />
                            </button>
                          </>
                        )}

                        {transfer.status === "approved" && (
                          <button
                            onClick={() => handleOpenShip(transfer)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                          >
                            <Truck size={12} /> Ship
                          </button>
                        )}

                        {transfer.status === "in_transit" && (
                          <button
                            onClick={() => handleOpenReceive(transfer)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                          >
                            <PackageCheck size={12} /> Receive
                          </button>
                        )}

                        {(transfer.status === "draft" || transfer.status === "cancelled" || transfer.status === "rejected") && (
                          <button
                            onClick={() => handleDelete(transfer.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Transfer"
                          >
                            <Trash2 size={15} />
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

      {/* Modal: Create Transfer */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Inventory Transfer Request"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Type *
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as TransferType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="product">POS Product</option>
                <option value="drug">Pharmacy Drug</option>
                <option value="optical">Optical Stock</option>
                <option value="mixed">Mixed Inventory</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                From Branch *
              </label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                <option value="">-- Source Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                To Branch *
              </label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                <option value="">-- Destination Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Reason for Transfer
              </label>
              <input
                type="text"
                placeholder="e.g., Stock rebalance, urgent surgery requirement"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Internal Notes
              </label>
              <input
                type="text"
                placeholder="e.g., Authorized by head pharmacist"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Transfer Items ({formItems.length})
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:bg-blue-100"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {formItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                  <div className="w-24 shrink-0">
                    <select
                      value={item.itemType}
                      onChange={(e) => {
                        const newType = e.target.value as ItemType;
                        const copy = [...formItems];
                        copy[idx].itemType = newType;
                        copy[idx].productId = newType === "product" ? cashierProducts[0]?.id : undefined;
                        copy[idx].drugId = newType === "drug" ? drugs[0]?.id : undefined;
                        setFormItems(copy);
                      }}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value="product">Product</option>
                      <option value="drug">Drug</option>
                      <option value="optical">Optical</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    {item.itemType === "product" ? (
                      <select
                        value={item.productId || ""}
                        onChange={(e) => {
                          const copy = [...formItems];
                          copy[idx].productId = e.target.value;
                          setFormItems(copy);
                        }}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {cashierProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                        ))}
                      </select>
                    ) : item.itemType === "drug" ? (
                      <select
                        value={item.drugId || ""}
                        onChange={(e) => {
                          const copy = [...formItems];
                          copy[idx].drugId = e.target.value;
                          setFormItems(copy);
                        }}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        required
                      >
                        <option value="">-- Choose Drug --</option>
                        {drugs.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} (Stock: {d.quantityInStock})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Optical Item UUID or SKU"
                        value={item.opticalItemId || ""}
                        onChange={(e) => {
                          const copy = [...formItems];
                          copy[idx].opticalItemId = e.target.value;
                          setFormItems(copy);
                        }}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        required
                      />
                    )}
                  </div>

                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantityRequested}
                      onChange={(e) => {
                        const copy = [...formItems];
                        copy[idx].quantityRequested = Number(e.target.value);
                        setFormItems(copy);
                      }}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                      required
                    />
                  </div>

                  {formItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {createMut.isPending ? "Creating..." : "Submit Requisition"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ship Transfer */}
      <Modal
        isOpen={showShipModal}
        onClose={() => setShowShipModal(false)}
        title={`Dispatch & Ship Transfer (${selectedTransfer?.transferNumber})`}
        className="max-w-lg"
      >
        <form onSubmit={handleShipSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Confirm dispatch quantities from <strong>{selectedTransfer?.fromBranch?.name}</strong> to <strong>{selectedTransfer?.toBranch?.name}</strong>.
          </p>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
            {selectedTransfer?.items?.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {item.product?.name || item.drug?.name || item.opticalItem?.name || item.id.slice(0, 8)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Requested: {item.quantityRequested} | Already Shipped: {item.quantityShipped}
                  </p>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    max={item.quantityRequested - item.quantityShipped}
                    value={shipQuantities[item.id] || 0}
                    onChange={(e) => setShipQuantities({ ...shipQuantities, [item.id]: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Dispatch / Courier Notes
            </label>
            <input
              type="text"
              placeholder="e.g., Courier tracking # or driver name"
              value={shipNotes}
              onChange={(e) => setShipNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowShipModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={shipMut.isPending}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Truck size={14} /> {shipMut.isPending ? "Shipping..." : "Confirm Shipment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Receive Transfer */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title={`Receive Stock (${selectedTransfer?.transferNumber})`}
        className="max-w-lg"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Confirm received items at <strong>{selectedTransfer?.toBranch?.name}</strong>. Stock will be automatically credited to this branch.
          </p>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
            {selectedTransfer?.items?.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {item.product?.name || item.drug?.name || item.opticalItem?.name || item.id.slice(0, 8)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Shipped: {item.quantityShipped} | Previously Received: {item.quantityReceived}
                  </p>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min={0}
                    max={item.quantityShipped - item.quantityReceived}
                    value={receiveQuantities[item.id] || 0}
                    onChange={(e) => setReceiveQuantities({ ...receiveQuantities, [item.id]: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Receiving Notes / Condition
            </label>
            <input
              type="text"
              placeholder="e.g., All items inspected, packaging intact"
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowReceiveModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={receiveMut.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <PackageCheck size={14} /> {receiveMut.isPending ? "Receiving..." : "Confirm Intake"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Transfer */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Transfer Request"
        className="max-w-md"
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Approve transfer <strong>{selectedTransfer?.transferNumber}</strong> from <strong>{selectedTransfer?.fromBranch?.name}</strong> to <strong>{selectedTransfer?.toBranch?.name}</strong>.
          </p>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Approval Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Stock release authorized"
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={approveMut.isPending}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {approveMut.isPending ? "Approving..." : "Authorize Transfer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Transfer */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Transfer Request"
        className="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              placeholder="State the clinical or inventory reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase"
            >
              Keep Transfer
            </button>
            <button
              type="submit"
              disabled={cancelMut.isPending}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              {cancelMut.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Details */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Transfer Requisition Details: ${selectedTransfer?.transferNumber}`}
        className="max-w-2xl"
      >
        {selectedTransfer && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Source Branch</p>
                <p className="font-bold text-slate-900">{selectedTransfer.fromBranch?.name || "Main Clinic"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Destination Branch</p>
                <p className="font-bold text-slate-900 text-blue-600">{selectedTransfer.toBranch?.name || "Destination"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <span className="font-bold capitalize">{selectedTransfer.status.replace("_", " ")}</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Reason</p>
                <p className="font-medium text-slate-700">{selectedTransfer.reason || "None specified"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-wider text-slate-800 text-[11px] mb-2">Itemized Breakdown</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-center">Requested</th>
                      <th className="py-2 px-3 text-center">Shipped</th>
                      <th className="py-2 px-3 text-center">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTransfer.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {item.product?.name || item.drug?.name || item.opticalItem?.name || item.id.slice(0, 8)}
                        </td>
                        <td className="py-2 px-3 uppercase text-[10px] text-slate-400">{item.itemType}</td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-700">{item.quantityRequested}</td>
                        <td className="py-2 px-3 text-center font-semibold text-amber-600">{item.quantityShipped}</td>
                        <td className="py-2 px-3 text-center font-semibold text-emerald-600">{item.quantityReceived}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedTransfer.cancellationReason && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 text-[11px]">
                <strong>Cancellation Reason:</strong> {selectedTransfer.cancellationReason}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
