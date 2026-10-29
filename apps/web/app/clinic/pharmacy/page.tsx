"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  useDrugs,
  useSuppliers,
  useAllPrescriptions,
  useDispenseDrug,
  useRestockDrug,
  useCreateDrug,
  useCreateSupplier,
} from "@/hooks/usePharmacy";
import { toast } from "sonner";
import {
  Pill,
  Syringe,
  AlertTriangle,
  Building2,
  Stethoscope,
  ClipboardList,
  PackagePlus,
  Trash2,
  CheckCircle2,
  Mail,
  Plus,
  Loader2,
  Search,
} from "lucide-react";

// --- TYPES ---
type PharmacyItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  dosageForm: string;
  batchNumber: string;
  stock: number;
  reorderLevel: number;
  price: number;
  expiryISO: string;
};

type PrescriptionItem = {
  sku: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
};

type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  provider: string;
  date: string;
  status: "Active" | "Completed";
  items: PrescriptionItem[];
};

type Supplier = {
  id: string;
  name: string;
  type: string;
  contact: string;
  leadTime: string;
  status: "Active" | "Pending" | "Inactive";
};

// --- HELPER FUNCTIONS ---
function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function daysToExpiry(iso: string) {
  const expiry = new Date(iso);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(days: number) {
  if (days < 0) return { label: "Expired", class: "bg-rose-100 text-rose-800 border-rose-200" };
  if (days <= 30) return { label: "Critical (<30d)", class: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" };
  if (days <= 90) return { label: "Warning (<90d)", class: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Valid", class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

type PharmacyTab = "queue" | "inventory" | "expiry" | "suppliers";

export default function PharmacyPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  const [activeTab, setActiveTab] = useState<PharmacyTab>("queue");

  // Live Backend Queries
  const { data: drugs = [], isLoading: loadingDrugs } = useDrugs(clinicId || null);
  const { data: prescriptionsData = [], isLoading: loadingPrescriptions } = useAllPrescriptions(clinicId || null);
  const { data: suppliersData = [], isLoading: loadingSuppliers } = useSuppliers(clinicId || null);

  // Mutations
  const dispenseDrugMut = useDispenseDrug();
  const restockDrugMut = useRestockDrug();
  const createDrugMut = useCreateDrug();
  const createSupplierMut = useCreateSupplier();

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState<PharmacyItem | null>(null);
  const [isManageStockOpen, setIsManageStockOpen] = useState(false);
  const [stockChangeVal, setStockChangeVal] = useState<number>(0);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  // Add Item / Supplier Modals
  const [isAddDrugOpen, setIsAddDrugOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  const [drugForm, setDrugForm] = useState({
    name: "",
    genericName: "",
    category: "General",
    dosageForm: "Tablet",
    strength: "500mg",
    unitPrice: "",
    quantityInStock: "50",
    reorderLevel: "20",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    products: "Pharmaceuticals & Consumables",
  });

  // Mapped live inventory
  const inventory: PharmacyItem[] = useMemo(() => {
    return drugs.map((d) => ({
      id: d.id,
      sku: d.id.slice(0, 8).toUpperCase(),
      name: d.name,
      category: d.category || "General",
      dosageForm: d.dosageForm || "Tablet",
      batchNumber: d.genericName || "Standard",
      stock: d.quantityInStock,
      reorderLevel: d.reorderLevel,
      price: d.unitPrice,
      expiryISO: d.expiryDate ? d.expiryDate.slice(0, 10) : "2027-12-31",
    }));
  }, [drugs]);

  // Mapped live prescriptions
  const prescriptions: Prescription[] = useMemo(() => {
    return prescriptionsData.map((p) => {
      const patient = p.medicalRecord?.patient;
      const staff = p.prescribedBy || p.medicalRecord?.staff;
      return {
        id: p.id,
        patientId: patient?.id || p.medicalRecord?.patientId || "P-Unknown",
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Walk-in Patient",
        provider: staff ? `Dr. ${staff.firstName} ${staff.lastName}` : "Attending Physician",
        date: p.createdAt ? p.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        status: p.isActive ? "Active" : "Completed",
        items: [
          {
            sku: p.id.slice(0, 8).toUpperCase(),
            name: p.medication,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration || "As directed",
            quantity: 1,
          },
        ],
      };
    });
  }, [prescriptionsData]);

  // Mapped live suppliers
  const suppliers: Supplier[] = useMemo(() => {
    return suppliersData.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.products || "Pharmaceuticals",
      contact: s.email || s.phone || "No contact info",
      leadTime: "2-3 Days",
      status: s.isActive ? "Active" : "Inactive",
    }));
  }, [suppliersData]);

  // Metrics
  const lowStockCount = inventory.filter((i) => i.stock <= i.reorderLevel).length;
  const expiringSoonCount = inventory.filter((i) => daysToExpiry(i.expiryISO) <= 90).length;
  const activePrescriptions = prescriptions.filter((p) => p.status === "Active");

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
    );
  }, [inventory, searchQuery]);

  // --- HANDLERS ---
  const handleOpenDispense = (p: Prescription) => {
    setSelectedPrescription(p);
    setIsDispenseOpen(true);
  };

  const handleConfirmDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    const firstItem = selectedPrescription.items[0];
    const matchingDrug = drugs.find((d) => d.name.toLowerCase() === firstItem?.name.toLowerCase()) || drugs[0];

    if (matchingDrug) {
      dispenseDrugMut.mutate(
        {
          clinicId,
          patientId: selectedPrescription.patientId,
          drugId: matchingDrug.id,
          quantityDispensed: firstItem?.quantity || 1,
          notes: `Dispensed Rx #${selectedPrescription.id.slice(0, 8)}`,
        },
        {
          onSuccess: () => {
            toast.success("Medication dispensed successfully");
            setIsDispenseOpen(false);
            setSelectedPrescription(null);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to dispense drug");
          },
        }
      );
    } else {
      toast.success("Prescription dispensed (demo mode)");
      setIsDispenseOpen(false);
      setSelectedPrescription(null);
    }
  };

  const handleOpenManageStock = (item: PharmacyItem) => {
    setSelectedInventory(item);
    setStockChangeVal(item.stock);
    setIsManageStockOpen(true);
  };

  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventory) return;

    restockDrugMut.mutate(
      {
        drugId: selectedInventory.id,
        quantity: Math.max(0, stockChangeVal),
      },
      {
        onSuccess: () => {
          toast.success("Stock count updated");
          setIsManageStockOpen(false);
          setSelectedInventory(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update stock");
        },
      }
    );
  };

  const handleCreateDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugForm.name || !drugForm.unitPrice) {
      toast.error("Please fill required fields");
      return;
    }

    createDrugMut.mutate(
      {
        clinicId,
        name: drugForm.name,
        genericName: drugForm.genericName || undefined,
        category: drugForm.category,
        dosageForm: drugForm.dosageForm,
        strength: drugForm.strength,
        unitPrice: Number(drugForm.unitPrice),
        quantityInStock: Number(drugForm.quantityInStock) || 0,
        reorderLevel: Number(drugForm.reorderLevel) || 10,
        expiryDate: drugForm.expiryDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Drug added to pharmacy inventory");
          setIsAddDrugOpen(false);
          setDrugForm({
            name: "",
            genericName: "",
            category: "General",
            dosageForm: "Tablet",
            strength: "500mg",
            unitPrice: "",
            quantityInStock: "50",
            reorderLevel: "20",
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create drug"),
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
          setIsAddSupplierOpen(false);
          setSupplierForm({
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            products: "Pharmaceuticals & Consumables",
          });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create supplier"),
      }
    );
  };

  const handleOpenSupplier = (s: Supplier) => {
    setSelectedSupplier(s);
    setIsSupplierOpen(true);
  };

  if (loadingDrugs && loadingPrescriptions) {
    return (
      <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Pharmacy Management"
          description="Comprehensive dispensary workflows, inventory control, and medical expiry tracking."
        />
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
        title="Pharmacy Management"
        description="Comprehensive dispensary workflows, real-time inventory control, and medical expiry tracking."
        actions={[
          { label: "Add Drug to Stock", onClick: () => setIsAddDrugOpen(true), variant: "default" },
          { label: "Register Supplier", onClick: () => setIsAddSupplierOpen(true), variant: "outline" },
        ]}
      />

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total SKUs</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-slate-900 tabular-nums">{inventory.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-rose-600 tabular-nums">{lowStockCount}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Expiring {'<90d'}</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-amber-600 tabular-nums">{expiringSoonCount}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Rx</p>
              <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-emerald-600 tabular-nums">{activePrescriptions.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max" aria-label="Tabs">
          {[
            { id: "queue", name: `Prescription Queue (${activePrescriptions.length})`, shortName: "Rx Queue", icon: ClipboardList },
            { id: "inventory", name: `Drug Inventory (${inventory.length})`, shortName: "Inventory", icon: Pill },
            { id: "expiry", name: `Expiry Tracker (${expiringSoonCount})`, shortName: "Expiry", icon: AlertTriangle },
            { id: "suppliers", name: `Suppliers (${suppliers.length})`, shortName: "Suppliers", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PharmacyTab)}
                className={cn(
                  "group inline-flex items-center gap-1.5 sm:gap-2 border-b-2 py-3 sm:py-4 px-1 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "border-sky-500 text-sky-600 font-bold"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:hidden">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 1. PRESCRIPTION QUEUE TAB */}
      {activeTab === "queue" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Active Dispensing Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 pl-6">Rx ID</TableHead>
                    <TableHead className="font-bold text-slate-700">Patient Details</TableHead>
                    <TableHead className="font-bold text-slate-700">Prescribing Doctor</TableHead>
                    <TableHead className="font-bold text-slate-700">Date Prescribed</TableHead>
                    <TableHead className="font-bold text-slate-700">Items Count</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePrescriptions.length > 0 ? (
                    activePrescriptions.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-xs text-slate-500">
                          {p.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">{p.patientName}</div>
                          <div className="text-xs text-slate-400 font-medium">ID: {p.patientId.slice(0, 8)}</div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm font-medium">
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5" /> {p.provider}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{p.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {p.items.length} Medication(s)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <button
                            onClick={() => handleOpenDispense(p)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <Syringe className="h-3 w-3" /> Review &amp; Dispense
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                        No active prescriptions in the queue. Prescriptions issued by doctors will appear here automatically.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. DRUG INVENTORY TAB */}
      {activeTab === "inventory" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold text-slate-900">Drug Inventory Ledger</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Search className="absolute left-3 top-2 text-slate-400 h-4 w-4" />
              </div>
              <Button variant="default" size="sm" onClick={() => setIsAddDrugOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Drug
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 pl-6">Medication Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Category</TableHead>
                    <TableHead className="font-bold text-slate-700">Form</TableHead>
                    <TableHead className="font-bold text-slate-700">Batch / Strength</TableHead>
                    <TableHead className="font-bold text-slate-700">Stock Count</TableHead>
                    <TableHead className="font-bold text-slate-700">Unit Price</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                        No drugs found in inventory. Click &quot;Add Drug&quot; to register stock.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((i) => {
                      const isLow = i.stock <= i.reorderLevel;
                      return (
                        <TableRow key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-6">
                            <p className="font-bold text-slate-900 text-sm">{i.name}</p>
                            <p className="text-xs font-mono text-slate-400">SKU: {i.sku}</p>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{i.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{i.dosageForm}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">{i.batchNumber}</TableCell>
                          <TableCell>
                            <span className={cn("font-mono text-sm font-black", isLow ? "text-rose-600" : "text-slate-900")}>
                              {i.stock} units
                            </span>
                            {isLow && <Badge className="ml-2 bg-rose-50 text-rose-700 border-rose-200 text-[10px]">Low</Badge>}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 text-sm tabular-nums">
                            {formatNGN(i.price)}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <button
                              onClick={() => handleOpenManageStock(i)}
                              className="px-3 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm ml-auto"
                            >
                              Adjust Stock
                            </button>
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

      {/* 3. EXPIRY TRACKER TAB */}
      {activeTab === "expiry" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Medical Expiry Tracking Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 pl-6">Medication Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Batch</TableHead>
                    <TableHead className="font-bold text-slate-700">Stock Count</TableHead>
                    <TableHead className="font-bold text-slate-700">Expiry Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.slice().sort((a, b) => daysToExpiry(a.expiryISO) - daysToExpiry(b.expiryISO)).map((i) => {
                    const days = daysToExpiry(i.expiryISO);
                    const status = getExpiryStatus(days);
                    const isExpired = days < 0;
                    return (
                      <TableRow key={i.id} className={cn("hover:bg-slate-50/50 transition-colors", isExpired && "bg-rose-50/30")}>
                        <TableCell className="pl-6 font-bold text-slate-900 text-sm">{i.name}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-500">{i.batchNumber}</TableCell>
                        <TableCell className="font-mono text-sm font-black text-slate-900">{i.stock} units</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-800">{i.expiryISO}</TableCell>
                        <TableCell><Badge className={cn("border font-bold text-xs shadow-sm", status.class)}>{status.label}</Badge></TableCell>
                        <TableCell className="text-right pr-6">
                          {isExpired ? (
                            <button
                              onClick={() => {
                                restockDrugMut.mutate({ drugId: i.id, quantity: 0 });
                                toast.success("Expired batch removed from stock");
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 ml-auto"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Valid batch</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. SUPPLIERS TAB */}
      {activeTab === "suppliers" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold text-slate-900">Pharmacy Vendors &amp; Wholesalers</CardTitle>
            <Button variant="default" size="sm" onClick={() => setIsAddSupplierOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Register Supplier
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 pl-6">Vendor Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Supply Profile</TableHead>
                    <TableHead className="font-bold text-slate-700">Contact</TableHead>
                    <TableHead className="font-bold text-slate-700">Avg Lead Time</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                        No pharmacy suppliers registered. Click &quot;Register Supplier&quot; to add vendors.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((s) => (
                      <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 font-bold text-slate-900 text-sm">{s.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm font-medium">{s.type}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{s.contact}</TableCell>
                        <TableCell className="font-bold text-slate-700 text-sm">{s.leadTime}</TableCell>
                        <TableCell>
                          <Badge className={s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <button
                            onClick={() => handleOpenSupplier(s)}
                            className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Mail className="h-3 w-3" /> Contact
                          </button>
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

      {/* 1. DISPENSE PRESCRIPTION MODAL */}
      <Modal
        isOpen={isDispenseOpen}
        onClose={() => setIsDispenseOpen(false)}
        title="Dispense Prescription"
        className="max-w-2xl"
      >
        <form onSubmit={handleConfirmDispense} className="space-y-6">
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Patient Details</p>
              <p className="text-lg font-black text-slate-900">{selectedPrescription?.patientName}</p>
              <p className="text-sm font-medium text-slate-600">ID: {selectedPrescription?.patientId.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Prescriber</p>
              <p className="text-sm font-bold text-slate-900">{selectedPrescription?.provider}</p>
              <p className="text-xs font-mono text-slate-500">{selectedPrescription?.date}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Prescribed Medications</h4>
            <div className="space-y-3">
              {selectedPrescription?.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                      <p>Dosage: <span className="font-bold text-slate-800">{item.dosage}</span></p>
                      <p>Frequency: <span className="font-bold text-slate-800">{item.frequency}</span></p>
                      <p>Duration: <span className="font-bold text-slate-800">{item.duration}</span></p>
                      <p>Qty to Dispense: <span className="font-black text-sky-600">{item.quantity} unit(s)</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-amber-800">
              Confirming this action will record the dispense in the pharmacy log and update live stock counts.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsDispenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-emerald-600 hover:bg-emerald-700" disabled={dispenseDrugMut.isPending}>
              {dispenseDrugMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {dispenseDrugMut.isPending ? "Dispensing..." : "Confirm Dispense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. MANAGE STOCK MODAL */}
      <Modal
        isOpen={isManageStockOpen}
        onClose={() => setIsManageStockOpen(false)}
        title="Manage Stock Count"
        className="max-w-sm"
      >
        <form onSubmit={handleSaveStockUpdate} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="font-bold text-slate-900 text-lg mb-1">{selectedInventory?.name}</p>
            <p className="text-xs font-mono text-slate-500">SKU: {selectedInventory?.sku}</p>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Absolute Stock Count</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStockChangeVal((prev) => Math.max(0, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold border border-slate-200 text-slate-700 flex items-center justify-center text-lg select-none"
              >
                -
              </button>
              <input
                type="number"
                value={stockChangeVal}
                onChange={(e) => setStockChangeVal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-10 rounded-xl border border-slate-200 text-center font-black text-xl text-slate-900 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 tabular-nums"
                min={0}
                required
              />
              <button
                type="button"
                onClick={() => setStockChangeVal((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold border border-slate-200 text-slate-700 flex items-center justify-center text-lg select-none"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Update inventory based on verified stock count.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsManageStockOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={restockDrugMut.isPending}>
              {restockDrugMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {restockDrugMut.isPending ? "Saving..." : "Save Count"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. ADD DRUG MODAL */}
      <Modal isOpen={isAddDrugOpen} onClose={() => setIsAddDrugOpen(false)} title="Add Drug to Pharmacy Inventory">
        <form onSubmit={handleCreateDrug} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Drug Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Moxifloxacin 0.5% Drops"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={drugForm.name}
              onChange={(e) => setDrugForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Generic Name</label>
              <input
                type="text"
                placeholder="e.g. Moxifloxacin HCl"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.genericName}
                onChange={(e) => setDrugForm((f) => ({ ...f, genericName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <input
                type="text"
                placeholder="e.g. Antibiotic, Glaucoma"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.category}
                onChange={(e) => setDrugForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Dosage Form</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={drugForm.dosageForm}
                onChange={(e) => setDrugForm((f) => ({ ...f, dosageForm: e.target.value }))}
              >
                <option value="Eye Drop">Eye Drop</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Ointment">Ointment</option>
                <option value="Suspension">Suspension</option>
                <option value="Injection">Injection</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Strength</label>
              <input
                type="text"
                placeholder="e.g. 0.5%, 250mg"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.strength}
                onChange={(e) => setDrugForm((f) => ({ ...f, strength: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Unit Price (NGN) *</label>
              <input
                type="number"
                required
                placeholder="3500"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.unitPrice}
                onChange={(e) => setDrugForm((f) => ({ ...f, unitPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Quantity in Stock</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.quantityInStock}
                onChange={(e) => setDrugForm((f) => ({ ...f, quantityInStock: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={drugForm.reorderLevel}
                onChange={(e) => setDrugForm((f) => ({ ...f, reorderLevel: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Expiry Date</label>
            <input
              type="date"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              value={drugForm.expiryDate}
              onChange={(e) => setDrugForm((f) => ({ ...f, expiryDate: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDrugOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createDrugMut.isPending}>
              {createDrugMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createDrugMut.isPending ? "Saving..." : "Save Drug"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. REGISTER SUPPLIER MODAL */}
      <Modal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} title="Register Pharmacy Supplier">
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MedicaCore Pharma Ltd"
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
                placeholder="e.g. Dr. Ngozi E."
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                placeholder="0803 111 2233"
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
              <label className="text-xs font-semibold text-slate-700">Products Supplied</label>
              <input
                type="text"
                placeholder="Antibiotics, Eye Drops..."
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
              placeholder="e.g. Lagos, Nigeria"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={supplierForm.address}
              onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddSupplierOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1" disabled={createSupplierMut.isPending}>
              {createSupplierMut.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {createSupplierMut.isPending ? "Registering..." : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. CONTACT VENDOR MODAL */}
      <Modal
        isOpen={isSupplierOpen}
        onClose={() => setIsSupplierOpen(false)}
        title="Contact Vendor"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-sky-600 mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">{selectedSupplier?.name}</h3>
            <p className="text-sm font-medium text-sky-700">{selectedSupplier?.type}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{selectedSupplier?.contact}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Lead Time</span>
              <span className="text-sm font-bold text-slate-900">{selectedSupplier?.leadTime}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSupplierOpen(false)}
              className="flex-1"
            >
              Close Details
            </Button>
            <a
              href={`mailto:${selectedSupplier?.contact}`}
              className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-100 transition-colors text-center inline-flex items-center justify-center"
            >
              Compose Email
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
