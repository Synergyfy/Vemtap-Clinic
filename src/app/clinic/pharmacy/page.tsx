"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
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
  Mail
} from "lucide-react";

// --- TYPES ---
type PharmacyItem = {
  sku: string;
  name: string;
  category: string;
  dosageForm: string; // Drop, Ointment, Tablet
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
  frequency: string; // e.g. "BID", "TID"
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

// --- MOCK DATA ---
const initialInventory: PharmacyItem[] = [
  { sku: "RX-EYE-001", name: "Timolol Maleate 0.5%", category: "Glaucoma", dosageForm: "Eye Drop", batchNumber: "B-2025-04A", stock: 15, reorderLevel: 20, price: 4500, expiryISO: "2026-11-01" },
  { sku: "RX-EYE-002", name: "Latanoprost 0.005%", category: "Glaucoma", dosageForm: "Eye Drop", batchNumber: "B-2025-08C", stock: 8, reorderLevel: 15, price: 8200, expiryISO: "2026-07-15" },
  { sku: "RX-ATB-011", name: "Moxifloxacin 0.5%", category: "Antibiotic", dosageForm: "Eye Drop", batchNumber: "B-2024-12X", stock: 42, reorderLevel: 10, price: 3500, expiryISO: "2026-06-20" }, // Expiring soon
  { sku: "RX-LUB-022", name: "Sodium Hyaluronate 0.1%", category: "Lubricant", dosageForm: "Eye Drop", batchNumber: "B-2026-01B", stock: 120, reorderLevel: 50, price: 2100, expiryISO: "2027-10-10" },
  { sku: "RX-ST-005", name: "Prednisolone Acetate 1%", category: "Steroid", dosageForm: "Eye Drop", batchNumber: "B-2024-02D", stock: 4, reorderLevel: 15, price: 5400, expiryISO: "2026-05-10" }, // Expired/Critical
  { sku: "RX-ORAL-101", name: "Acetazolamide 250mg", category: "Oral Meds", dosageForm: "Tablet", batchNumber: "T-2025-11Z", stock: 300, reorderLevel: 100, price: 150, expiryISO: "2028-01-01" },
];

const initialPrescriptions: Prescription[] = [
  {
    id: "PRX-8001",
    patientId: "P-10123",
    patientName: "Chidi Okafor",
    provider: "Dr. A. Mensah",
    date: "2026-06-02",
    status: "Active",
    items: [
      { sku: "RX-EYE-001", name: "Timolol Maleate 0.5%", dosage: "1 drop", frequency: "BID (Twice daily)", duration: "30 days", quantity: 1 },
      { sku: "RX-LUB-022", name: "Sodium Hyaluronate 0.1%", dosage: "1-2 drops", frequency: "PRN (As needed)", duration: "30 days", quantity: 2 }
    ]
  },
  {
    id: "PRX-8002",
    patientId: "P-10455",
    patientName: "Amina Musa",
    provider: "Dr. S. Bello",
    date: "2026-06-01",
    status: "Active",
    items: [
      { sku: "RX-ATB-011", name: "Moxifloxacin 0.5%", dosage: "1 drop", frequency: "QID (Four times daily)", duration: "7 days", quantity: 1 }
    ]
  }
];

const initialSuppliers: Supplier[] = [
  { id: "VND-PH-01", name: "MedicaCore Pharma Ltd", type: "General Medications", contact: "orders@medicacore.ng", leadTime: "2-3 Days", status: "Active" },
  { id: "VND-PH-02", name: "OphthaSupply Partners", type: "Specialized Eye Drops", contact: "sales@ophthasupply.com", leadTime: "1-2 Days", status: "Active" },
  { id: "VND-PH-03", name: "Global Health Distributors", type: "Consumables & Oral Meds", contact: "fulfillment@ghd.org", leadTime: "5-7 Days", status: "Pending" },
];

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
  const [activeTab, setActiveTab] = useState<PharmacyTab>("queue");
  const [inventory, setInventory] = useState<PharmacyItem[]>(initialInventory);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);

  // Modals State
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState<PharmacyItem | null>(null);
  const [isManageStockOpen, setIsManageStockOpen] = useState(false);
  const [stockChangeVal, setStockChangeVal] = useState<number>(0);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  // Metrics
  const lowStockCount = inventory.filter((i) => i.stock <= i.reorderLevel).length;
  const expiringSoonCount = inventory.filter((i) => daysToExpiry(i.expiryISO) <= 90).length;
  const activePrescriptions = prescriptions.filter((p) => p.status === "Active");

  // --- HANDLERS ---
  const handleOpenDispense = (p: Prescription) => {
    setSelectedPrescription(p);
    setIsDispenseOpen(true);
  };

  const handleConfirmDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    setPrescriptions((prev) => prev.map((p) => (p.id === selectedPrescription.id ? { ...p, status: "Completed" } : p)));

    setInventory((prev) =>
      prev.map((item) => {
        const dispensedItem = selectedPrescription.items.find((pi) => pi.sku === item.sku);
        if (dispensedItem) {
          return { ...item, stock: Math.max(0, item.stock - dispensedItem.quantity) };
        }
        return item;
      })
    );

    setIsDispenseOpen(false);
    setSelectedPrescription(null);
  };

  const handleOpenManageStock = (item: PharmacyItem) => {
    setSelectedInventory(item);
    setStockChangeVal(item.stock);
    setIsManageStockOpen(true);
  };

  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventory) return;

    setInventory((prev) =>
      prev.map((i) =>
        i.sku === selectedInventory.sku
          ? { ...i, stock: Math.max(0, stockChangeVal) }
          : i
      )
    );
    setIsManageStockOpen(false);
    setSelectedInventory(null);
  };

  const handleRemoveExpired = (sku: string) => {
    setInventory((prev) => prev.filter((i) => i.sku !== sku));
  };

  const handleOpenSupplier = (s: Supplier) => {
    setSelectedSupplier(s);
    setIsSupplierOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pharmacy Management"
        description="Comprehensive dispensary workflows, rich inventory control, and medical expiry tracking."
        actions={[
          { label: "Clinical Dashboard", href: "/clinic/dashboard" },
          { label: "Finance & Billing", href: "/clinic/finance", variant: "primary" },
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
            { id: "queue", name: "Prescription Queue", shortName: "Rx Queue", icon: ClipboardList },
            { id: "inventory", name: "Drug Inventory", shortName: "Inventory", icon: Pill },
            { id: "expiry", name: "Expiry Tracker", shortName: "Expiry", icon: AlertTriangle },
            { id: "suppliers", name: "Suppliers", shortName: "Suppliers", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PharmacyTab)}
                className={cn(
                  "group inline-flex items-center gap-1.5 sm:gap-2 border-b-2 py-3 sm:py-4 px-1 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "border-sky-500 text-sky-600"
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
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {activePrescriptions.length > 0 ? (
                activePrescriptions.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{p.patientName}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.id} • {p.date}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Stethoscope className="h-3 w-3" /> {p.provider}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">{p.items.length} meds</Badge>
                        <button onClick={() => handleOpenDispense(p)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                          Dispense
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-sm text-slate-500">No active prescriptions.</p>
              )}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Rx ID</TableHead>
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
                        <TableCell className="font-mono font-bold text-xs text-slate-500">{p.id}</TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">{p.patientName}</div>
                          <div className="text-xs text-slate-400 font-medium">ID: {p.patientId}</div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm font-medium flex items-center gap-1.5 mt-2">
                          <Stethoscope className="h-3.5 w-3.5" /> {p.provider}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{p.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">{p.items.length} Medications</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <button onClick={() => handleOpenDispense(p)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ml-auto">
                            <Syringe className="h-3 w-3" /> Review & Dispense
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                        No active prescriptions in the queue.
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
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Drug Inventory Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {inventory.map((i) => (
                <div key={i.sku} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{i.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{i.sku} • {i.category}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold text-slate-900">{i.stock} units</span>
                        <Badge variant="outline" className="text-[10px]">{i.dosageForm}</Badge>
                        {i.stock <= i.reorderLevel && <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">Low</Badge>}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{formatNGN(i.price)}</span>
                      <button onClick={() => handleOpenManageStock(i)}
                        className="px-2.5 py-1 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">SKU</TableHead>
                    <TableHead className="font-bold text-slate-700">Drug Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Category & Form</TableHead>
                    <TableHead className="font-bold text-slate-700">Stock Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Unit Price</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((i) => (
                    <TableRow key={i.sku} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-slate-500">{i.sku}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{i.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">{i.category}</Badge>
                          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">{i.dosageForm}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">{i.stock} units</span>
                          {i.stock <= i.reorderLevel && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 animate-pulse text-[10px]">Low Stock</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{formatNGN(i.price)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <button onClick={() => handleOpenManageStock(i)}
                          className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto">
                          <PackagePlus className="h-3 w-3" /> Manage
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <CardTitle className="text-lg font-bold text-slate-900">Medical Expiry Tracker</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {inventory.slice().sort((a, b) => daysToExpiry(a.expiryISO) - daysToExpiry(b.expiryISO)).map((i) => {
                const days = daysToExpiry(i.expiryISO);
                const status = getExpiryStatus(days);
                const isExpired = days < 0;
                return (
                  <div key={i.sku} className={cn("p-4", isExpired && "bg-rose-50/30")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{i.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{i.batchNumber} • {i.stock} units</p>
                        <p className="text-xs font-mono text-slate-500 mt-1">Exp: {i.expiryISO}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <Badge className={cn("border font-bold text-[10px] shadow-sm", status.class)}>{status.label}</Badge>
                        {isExpired ? (
                          <button onClick={() => handleRemoveExpired(i.sku)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">No action</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Drug Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Batch Number</TableHead>
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
                      <TableRow key={i.sku} className={cn("hover:bg-slate-50/50 transition-colors", isExpired && "bg-rose-50/30")}>
                        <TableCell className="font-bold text-slate-900 text-sm">{i.name}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-500">{i.batchNumber}</TableCell>
                        <TableCell className="font-mono text-sm font-black text-slate-900">{i.stock} units</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-800">{i.expiryISO}</TableCell>
                        <TableCell><Badge className={cn("border font-bold text-xs shadow-sm", status.class)}>{status.label}</Badge></TableCell>
                        <TableCell className="text-right pr-6">
                          {isExpired ? (
                            <button onClick={() => handleRemoveExpired(i.sku)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 ml-auto">
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          ) : <span className="text-xs text-slate-400 font-medium">No action needed</span>}
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
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Pharmacy Vendors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {suppliers.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.type} • {s.leadTime}</p>
                      <p className="text-xs font-mono text-slate-500 mt-1">{s.contact}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <Badge className={s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]" : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"}>{s.status}</Badge>
                      <button onClick={() => handleOpenSupplier(s)}
                        className="px-2.5 py-1 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Vendor Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Supply Profile</TableHead>
                    <TableHead className="font-bold text-slate-700">Contact</TableHead>
                    <TableHead className="font-bold text-slate-700">Avg Lead Time</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900 text-sm">{s.name}</TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{s.type}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{s.contact}</TableCell>
                      <TableCell className="font-bold text-slate-700 text-sm">{s.leadTime}</TableCell>
                      <TableCell>
                        <Badge className={s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <button onClick={() => handleOpenSupplier(s)}
                          className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto">
                          <Mail className="h-3 w-3" /> Contact
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
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
        title={`Dispense Prescription`}
        className="max-w-2xl"
      >
        <form onSubmit={handleConfirmDispense} className="space-y-6">
          {/* Patient Header */}
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Patient Details</p>
              <p className="text-lg font-black text-slate-900">{selectedPrescription?.patientName}</p>
              <p className="text-sm font-medium text-slate-600">ID: {selectedPrescription?.patientId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Prescriber</p>
              <p className="text-sm font-bold text-slate-900">{selectedPrescription?.provider}</p>
              <p className="text-xs font-mono text-slate-500">{selectedPrescription?.date}</p>
            </div>
          </div>

          {/* Rx Items List */}
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

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-amber-800">
              Confirming this action will mark the prescription as Completed and automatically deduct the dispensed quantities from the live inventory. This action cannot be easily undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDispenseOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm Dispense
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. MANAGE STOCK MODAL */}
      <Modal
        isOpen={isManageStockOpen}
        onClose={() => setIsManageStockOpen(false)}
        title={`Manage Stock`}
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
            <p className="text-xs text-slate-400 mt-2 text-center">Setting exact inventory count based on physical audit.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsManageStockOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-100 transition-colors"
            >
              Save Count
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. CONTACT VENDOR MODAL */}
      <Modal
        isOpen={isSupplierOpen}
        onClose={() => setIsSupplierOpen(false)}
        title={`Contact Vendor`}
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Contact</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{selectedSupplier?.contact}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Lead Time</span>
              <span className="text-sm font-bold text-slate-900">{selectedSupplier?.leadTime}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              onClick={() => setIsSupplierOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close Details
            </button>
            <a
              href={`mailto:${selectedSupplier?.contact}`}
              className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-100 transition-colors text-center inline-flex items-center justify-center"
            >
              Compose Email
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
