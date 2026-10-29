"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";
import {
  useLensOrders,
  useOpticalInventory,
  useOpticalSales,
  useAllProductionItems,
  useCreateOpticalItem,
  useUpdateOpticalItem,
  useDeleteOpticalItem,
  useCreateLensOrder,
  useUpdateLensOrderStatus,
  useUpdateProductionStage,
  useCreateOpticalSale,
  type OpticalInventoryItem,
  type LensOrder,
  type OpticalSale,
  type ProductionItem,
} from "@/hooks/useOptician";
import { useSuppliers, useCreateSupplier, type Supplier } from "@/hooks/usePharmacy";
import { toast } from "sonner";
import {
  Glasses,
  Eye,
  Layers,
  Settings,
  DollarSign,
  Building2,
  Package,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Loader2,
  Trash2,
  Edit3,
  Calendar,
  Truck,
  ArrowUpRight,
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function statusBadge(status?: string) {
  const s = status?.toLowerCase() || "";
  if (s === "ready" || s === "ready for pickup" || s === "ready_for_pickup") {
    return <Badge className="bg-emerald-600 text-white capitalize">Ready for Pickup</Badge>;
  }
  if (s === "processing" || s === "in production" || s === "in progress") {
    return <Badge className="bg-amber-600 text-white capitalize">In Production</Badge>;
  }
  if (s === "delivered" || s === "dispensed" || s === "completed") {
    return <Badge className="bg-slate-200 text-slate-700 capitalize">Delivered</Badge>;
  }
  if (s === "cancelled") {
    return <Badge className="bg-rose-600 text-white capitalize">Cancelled</Badge>;
  }
  return <Badge variant="outline" className="capitalize">{status || "Pending"}</Badge>;
}

type OpticalTab = "orders" | "frames" | "lens-pricing" | "inventory" | "lab" | "sales" | "suppliers";

export default function OpticalPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  const [activeTab, setActiveTab] = useState<OpticalTab>("orders");

  // Live Backend Queries
  const { data: orders = [], isLoading: loadingOrders } = useLensOrders();
  const { data: inventory = [], isLoading: loadingInventory } = useOpticalInventory();
  const { data: sales = [], isLoading: loadingSales } = useOpticalSales();
  const { data: productionItems = [], isLoading: loadingProduction } = useAllProductionItems();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers(clinicId || null);

  // Reference for patient selector
  const { data: patientsData } = usePatients({ clinicId, limit: 100 });
  const patientsList = Array.isArray(patientsData?.data) ? patientsData.data : Array.isArray(patientsData) ? patientsData : [];

  // Mutations
  const createOrderMut = useCreateLensOrder();
  const updateStatusMut = useUpdateLensOrderStatus();
  const createItemMut = useCreateOpticalItem();
  const deleteItemMut = useDeleteOpticalItem();
  const createSaleMut = useCreateOpticalSale();
  const updateStageMut = useUpdateProductionStage();
  const createSupplierMut = useCreateSupplier();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Forms
  const [orderForm, setOrderForm] = useState({
    patientId: "",
    lensType: "Single Vision 1.56",
    frameDescription: "",
    rightEyeSphere: "",
    rightEyeCylinder: "",
    rightEyeAxis: "",
    leftEyeSphere: "",
    leftEyeCylinder: "",
    leftEyeAxis: "",
    totalPrice: "",
    expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    brand: "",
    category: "frame",
    type: "Full Rim",
    frameSize: "Standard",
    lensType: "",
    unitPrice: "",
    quantityInStock: "10",
    reorderLevel: "5",
  });

  const [saleForm, setSaleForm] = useState({
    patientId: "",
    inventoryItemId: "",
    lensOrderId: "",
    quantity: "1",
    unitPrice: "",
    paymentMethod: "pos",
    paymentReference: "",
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    products: "Optical Frames & Lenses",
  });

  // Derived frames & lenses from real inventory
  const frames = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.category?.toLowerCase() === "frame" ||
        item.type?.toLowerCase()?.includes("rim") ||
        item.type?.toLowerCase() === "frame" ||
        (!item.category && !item.lensType)
    );
  }, [inventory]);

  const lensItems = useMemo(() => {
    return inventory.filter(
      (item) => item.category?.toLowerCase() === "lens" || item.lensType
    );
  }, [inventory]);

  // Real Stats
  const totalOrders = orders.length;
  const inProduction = orders.filter((o) => o.status === "processing" || (o as any).status === "In production").length;
  const ready = orders.filter((o) => o.status === "ready" || (o as any).status === "Ready").length;
  const dispensed = orders.filter((o) => o.status === "delivered" || (o as any).status === "Dispensed").length;
  const lowStockFrames = frames.filter(
    (f) => Number(f.quantityInStock || 0) > 0 && Number(f.quantityInStock || 0) <= Number(f.reorderLevel || 5)
  ).length;
  const outOfStockFrames = frames.filter((f) => Number(f.quantityInStock || 0) === 0).length;
  const totalInventoryValue = inventory.reduce(
    (sum, f) => sum + Number(f.unitPrice || 0) * Number(f.quantityInStock || 0),
    0
  );
  const totalSalesRevenue = sales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const pendingProduction = productionItems.filter((p) => p.stage !== "completed").length;

  // Filtered collections
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const patientName = o.patient ? `${o.patient.firstName || ""} ${o.patient.lastName || ""}` : (o as any).patientName || "";
      const matchesSearch =
        !searchQuery ||
        patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.lensType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const filteredFrames = useMemo(() => {
    return frames.filter((f) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || (f.brand && f.brand.toLowerCase().includes(q));
    });
  }, [frames, searchQuery]);

  const filteredProduction = useMemo(() => {
    return productionItems.filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.lensOrderId.toLowerCase().includes(q) ||
        (p as any).patientName?.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q)
      );
    });
  }, [productionItems, searchQuery]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const patientName = s.patient ? `${s.patient.firstName || ""} ${s.patient.lastName || ""}` : "";
      return (
        (s.saleNumber && s.saleNumber.toLowerCase().includes(q)) ||
        patientName.toLowerCase().includes(q) ||
        (s.inventoryItem?.name && s.inventoryItem.name.toLowerCase().includes(q))
      );
    });
  }, [sales, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.contactPerson && s.contactPerson.toLowerCase().includes(q));
    });
  }, [suppliers, searchQuery]);

  // Handlers
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateStatusMut.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => toast.success(`Order updated to ${newStatus}`),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update order status"),
      }
    );
  };

  const handleUpdateStage = (orderId: string, stage: string) => {
    updateStageMut.mutate(
      { orderId, stage },
      {
        onSuccess: () => toast.success(`Production stage advanced to ${stage}`),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update production stage"),
      }
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.patientId) {
      toast.error("Please select a patient");
      return;
    }
    if (!orderForm.totalPrice) {
      toast.error("Please enter a total price");
      return;
    }
    createOrderMut.mutate(
      {
        clinicId,
        patientId: orderForm.patientId,
        lensType: orderForm.lensType,
        frameDescription: orderForm.frameDescription || undefined,
        rightEyeSphere: orderForm.rightEyeSphere || undefined,
        rightEyeCylinder: orderForm.rightEyeCylinder || undefined,
        rightEyeAxis: orderForm.rightEyeAxis || undefined,
        leftEyeSphere: orderForm.leftEyeSphere || undefined,
        leftEyeCylinder: orderForm.leftEyeCylinder || undefined,
        leftEyeAxis: orderForm.leftEyeAxis || undefined,
        totalPrice: Number(orderForm.totalPrice),
        expectedDeliveryDate: orderForm.expectedDeliveryDate || undefined,
        notes: orderForm.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Lens order created successfully");
          setIsOrderModalOpen(false);
          setOrderForm({
            patientId: "",
            lensType: "Single Vision 1.56",
            frameDescription: "",
            rightEyeSphere: "",
            rightEyeCylinder: "",
            rightEyeAxis: "",
            leftEyeSphere: "",
            leftEyeCylinder: "",
            leftEyeAxis: "",
            totalPrice: "",
            expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            notes: "",
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create lens order"),
      }
    );
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.unitPrice) {
      toast.error("Please enter name and price");
      return;
    }
    createItemMut.mutate(
      {
        clinicId,
        name: itemForm.name,
        brand: itemForm.brand || undefined,
        category: itemForm.category,
        type: itemForm.type,
        frameSize: itemForm.frameSize || undefined,
        lensType: itemForm.lensType || undefined,
        unitPrice: Number(itemForm.unitPrice),
        quantityInStock: Number(itemForm.quantityInStock) || 0,
        reorderLevel: Number(itemForm.reorderLevel) || 5,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success("Optical item added to inventory");
          setIsItemModalOpen(false);
          setItemForm({
            name: "",
            brand: "",
            category: "frame",
            type: "Full Rim",
            frameSize: "Standard",
            lensType: "",
            unitPrice: "",
            quantityInStock: "10",
            reorderLevel: "5",
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create optical item"),
      }
    );
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    deleteItemMut.mutate(id, {
      onSuccess: () => toast.success("Item deleted successfully"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete item"),
    });
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.unitPrice) {
      toast.error("Please enter unit price");
      return;
    }
    createSaleMut.mutate(
      {
        clinicId,
        patientId: saleForm.patientId || undefined,
        inventoryItemId: saleForm.inventoryItemId || undefined,
        lensOrderId: saleForm.lensOrderId || undefined,
        quantity: Number(saleForm.quantity) || 1,
        unitPrice: Number(saleForm.unitPrice),
        paymentMethod: saleForm.paymentMethod as any,
        paymentReference: saleForm.paymentReference || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Optical sale recorded successfully");
          setIsSaleModalOpen(false);
          setSaleForm({
            patientId: "",
            inventoryItemId: "",
            lensOrderId: "",
            quantity: "1",
            unitPrice: "",
            paymentMethod: "pos",
            paymentReference: "",
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to record sale"),
      }
    );
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) {
      toast.error("Please enter supplier name");
      return;
    }
    createSupplierMut.mutate(
      {
        clinicId,
        name: supplierForm.name,
        contactPerson: supplierForm.contactPerson || undefined,
        phone: supplierForm.phone || undefined,
        email: supplierForm.email || undefined,
        address: supplierForm.address || undefined,
        products: supplierForm.products || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Supplier registered successfully");
          setIsSupplierModalOpen(false);
          setSupplierForm({
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            products: "Optical Frames & Lenses",
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to register supplier"),
      }
    );
  };

  if (loadingOrders && loadingInventory) {
    return (
      <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto">
        <PageHeader title="Optical" description="Lens orders, frames, inventory, lab tracking, sales & suppliers." />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Optical"
        description="Lens orders, frames inventory, optical lab tracking, sales ledger & optical suppliers."
        actions={[
          {
            label: "New Lens Order",
            onClick: () => setIsOrderModalOpen(true),
            variant: "default",
          },
          {
            label: "Add Frame / Item",
            onClick: () => setIsItemModalOpen(true),
            variant: "outline",
          },
          {
            label: "Record Sale",
            onClick: () => setIsSaleModalOpen(true),
            variant: "outline",
          },
        ]}
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Lens Orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalOrders}</p>
              <p className="text-xs text-slate-400 mt-0.5">{dispensed} completed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Glasses size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Production</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{inProduction}</p>
              <p className="text-xs text-amber-600/80 mt-0.5">{pendingProduction} lab tasks pending</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Layers size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ready for Pickup</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{ready}</p>
              <p className="text-xs text-emerald-600/80 mt-0.5">Awaiting patient collection</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Optical Sales</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{formatNGN(totalSalesRevenue)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sales.length} transactions logged</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {(
          [
            { id: "orders", label: `Orders (${orders.length})`, icon: Glasses },
            { id: "frames", label: `Frames (${frames.length})`, icon: Eye },
            { id: "lens-pricing", label: `Lenses (${lensItems.length})`, icon: Settings },
            { id: "inventory", label: `Full Inventory (${inventory.length})`, icon: Package },
            { id: "lab", label: `Lab Tracking (${productionItems.length})`, icon: Wrench },
            { id: "sales", label: `Sales Ledger (${sales.length})`, icon: DollarSign },
            { id: "suppliers", label: `Suppliers (${suppliers.length})`, icon: Building2 },
          ] as { id: OpticalTab; label: string; icon: any }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-teal-600 text-teal-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Orders */}
      {activeTab === "orders" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Patient Lens Orders</CardTitle>
              <p className="text-xs text-slate-500">Manage prescription lens grinding, status progression, and deliveries.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patient, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-2 text-slate-400 h-4 w-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">In Production</option>
                <option value="ready">Ready for Pickup</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="default" size="sm" onClick={() => setIsOrderModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> New Order
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lens Specification</TableHead>
                    <TableHead>Frame Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Change Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                        No lens orders recorded yet. Click &quot;New Order&quot; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((o) => {
                      const patientName = o.patient
                        ? `${o.patient.firstName || ""} ${o.patient.lastName || ""}`
                        : (o as any).patientName || "Walk-in Patient";
                      return (
                        <TableRow key={o.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-mono text-xs text-slate-600 font-medium">
                            {o.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">{patientName}</TableCell>
                          <TableCell className="text-xs">{o.lensType}</TableCell>
                          <TableCell className="text-xs text-slate-600">{o.frameDescription || "Customer Supplied"}</TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {o.expectedDeliveryDate ? String(o.expectedDeliveryDate).slice(0, 10) : "-"}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 tabular-nums">
                            {formatNGN(o.totalPrice)}
                          </TableCell>
                          <TableCell>{statusBadge(o.status)}</TableCell>
                          <TableCell className="text-right pr-6">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                              className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500"
                              disabled={updateStatusMut.isPending}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">In Production</option>
                              <option value="ready">Ready for Pickup</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Frames */}
      {activeTab === "frames" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Frame Models</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{frames.length}</p>
                </div>
                <Eye className="h-6 w-6 text-slate-400" />
              </CardContent>
            </Card>
            <Card className="border-amber-200/80 shadow-sm bg-amber-50/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase">Low Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">{lowStockFrames}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </CardContent>
            </Card>
            <Card className="border-rose-200/80 shadow-sm bg-rose-50/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-700 uppercase">Out of Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">{outOfStockFrames}</p>
                </div>
                <Package className="h-6 w-6 text-rose-500" />
              </CardContent>
            </Card>
            <Card className="border-emerald-200/80 shadow-sm bg-emerald-50/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase">Frame Inventory Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                    {formatNGN(
                      frames.reduce(
                        (sum, f) => sum + Number(f.unitPrice || 0) * Number(f.quantityInStock || 0),
                        0
                      )
                    )}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Optical Frame Catalogue</CardTitle>
                <p className="text-xs text-slate-500">Live inventory of prescription glasses frames, designer rims, and sunglasses.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brand, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Search className="absolute left-3 top-2 text-slate-400 h-4 w-4" />
                </div>
                <Button variant="default" size="sm" onClick={() => setIsItemModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Frame
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Brand / Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frame Size</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Quantity In Stock</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrames.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                          No optical frames found in inventory. Click &quot;Add Frame&quot; to stock items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFrames.map((f) => {
                        const stock = Number(f.quantityInStock || 0);
                        const isLow = stock > 0 && stock <= Number(f.reorderLevel || 5);
                        const isOut = stock === 0;
                        return (
                          <TableRow key={f.id} className="hover:bg-slate-50">
                            <TableCell className="pl-6">
                              <div>
                                <p className="font-medium text-slate-900">{f.name}</p>
                                {f.brand && <p className="text-xs text-slate-500">{f.brand}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize text-xs">{f.type || "Full Rim"}</TableCell>
                            <TableCell className="text-xs text-slate-600">{f.frameSize || "Standard"}</TableCell>
                            <TableCell className="font-bold text-slate-900 tabular-nums">
                              {formatNGN(f.unitPrice)}
                            </TableCell>
                            <TableCell className="tabular-nums font-semibold text-slate-800">{stock} units</TableCell>
                            <TableCell>
                              {isOut ? (
                                <Badge className="bg-rose-600 text-white">Out of Stock</Badge>
                              ) : isLow ? (
                                <Badge className="bg-amber-600 text-white">Low Stock</Badge>
                              ) : (
                                <Badge className="bg-emerald-600 text-white">In Stock</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => handleDeleteItem(f.id, f.name)}
                                title="Delete Frame"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Lens Pricing */}
      {activeTab === "lens-pricing" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Lens Types &amp; Pricing Schedule</CardTitle>
              <p className="text-xs text-slate-500">Configured lens materials, refractive indices, coatings, and clinic base pricing.</p>
            </div>
            <Button variant="default" size="sm" onClick={() => {
              setItemForm(f => ({ ...f, category: "lens", type: "Single Vision" }));
              setIsItemModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Lens Specification
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Lens Name</TableHead>
                    <TableHead>Category / Type</TableHead>
                    <TableHead>Specification / Index</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Stock On Hand</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lensItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                        No lens specifications configured in inventory. Click &quot;Add Lens Specification&quot; to define prices.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lensItems.map((l) => (
                      <TableRow key={l.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6 font-medium text-slate-900">{l.name}</TableCell>
                        <TableCell className="text-xs">{l.type || "Prescription Lens"}</TableCell>
                        <TableCell className="text-xs text-slate-600">{l.lensType || "Standard Index"}</TableCell>
                        <TableCell className="font-bold text-slate-900 tabular-nums">{formatNGN(l.unitPrice)}</TableCell>
                        <TableCell className="tabular-nums font-semibold">{l.quantityInStock || 0} blanks</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                            onClick={() => handleDeleteItem(l.id, l.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Full Inventory */}
      {activeTab === "inventory" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Comprehensive Optical Inventory</CardTitle>
              <p className="text-xs text-slate-500">All registered frames, lens blanks, contact lenses, cases, and cleaning supplies.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => setIsItemModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Inventory Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                        No optical items recorded in database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6 font-medium text-slate-900">{item.name}</TableCell>
                        <TableCell className="capitalize text-xs">
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{item.brand || "-"}</TableCell>
                        <TableCell className="font-bold text-slate-900 tabular-nums">
                          {formatNGN(item.unitPrice)}
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold">{item.quantityInStock}</TableCell>
                        <TableCell className="tabular-nums text-slate-500">{item.reorderLevel || 5}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Lab Tracking */}
      {activeTab === "lab" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Optical Lab Tracking</CardTitle>
              <p className="text-xs text-slate-500">Live manufacturing stages for active lens orders: cutting, edging, coating, and assembly.</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search lab queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-3 top-2 text-slate-400 h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Production ID</TableHead>
                    <TableHead>Lens Order</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lens Type</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead className="text-right pr-6">Advance Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduction.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                        No active lab production orders found. Production stages are initiated as lens orders are processed.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProduction.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6 font-mono text-xs text-slate-600 font-medium">
                          {p.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.lensOrderId.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {(p as any).patientName || "Assigned Patient"}
                        </TableCell>
                        <TableCell className="text-xs">{(p as any).lensType || "-"}</TableCell>
                        <TableCell>
                          <Badge className="bg-teal-600 text-white capitalize">{p.stage.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {p.startedAt ? String(p.startedAt).slice(0, 10) : "Pending"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <select
                            value={p.stage}
                            onChange={(e) => handleUpdateStage(p.lensOrderId, e.target.value)}
                            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-teal-500"
                            disabled={updateStageMut.isPending}
                          >
                            <option value="received">Received</option>
                            <option value="lens_cutting">Lens Cutting</option>
                            <option value="edging">Edging</option>
                            <option value="coating">Coating</option>
                            <option value="assembly">Assembly</option>
                            <option value="quality_check">Quality Check</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="completed">Completed</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 6: Sales Ledger */}
      {activeTab === "sales" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Optical Sales Ledger</CardTitle>
              <p className="text-xs text-slate-500">Direct dispensary point-of-sale transactions, payment receipts, and revenue reconciliation.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => setIsSaleModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Record Optical Sale
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Sale #</TableHead>
                    <TableHead>Patient / Customer</TableHead>
                    <TableHead>Inventory Item / Reference</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right pr-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                        No optical sales recorded yet. Click &quot;Record Optical Sale&quot; to log a POS transaction.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((s) => {
                      const patientName = s.patient
                        ? `${s.patient.firstName || ""} ${s.patient.lastName || ""}`
                        : "Walk-in Customer";
                      return (
                        <TableRow key={s.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-mono text-xs font-semibold text-slate-900">
                            {s.saleNumber || s.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">{patientName}</TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {s.inventoryItem?.name || (s.lensOrderId ? `Lens Order #${s.lensOrderId.slice(0, 8)}` : "Optical Product")}
                          </TableCell>
                          <TableCell className="tabular-nums">{s.quantity}</TableCell>
                          <TableCell className="tabular-nums text-slate-600">{formatNGN(s.unitPrice)}</TableCell>
                          <TableCell className="font-bold text-emerald-600 tabular-nums">
                            {formatNGN(s.totalPrice)}
                          </TableCell>
                          <TableCell className="uppercase text-xs font-semibold text-slate-700">
                            <Badge variant="outline">{s.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6 text-xs text-slate-500">
                            {s.createdAt ? String(s.createdAt).slice(0, 10) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 7: Suppliers */}
      {activeTab === "suppliers" && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Optical Suppliers &amp; Labs</CardTitle>
              <p className="text-xs text-slate-500">External lens laboratories, frame manufacturers, and optical consumables distributors.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => setIsSupplierModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Register Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Supplier Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                        No suppliers registered yet. Click &quot;Register Supplier&quot; to add vendors.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <TableRow key={s.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6 font-medium text-slate-900">{s.name}</TableCell>
                        <TableCell className="text-xs text-slate-600">{s.contactPerson || "-"}</TableCell>
                        <TableCell className="tabular-nums text-xs">{s.phone || "-"}</TableCell>
                        <TableCell className="text-xs text-slate-600">{s.email || "-"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{s.address || "-"}</TableCell>
                        <TableCell className="text-xs text-slate-600">{s.products || "Optical Goods"}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge className="bg-emerald-600 text-white">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- MODALS --- */}

      {/* 1. New Lens Order Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Create Lens Order">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Patient *</label>
            <select
              required
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              value={orderForm.patientId}
              onChange={(e) => setOrderForm((f) => ({ ...f, patientId: e.target.value }))}
            >
              <option value="">Select Patient...</option>
              {patientsList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.patientNumber || p.phone || p.id.slice(0, 6)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Lens Type *</label>
              <input
                type="text"
                required
                placeholder="e.g. Progressive 1.67 Blue-Cut"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={orderForm.lensType}
                onChange={(e) => setOrderForm((f) => ({ ...f, lensType: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Frame Description</label>
              <input
                type="text"
                placeholder="e.g. Tom Ford Titanium Black"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={orderForm.frameDescription}
                onChange={(e) => setOrderForm((f) => ({ ...f, frameDescription: e.target.value }))}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Right Eye (OD) Prescription</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Sphere (SPH)"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.rightEyeSphere}
                onChange={(e) => setOrderForm((f) => ({ ...f, rightEyeSphere: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Cylinder (CYL)"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.rightEyeCylinder}
                onChange={(e) => setOrderForm((f) => ({ ...f, rightEyeCylinder: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Axis"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.rightEyeAxis}
                onChange={(e) => setOrderForm((f) => ({ ...f, rightEyeAxis: e.target.value }))}
              />
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide pt-2">Left Eye (OS) Prescription</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Sphere (SPH)"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.leftEyeSphere}
                onChange={(e) => setOrderForm((f) => ({ ...f, leftEyeSphere: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Cylinder (CYL)"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.leftEyeCylinder}
                onChange={(e) => setOrderForm((f) => ({ ...f, leftEyeCylinder: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Axis"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                value={orderForm.leftEyeAxis}
                onChange={(e) => setOrderForm((f) => ({ ...f, leftEyeAxis: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Total Price (NGN) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 45000"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={orderForm.totalPrice}
                onChange={(e) => setOrderForm((f) => ({ ...f, totalPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Expected Delivery</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={orderForm.expectedDeliveryDate}
                onChange={(e) => setOrderForm((f) => ({ ...f, expectedDeliveryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Clinical Notes</label>
            <textarea
              rows={2}
              placeholder="Special coating or pupil distance notes..."
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={orderForm.notes}
              onChange={(e) => setOrderForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createOrderMut.isPending}>
              {createOrderMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createOrderMut.isPending ? "Creating..." : "Create Lens Order"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Frame / Item Modal */}
      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Add Optical Inventory Item">
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={itemForm.category}
                onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="frame">Frame</option>
                <option value="lens">Lens</option>
                <option value="contact_lens">Contact Lens</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Brand / Maker</label>
              <input
                type="text"
                placeholder="e.g. Ray-Ban, Essilor"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.brand}
                onChange={(e) => setItemForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clubmaster Classic Semi-Rimless"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={itemForm.name}
              onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Type / Style</label>
              <input
                type="text"
                placeholder="e.g. Full Rim, Cat-Eye, Bifocal"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.type}
                onChange={(e) => setItemForm((f) => ({ ...f, type: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Frame Size / Lens Index</label>
              <input
                type="text"
                placeholder="e.g. 52-18-140 or 1.67"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.frameSize}
                onChange={(e) => setItemForm((f) => ({ ...f, frameSize: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Unit Price (NGN) *</label>
              <input
                type="number"
                required
                placeholder="45000"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.unitPrice}
                onChange={(e) => setItemForm((f) => ({ ...f, unitPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Quantity In Stock</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.quantityInStock}
                onChange={(e) => setItemForm((f) => ({ ...f, quantityInStock: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={itemForm.reorderLevel}
                onChange={(e) => setItemForm((f) => ({ ...f, reorderLevel: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createItemMut.isPending}>
              {createItemMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createItemMut.isPending ? "Saving..." : "Save to Inventory"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Record Optical Sale Modal */}
      <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title="Record Optical Sale">
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Patient (Optional)</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              value={saleForm.patientId}
              onChange={(e) => setSaleForm((f) => ({ ...f, patientId: e.target.value }))}
            >
              <option value="">Walk-in Customer / None</option>
              {patientsList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Optical Inventory Item</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              value={saleForm.inventoryItemId}
              onChange={(e) => {
                const selected = inventory.find((i) => i.id === e.target.value);
                setSaleForm((f) => ({
                  ...f,
                  inventoryItemId: e.target.value,
                  unitPrice: selected ? String(selected.unitPrice) : f.unitPrice,
                }));
              }}
            >
              <option value="">Select Item from stock...</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({formatNGN(i.unitPrice)} - {i.quantityInStock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Quantity</label>
              <input
                type="number"
                min="1"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Unit Price (NGN) *</label>
              <input
                type="number"
                required
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={saleForm.unitPrice}
                onChange={(e) => setSaleForm((f) => ({ ...f, unitPrice: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Payment Method</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={saleForm.paymentMethod}
                onChange={(e) => setSaleForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              >
                <option value="cash">Cash</option>
                <option value="pos">POS / Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="hmo">HMO Covered</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Payment Reference</label>
              <input
                type="text"
                placeholder="e.g. POS-98124"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={saleForm.paymentReference}
                onChange={(e) => setSaleForm((f) => ({ ...f, paymentReference: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSaleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createSaleMut.isPending}>
              {createSaleMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createSaleMut.isPending ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Add Supplier Modal */}
      <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title="Register Supplier / Lab">
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Essilor West Africa Ltd"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Adebayo T."
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                placeholder="e.g. 0803 123 4567"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="orders@supplier.ng"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Products Provided</label>
              <input
                type="text"
                placeholder="Frames, Progressive Lenses..."
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={supplierForm.products}
                onChange={(e) => setSupplierForm((f) => ({ ...f, products: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Address / City</label>
            <input
              type="text"
              placeholder="e.g. Ikeja, Lagos"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={supplierForm.address}
              onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createSupplierMut.isPending}>
              {createSupplierMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createSupplierMut.isPending ? "Registering..." : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}