"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { useLensOrders, useOpticalInventory, useOpticalSales, useUpdateLensOrderStatus } from "@/hooks/useOptician";
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
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function statusBadge(status: string) {
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready for Pickup</Badge>;
  if (status === "In production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (status === "Dispensed") return <Badge className="bg-slate-200 text-slate-700">Dispensed</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

// ----------------------------------------------------
// LOCAL STATIC DATA (no backend API yet)
// ----------------------------------------------------
const initialFrames = [
  { id: "FR-01", brand: "Tom Ford", model: "TF-5726 Titanium", type: "Full Rim", color: "Rose Gold", price: 78000, stock: 4, status: "Active" },
  { id: "FR-02", brand: "Ray-Ban", model: "Clubmaster Classic", type: "Semi-Rimless", color: "Tortoise Gold", price: 54000, stock: 12, status: "Active" },
  { id: "FR-03", brand: "Gucci", model: "GG-0824 Acetate", type: "Full Rim", color: "Gloss Black", price: 92000, stock: 1, status: "Low Stock" },
  { id: "FR-04", brand: "Oakley", model: "Holbrook Sport", type: "Rimless", color: "Matte Black", price: 62000, stock: 8, status: "Active" },
  { id: "FR-05", brand: "Prada", model: "PR-12V Elegant", type: "Cat-Eye", color: "Burgundy Red", price: 85000, stock: 0, status: "Out of Stock" },
];

type LensPricingRule = {
  id: string;
  name: string;
  index: string;
  coatings: string;
  basePrice: number;
  isActive: boolean;
};

const initialLensPricing: LensPricingRule[] = [
  { id: "LP-01", name: "Single Vision", index: "1.56", coatings: "Hard Coat, AR", basePrice: 12000, isActive: true },
  { id: "LP-02", name: "Single Vision", index: "1.61", coatings: "Hard Coat, AR, Blue Cut", basePrice: 18000, isActive: true },
  { id: "LP-03", name: "Single Vision", index: "1.67", coatings: "Hard Coat, AR, Blue Cut", basePrice: 24000, isActive: true },
  { id: "LP-04", name: "Bifocal", index: "1.56", coatings: "Hard Coat, AR", basePrice: 22000, isActive: true },
  { id: "LP-05", name: "Progressive", index: "1.56", coatings: "Hard Coat, AR, Blue Cut", basePrice: 45000, isActive: true },
  { id: "LP-06", name: "Progressive", index: "1.67", coatings: "Hard Coat, AR, Blue Cut", basePrice: 65000, isActive: true },
];

const initialProductionItems = [
  { id: "PRD-001", orderId: "O-3301", patient: "Chidi Okafor", lensType: "Progressive", frame: "Tom Ford TF-5726", stage: "Edging", assignedTo: "Lab Tech A", startedAt: "2026-05-26T09:00:00", status: "In Progress" },
  { id: "PRD-002", orderId: "O-3302", patient: "Adesuwa Okoro", lensType: "Single Vision", frame: "Patient-owned", stage: "Coating", assignedTo: "Lab Tech B", startedAt: "2026-05-26T11:30:00", status: "In Progress" },
  { id: "PRD-003", orderId: "O-3303", patient: "Amina Musa", lensType: "Bifocal", frame: "Ray-Ban Clubmaster", stage: "Surfacing", assignedTo: "Lab Tech A", startedAt: "2026-05-27T08:00:00", status: "Pending" },
];

const initialSalesData = [
  { id: "SAL-001", date: "2026-05-26", frame: "Tom Ford TF-5726", lens: "Progressive 1.67", customer: "Chidi Okafor", amount: 245000, payment: "POS", branch: "Vemtap Main" },
  { id: "SAL-002", date: "2026-05-26", frame: "Ray-Ban Clubmaster", lens: "Single Vision 1.61", customer: "Fatima Yusuf", amount: 185000, payment: "Transfer", branch: "Vemtap Ikeja" },
  { id: "SAL-003", date: "2026-05-25", frame: "Gucci GG-0824", lens: "Progressive 1.56", customer: "Ifeanyi Nwosu", amount: 285000, payment: "POS", branch: "Vemtap Main" },
  { id: "SAL-004", date: "2026-05-25", frame: "Oakley Holbrook", lens: "Single Vision 1.56", customer: "Kemi Balogun", amount: 155000, payment: "Cash", branch: "Vemtap Lekki" },
];

const initialSuppliers = [
  { id: "SUP-01", name: "LensCo Nigeria Ltd", contact: "Adebayo T.", phone: "0803 111 2233", email: "orders@lensco.ng", status: "Active", lastOrder: "2026-05-20" },
  { id: "SUP-02", name: "FrameWorld Importers", contact: "Chioma E.", phone: "0802 444 5566", email: "sales@frameworld.ng", status: "Active", lastOrder: "2026-05-18" },
  { id: "SUP-03", name: "Essilor West Africa", contact: "Kwame A.", phone: "0805 777 8899", email: "procurement@essilor.com.ng", status: "Active", lastOrder: "2026-05-24" },
];

type OpticalTab = "orders" | "frames" | "lens-pricing" | "inventory" | "lab" | "sales" | "suppliers";

export default function OpticalPage() {
  const { data: apiOrders = [], isLoading: loadingOrders } = useLensOrders();
  const { data: inventory = [] } = useOpticalInventory();
  const { data: sales = [] } = useOpticalSales();
  const updateStatus = useUpdateLensOrderStatus();

  const [activeTab, setActiveTab] = React.useState<OpticalTab>("orders");

  // Local state for orders (seeded from API)
  const [orders, setOrders] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (apiOrders.length > 0) setOrders(apiOrders);
  }, [apiOrders]);

  // Local state for frames
  const [frames] = React.useState(initialFrames);
  const [lensPricing] = React.useState(initialLensPricing);
  const [productionItems] = React.useState(initialProductionItems);
  const [salesData] = React.useState(initialSalesData);
  const [suppliers] = React.useState(initialSuppliers);

  // Stats
  const totalOrders = orders.length;
  const inProduction = orders.filter(o => o.status === "In production").length;
  const ready = orders.filter(o => o.status === "Ready").length;
  const dispensed = orders.filter(o => o.status === "Dispensed").length;
  const lowStockFrames = frames.filter(f => f.stock > 0 && f.stock < 5).length;
  const outOfStockFrames = frames.filter(f => f.stock === 0).length;
  const totalInventoryValue = frames.reduce((sum, f) => sum + f.price * f.stock, 0);
  const totalSalesToday = salesData.filter(s => s.date === "2026-05-26").reduce((sum, s) => sum + s.amount, 0);
  const pendingProduction = productionItems.filter(p => p.status === "Pending").length;

  // Handlers
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  // Filter/Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.lensType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFrames = frames.filter(f => {
    const matchesSearch = f.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredProduction = productionItems.filter(p => {
    const matchesSearch = p.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSales = salesData.filter(s => {
    const matchesSearch = s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.frame.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.contact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loadingOrders) {
    return (
      <div className="space-y-8">
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
    <div className="space-y-8">
      <PageHeader
        title="Optical"
        description="Lens orders, frames, inventory, lab tracking, sales & suppliers."
        actions={[
          { label: "New Order", onClick: () => {}, variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalOrders}</p>
            </div>
            <Glasses size={14} className="shrink-0 text-slate-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">In Production</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{inProduction}</p>
            </div>
            <Layers size={14} className="shrink-0 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Ready for Pickup</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{ready}</p>
            </div>
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Pending Production</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{pendingProduction}</p>
            </div>
            <Wrench size={14} className="shrink-0 text-sky-500" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {(
          [
            { id: "orders", label: "Orders", icon: Glasses },
            { id: "frames", label: "Frames", icon: Eye },
            { id: "lens-pricing", label: "Lens Pricing", icon: Settings },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "lab", label: "Lab Tracking", icon: Wrench },
            { id: "sales", label: "Sales Ledger", icon: DollarSign },
            { id: "suppliers", label: "Suppliers", icon: Building2 },
          ] as { id: OpticalTab; label: string; icon: any }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg font-bold">Lens Orders</CardTitle>
            <div className="flex gap-2 self-start">
              <input
                type="text"
                placeholder="Search patient, order ID, lens..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64 bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-100 transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-24">Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lens</TableHead>
                    <TableHead>Frame</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o: any) => (
                    <TableRow key={o.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.patientName}</TableCell>
                      <TableCell>{o.lensType}</TableCell>
                      <TableCell>{o.frameType}</TableCell>
                      <TableCell>{o.dueDate?.slice(0, 10)}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell>
                        <select
                          value={o.status}
                          onChange={e => handleUpdateStatus(o.id, e.target.value)}
                          className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium outline-none focus:ring-2 focus:ring-sky-100"
                        >
                          <option value="Draft">Draft</option>
                          <option value="In production">In production</option>
                          <option value="Ready">Ready</option>
                          <option value="Dispensed">Dispensed</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frames Tab */}
      {activeTab === "frames" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">Low Stock</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{lowStockFrames}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">Out of Stock</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{outOfStockFrames}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">Inventory Value</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(totalInventoryValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">Total Frames</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{frames.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg font-bold">Frame Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrames.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.id}</TableCell>
                        <TableCell>{f.brand}</TableCell>
                        <TableCell>{f.model}</TableCell>
                        <TableCell>{f.type}</TableCell>
                        <TableCell>{f.color}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(f.price)}</TableCell>
                        <TableCell className="tabular-nums">{f.stock}</TableCell>
                        <TableCell>
                          {f.status === "Active" && <Badge className="bg-emerald-600 text-white">Active</Badge>}
                          {f.status === "Low Stock" && <Badge className="bg-amber-600 text-white">Low Stock</Badge>}
                          {f.status === "Out of Stock" && <Badge className="bg-rose-600 text-white">Out of Stock</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lens Pricing Tab */}
      {activeTab === "lens-pricing" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Lens Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Index</TableHead>
                    <TableHead>Coatings</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lensPricing.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.id}</TableCell>
                      <TableCell>{l.name}</TableCell>
                      <TableCell className="tabular-nums">{l.index}</TableCell>
                      <TableCell>{l.coatings}</TableCell>
                      <TableCell className="tabular-nums">{formatNGN(l.basePrice)}</TableCell>
                      <TableCell>{l.isActive ? <Badge className="bg-emerald-600 text-white">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Optical Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((i: any) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.id}</TableCell>
                      <TableCell>{i.name}</TableCell>
                      <TableCell className="tabular-nums">{i.stock}</TableCell>
                      <TableCell className="tabular-nums">{i.reorderLevel}</TableCell>
                      <TableCell>{i.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lab Tracking Tab */}
      {activeTab === "lab" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Lab Production Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Production ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lens Type</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduction.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.orderId}</TableCell>
                      <TableCell>{p.patient}</TableCell>
                      <TableCell>{p.lensType}</TableCell>
                      <TableCell>{p.stage}</TableCell>
                      <TableCell>{p.assignedTo}</TableCell>
                      <TableCell>
                        {p.status === "In Progress" && <Badge className="bg-amber-600 text-white">In Progress</Badge>}
                        {p.status === "Pending" && <Badge variant="secondary">Pending</Badge>}
                        {p.status === "Completed" && <Badge className="bg-emerald-600 text-white">Completed</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Ledger Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">Sales Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(totalSalesToday)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Sales Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Frame</TableHead>
                      <TableHead>Lens</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Branch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="tabular-nums">{s.date}</TableCell>
                        <TableCell>{s.frame}</TableCell>
                        <TableCell>{s.lens}</TableCell>
                        <TableCell>{s.customer}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(s.amount)}</TableCell>
                        <TableCell>{s.payment}</TableCell>
                        <TableCell>{s.branch}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.id}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.contact}</TableCell>
                      <TableCell className="tabular-nums">{s.phone}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.status === "Active" ? <Badge className="bg-emerald-600 text-white">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                      <TableCell className="tabular-nums">{s.lastOrder}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}