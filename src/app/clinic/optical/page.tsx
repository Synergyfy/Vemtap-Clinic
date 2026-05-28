"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { clinicOpticalOrders as initialOrders, formatNGN, type ClinicOpticalOrder } from "@/app/clinic/_mock/clinic-data";
import {
  Glasses,
  Eye,
  Layers,
  Settings,
  DollarSign,
  Truck,
  TrendingUp,
  Building2,
  Package,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ClipboardList
} from "lucide-react";

function statusBadge(status: string) {
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready for Pickup</Badge>;
  if (status === "In production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (status === "Dispensed") return <Badge className="bg-slate-200 text-slate-700">Dispensed</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

// ----------------------------------------------------
// LOCAL CUSTOM MOCK DATA
// ----------------------------------------------------
const initialFrames = [
  { id: "FR-01", brand: "Tom Ford", model: "TF-5726 Titanium", type: "Full Rim", color: "Rose Gold", price: 78000, stock: 4, status: "Active" },
  { id: "FR-02", brand: "Ray-Ban", model: "Clubmaster Classic", type: "Semi-Rimless", color: "Tortoise Gold", price: 54000, stock: 12, status: "Active" },
  { id: "FR-03", brand: "Gucci", model: "GG-0824 Acetate", type: "Full Rim", color: "Gloss Black", price: 92000, stock: 1, status: "Low Stock" },
  { id: "FR-04", brand: "Oakley", model: "Holbrook Sport", type: "Rimless", color: "Matte Black", price: 62000, stock: 8, status: "Active" },
  { id: "FR-05", brand: "Prada", model: "PR-12V Elegant", type: "Cat-Eye", color: "Burgundy Red", price: 85000, stock: 0, status: "Out of Stock" },
];

const lensPricingRules = [
  { id: "LP-01", name: "Single Vision 1.56", index: "1.56", coatings: "Anti-Glare + UV400 Protection", privatePrice: 12000, axaCover: 10000, hygeiaCover: 12000 },
  { id: "LP-02", name: "Single Vision 1.61", index: "1.61", coatings: "Blue Cut + Smart Photochromic", privatePrice: 18000, axaCover: 15000, hygeiaCover: 15000 },
  { id: "LP-03", name: "Bifocal Flat-Top 1.56", index: "1.56", coatings: "Anti-Glare + Blue Shield Tech", privatePrice: 22000, axaCover: 15000, hygeiaCover: 18000 },
  { id: "LP-04", name: "Progressive Premium 1.67", index: "1.67", coatings: "Blue Cut + Smart Photochromic", privatePrice: 48000, axaCover: 30000, hygeiaCover: 35000 },
  { id: "LP-05", name: "Progressive Ultra-Thin 1.74", index: "1.74", coatings: "Anti-Reflective Double-Coated", privatePrice: 75000, axaCover: 45000, hygeiaCover: 50000 },
];

const initialInventory = [
  { sku: "OP-ACC-001", name: "Microfiber Lens Cleaning Cloths", stock: 142, reorderLevel: 50, location: "Drawer B2", category: "Accessory" },
  { sku: "OP-ACC-002", name: "Anti-Fog Lens Cleaning Spray (50ml)", stock: 12, reorderLevel: 25, location: "Shelf C1", category: "Accessory" },
  { sku: "OP-CASE-005", name: "Hard-shell Faux Leather Cases", stock: 45, reorderLevel: 20, location: "Drawer B4", category: "Case" },
  { sku: "OP-PART-012", name: "Silicone Anti-Slip Nose Pads (Pack of 50)", stock: 8, reorderLevel: 15, location: "Drawer A1", category: "Spare Part" },
  { sku: "OP-BLANK-156", name: "Uncut Lens Blanks 1.56 Spherical", stock: 60, reorderLevel: 30, location: "Cabinet D3", category: "Lens Blank" },
];

const labTrackingJobs = [
  { id: "TRK-901", patientName: "Chidi Okafor", orderId: "O-3301", lab: "Essilor Nigeria Lab", specs: "Progressive 1.67 Blue Cut", status: "Surfacing", dateSent: "2026-05-26", eta: "2026-05-29" },
  { id: "TRK-902", patientName: "Amina Musa", orderId: "O-3303", lab: "OptiMax Lab", specs: "Bifocal 1.56 Photochromic", status: "Coating", dateSent: "2026-05-27", eta: "2026-05-30" },
  { id: "TRK-903", patientName: "Babatunde Alao", orderId: "O-3304", lab: "Precision Optical Lab", specs: "Single Vision 1.56 Blue Cut", status: "Quality Check", dateSent: "2026-05-25", eta: "2026-05-28" },
];

const opticalSalesLedger = [
  { id: "TX-401", patientName: "Chidi Okafor", items: "Progressive Lens + Clinic Stock Frame", payer: "Private (POS)", amount: 132000, date: "2026-05-26", status: "Settled" },
  { id: "TX-402", patientName: "Adesuwa Okoro", items: "Single Vision Lens Update (Patient-Owned Frame)", payer: "HMO (AXA Mansard)", amount: 15000, date: "2026-05-24", status: "Settled" },
  { id: "TX-403", patientName: "Amina Musa", items: "Bifocal Lens + Clinic Stock Frame", payer: "HMO (Hygeia HMO)", amount: 76000, date: "2026-05-27", status: "Pending Claim" },
  { id: "TX-404", patientName: "Ifeanyi Nwosu", items: "Single Vision Lens + Designer Acetate Frame", payer: "Private (Transfer)", amount: 110000, date: "2026-05-25", status: "Settled" },
];

const supplierDirectory = [
  { id: "SUP-01", name: "Essilor Nigeria Lab", type: "Rx Prescription Lab", contact: "rxorders@essilor.com.ng", leadTime: "3-4 Days", rating: "★★★★★", status: "Primary Lab" },
  { id: "SUP-02", name: "OptiMax Laboratories Ltd", type: "Uncut Lens Supplier & Glazing", contact: "orders@optimax.ng", leadTime: "2-3 Days", rating: "★★★★☆", status: "Backup Lab" },
  { id: "SUP-03", name: "Precision Frames & Cases", type: "Designer Frame Wholesaler", contact: "sales@precisionframes.ng", leadTime: "1-2 Days", rating: "★★★★★", status: "Approved Supplier" },
];

type OpticalTab = "orders" | "frames" | "lens-pricing" | "inventory" | "tracking" | "sales" | "suppliers";

export default function OpticalPage() {
  const [orders, setOrders] = React.useState<ClinicOpticalOrder[]>(initialOrders);
  const [frames, setFrames] = React.useState(initialFrames);
  const [activeTab, setActiveTab] = React.useState<OpticalTab>("orders");

  // Manage Stock Modal States
  const [selectedFrame, setSelectedFrame] = React.useState<typeof initialFrames[0] | null>(null);
  const [isManageStockOpen, setIsManageStockOpen] = React.useState(false);
  const [stockChangeVal, setStockChangeVal] = React.useState<number>(0);

  // Summary Metrics
  const openCount = orders.filter((o) => o.status !== "Dispensed").length;
  const inProduction = orders.filter((o) => o.status === "In production").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;

  const updateOrderStatus = (id: string, newStatus: ClinicOpticalOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const getStockBadge = (status: string) => {
    if (status === "Active" || status === "Approved Supplier" || status === "Primary Lab") {
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Active</Badge>;
    }
    if (status === "Low Stock" || status === "Backup Lab") {
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Low Stock</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 border border-rose-200">Out of Stock</Badge>;
  };

  const getReorderBadge = (stock: number, reorder: number) => {
    if (stock <= reorder) {
      return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">Low Stock Alert</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-600 border border-slate-200">Sufficient</Badge>;
  };

  const handleOpenManageStock = (frame: typeof initialFrames[0]) => {
    // Sync current stock value from the live state, just in case it has been changed
    const currentLiveFrame = frames.find((f) => f.id === frame.id) || frame;
    setSelectedFrame(currentLiveFrame);
    setStockChangeVal(currentLiveFrame.stock);
    setIsManageStockOpen(true);
  };

  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFrame) return;

    setFrames((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFrame.id) return f;

        const newStock = Math.max(0, stockChangeVal);
        let newStatus = "Active";
        if (newStock === 0) newStatus = "Out of Stock";
        else if (newStock <= 2) newStatus = "Low Stock";

        return {
          ...f,
          stock: newStock,
          status: newStatus,
        };
      })
    );
    setIsManageStockOpen(false);
    setSelectedFrame(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Optical Management"
        description="Comprehensive lens orders pipeline, frames catalogs, custom lens tariffs, accessories inventory, laboratory tracking, and POS ledgers."
        actions={[
          { label: "Clinic Dashboard", href: "/clinic/dashboard" },
          { label: "Live Patient Queue", href: "/clinic/queue", variant: "primary" },
        ]}
      />

      {/* Metric Counters */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Lens Orders</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{openCount}</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
              <Glasses className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Lenses In Production</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{inProduction}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Wrench className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ready for Pickup</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 text-emerald-600">{readyCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation panel */}
      <div className="border-b border-slate-200 bg-white p-2 rounded-2xl shadow-sm border flex flex-wrap gap-1.5">
        {(
          [
            { id: "orders", label: "Lens Orders", icon: <Glasses className="h-4 w-4" /> },
            { id: "frames", label: "Frames Catalog", icon: <Eye className="h-4 w-4" /> },
            { id: "lens-pricing", label: "Lens Pricing & HMO", icon: <DollarSign className="h-4 w-4" /> },
            { id: "inventory", label: "Accessories Inventory", icon: <Layers className="h-4 w-4" /> },
            { id: "tracking", label: "Lab Tracking", icon: <Truck className="h-4 w-4" /> },
            { id: "sales", label: "Sales Ledger", icon: <TrendingUp className="h-4 w-4" /> },
            { id: "suppliers", label: "Supplier & Lab Directory", icon: <Building2 className="h-4 w-4" /> },
          ] as { id: OpticalTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "bg-sky-600 text-white shadow-md shadow-sky-100 scale-105"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-50",
            ].join(" ")}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. LENS ORDERS TAB */}
      {activeTab === "orders" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Active Patient Lens Orders</CardTitle>
            <p className="text-sm text-slate-500">Live tracker of patient optician orders in the production and dispensing pipeline.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Order ID</TableHead>
                    <TableHead className="font-bold text-slate-700">Patient Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Lens Specification</TableHead>
                    <TableHead className="font-bold text-slate-700">Frame Selection</TableHead>
                    <TableHead className="font-bold text-slate-700">Estimated Due Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Quick Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-bold text-slate-600">{o.id}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{o.patientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                          {o.lens}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{o.frame}</TableCell>
                      <TableCell className="tabular-nums text-slate-500 font-medium text-sm">{o.dueISO}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {o.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(o.id, "In production")}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1"
                            >
                              <Wrench className="h-3 w-3" /> Start Production
                            </button>
                          )}
                          {o.status === "In production" && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(o.id, "Ready")}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Mark Ready
                            </button>
                          )}
                          {o.status === "Ready" && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(o.id, "Dispensed")}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center gap-1"
                            >
                              <Package className="h-3 w-3" /> Dispense to Patient
                            </button>
                          )}
                          {o.status === "Dispensed" && (
                            <span className="text-xs text-slate-400 font-semibold px-2 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Order Closed
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. FRAMES CATALOG TAB */}
      {activeTab === "frames" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Frames Stock & Catalog</h3>
            <span className="text-xs font-medium text-slate-500">{frames.length} designer frame styles listed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frames.map((f) => (
              <Card key={f.id} className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-base">{f.brand}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{f.model}</p>
                    </div>
                    {getStockBadge(f.status)}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-b border-slate-100 py-3 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span>Frame Material / Type:</span>
                      <span className="text-slate-900 font-semibold">{f.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frame Color:</span>
                      <span className="text-slate-900 font-semibold">{f.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inventory Count:</span>
                      <span className="text-slate-900 font-black">{f.stock} units</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 border-t border-slate-150 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{formatNGN(f.price)}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenManageStock(f)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Settings className="h-3 w-3" /> Manage Stock
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. LENS PRICING & HMO TARIFF TAB */}
      {activeTab === "lens-pricing" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Custom Lens Pricing & HMO Coverage Index</CardTitle>
            <p className="text-sm text-slate-500">Global index of uncut lens specs, base private price, and HMO coverage brackets.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Lens Specification</TableHead>
                    <TableHead className="font-bold text-slate-700">Refractive Index</TableHead>
                    <TableHead className="font-bold text-slate-700">Standard Coatings</TableHead>
                    <TableHead className="font-bold text-slate-700">Base Private Price</TableHead>
                    <TableHead className="font-bold text-slate-700">AXA Cover Limit</TableHead>
                    <TableHead className="font-bold text-slate-700">Hygeia Cover Limit</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lensPricingRules.map((l) => (
                    <TableRow key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900 text-sm">{l.name}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-sky-700">{l.index}</TableCell>
                      <TableCell className="text-slate-600 text-xs font-semibold">{l.coatings}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{formatNGN(l.privatePrice)}</TableCell>
                      <TableCell className="text-emerald-700 font-bold text-sm bg-emerald-50/20">{formatNGN(l.axaCover)}</TableCell>
                      <TableCell className="text-emerald-700 font-bold text-sm bg-emerald-50/20">{formatNGN(l.hygeiaCover)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" /> Edit Tariff
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

      {/* 4. ACCESSORIES INVENTORY TAB */}
      {activeTab === "inventory" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Accessories, Cases, & Lens Blanks Inventory</CardTitle>
            <p className="text-sm text-slate-500">Real-time stock ledger of supporting optician components and laboratory lens blanks.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">SKU Code</TableHead>
                    <TableHead className="font-bold text-slate-700">Item Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Category</TableHead>
                    <TableHead className="font-bold text-slate-700">Stock Count</TableHead>
                    <TableHead className="font-bold text-slate-700">Reorder Threshold</TableHead>
                    <TableHead className="font-bold text-slate-700">Bin Location</TableHead>
                    <TableHead className="font-bold text-slate-700">Alert Level</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialInventory.map((i) => (
                    <TableRow key={i.sku} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-slate-500">{i.sku}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{i.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {i.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-black text-slate-900">{i.stock} units</TableCell>
                      <TableCell className="font-mono text-sm text-slate-500">{i.reorderLevel} units</TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{i.location}</TableCell>
                      <TableCell>
                        {i.stock <= i.reorderLevel ? (
                          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1 max-w-fit">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border border-slate-200">Sufficient</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Package className="h-3 w-3" /> Restock
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

      {/* 5. LAB TRACKING TAB */}
      {activeTab === "tracking" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">External Lab Shipments & Lens Pipeline</CardTitle>
            <p className="text-sm text-slate-500">Track complex surfacing, coatings, and glazing for prescription lenses outsourced to specialist labs.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Tracking Code</TableHead>
                    <TableHead className="font-bold text-slate-700">Patient Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Lab Partner</TableHead>
                    <TableHead className="font-bold text-slate-700">Lens Specification</TableHead>
                    <TableHead className="font-bold text-slate-700">Production Stage</TableHead>
                    <TableHead className="font-bold text-slate-700">Date Outbound</TableHead>
                    <TableHead className="font-bold text-slate-700">Expected Inbound</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labTrackingJobs.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-bold text-slate-600 text-xs">{t.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-sm">{t.patientName}</div>
                        <div className="text-xs text-slate-400 font-medium">Order ID: {t.orderId}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-sm">{t.lab}</TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{t.specs}</TableCell>
                      <TableCell>
                        <Badge className={[
                          "font-bold text-xs shadow-sm flex items-center gap-1 max-w-fit",
                          t.status === "Surfacing" ? "bg-indigo-50 border border-indigo-200 text-indigo-700" :
                          t.status === "Coating" ? "bg-amber-50 border border-amber-200 text-amber-700" :
                          "bg-emerald-50 border border-emerald-200 text-emerald-700 animate-pulse"
                        ].join(" ")}>
                          <Settings className="h-3 w-3 animate-spin-slow" /> {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{t.dateSent}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-800">{t.eta}</TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <ClipboardList className="h-3 w-3" /> Check Status
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

      {/* 6. SALES LEDGER TAB */}
      {activeTab === "sales" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Optical Sales & Revenue Ledger</CardTitle>
            <p className="text-sm text-slate-500">POS history showing private revenue collections and active HMO optical insurance claims.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Receipt Code</TableHead>
                    <TableHead className="font-bold text-slate-700">Patient Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Items Purchased</TableHead>
                    <TableHead className="font-bold text-slate-700">Payer Profile</TableHead>
                    <TableHead className="font-bold text-slate-700">Transaction Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Claim Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Total Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opticalSalesLedger.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-slate-500">{s.id}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">{s.patientName}</TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{s.items}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={[
                          "font-bold text-xs",
                          s.payer.startsWith("HMO") ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        ].join(" ")}>
                          {s.payer}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{s.date}</TableCell>
                      <TableCell>
                        <Badge className={[
                          "font-black text-xs",
                          s.status === "Settled" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800 animate-pulse"
                        ].join(" ")}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 font-bold text-slate-900 text-sm">{formatNGN(s.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. SUPPLIER DIRECTORY TAB */}
      {activeTab === "suppliers" && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-5">
            <CardTitle className="text-lg font-bold text-slate-900">Lab Partners & Material Suppliers</CardTitle>
            <p className="text-sm text-slate-500">Official repository of active laboratory outsourcing contacts, wholesale vendors, and lead times.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Vendor Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Supply Profile</TableHead>
                    <TableHead className="font-bold text-slate-700">Ordering Contact</TableHead>
                    <TableHead className="font-bold text-slate-700">Avg Lead Time</TableHead>
                    <TableHead className="font-bold text-slate-700">Agreement Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Vendor Rating</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierDirectory.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900 text-sm">{s.name}</TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{s.type}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{s.contact}</TableCell>
                      <TableCell className="font-bold text-slate-700 text-sm">{s.leadTime}</TableCell>
                      <TableCell>{getStockBadge(s.status)}</TableCell>
                      <TableCell className="text-amber-500 font-bold text-sm tracking-widest">{s.rating}</TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Building2 className="h-3 w-3" /> Contact Vendor
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

      {/* MANAGE STOCK DIALOG / MODAL */}
      <Modal
        isOpen={isManageStockOpen}
        onClose={() => setIsManageStockOpen(false)}
        title={`Manage Stock - ${selectedFrame?.brand || ""} (${selectedFrame?.model || ""})`}
      >
        <form onSubmit={handleSaveStockUpdate} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Frame Brand:</span>
              <span className="font-bold text-slate-900">{selectedFrame?.brand}</span>
            </div>
            <div className="flex justify-between">
              <span>Frame Model:</span>
              <span className="font-bold text-slate-900">{selectedFrame?.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Color / Material:</span>
              <span className="font-bold text-slate-900">{selectedFrame?.color} • {selectedFrame?.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Stock:</span>
              <span className="font-bold text-slate-900">{selectedFrame?.stock} units</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Update Stock Quantity</label>
            <div className="flex items-center gap-3 mt-1.5">
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
                className="w-full h-10 rounded-xl border border-slate-200 text-center font-bold text-slate-900 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 tabular-nums"
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
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              Save Stock Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
