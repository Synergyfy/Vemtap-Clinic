"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { 
  clinicInvoicesToday, 
  clinicHmoClaims, 
  clinicExpenses, 
  clinicRevenueHistory,
  formatNGN 
} from "@/app/clinic/_mock/clinic-data";
import type { ClinicInvoice } from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";
import { Modal } from "@/components/ui/modal";
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  Building2,
  Users
} from "lucide-react";

const exportCSV = (data: Record<string, any>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h]}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "approved") return <Badge className="bg-emerald-600 text-white">{status}</Badge>;
  if (s === "pending" || s === "submitted") return <Badge className="bg-amber-600 text-white">{status}</Badge>;
  if (s === "queried" || s === "rejected") return <Badge className="bg-rose-600 text-white">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export default function FinancePage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState("overview");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilterOpen, setInvoiceFilterOpen] = useState(false);
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState("All");
  const [invoiceFilterDateFrom, setInvoiceFilterDateFrom] = useState("");
  const [invoiceFilterDateTo, setInvoiceFilterDateTo] = useState("");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<ClinicInvoice | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const paidInvoices = clinicInvoicesToday.filter((i) => i.status === "Paid");
  const pendingInvoices = clinicInvoicesToday.filter((i) => i.status === "Pending");
  const paidTotal = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);

  const filteredInvoices = clinicInvoicesToday.filter((i) => {
    const matchesSearch = invoiceSearch === "" ||
      i.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      i.id.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = invoiceFilterStatus === "All" || i.status === invoiceFilterStatus;
    const dateStr = i.createdISO.slice(0, 10);
    const matchesDateFrom = !invoiceFilterDateFrom || dateStr >= invoiceFilterDateFrom;
    const matchesDateTo = !invoiceFilterDateTo || dateStr <= invoiceFilterDateTo;
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "hmo", label: "HMO Claims", icon: Building2 },
    { id: "debtors", label: "Debtors", icon: Users },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
  ];

  const handlePrintInvoice = (invoice: ClinicInvoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const itemsHtml = invoice.items
      ? invoice.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatNGN(item.price)}</td></tr>`).join("")
      : "";
    printWindow.document.write(`
      <html><head><title>Invoice ${invoice.id}</title>
      <style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{margin:0}h2{margin-top:24px}.total{font-size:1.2em;font-weight:bold;text-align:right;margin-top:16px}</style>
      </head><body>
      <h1>Invoice ${invoice.id}</h1>
      <p><strong>Patient:</strong> ${invoice.patientName}</p>
      <p><strong>Date:</strong> ${invoice.createdISO.slice(0, 10)}</p>
      <p><strong>Status:</strong> ${invoice.status}</p>
      <p><strong>Payment Method:</strong> ${invoice.method}</p>
      ${itemsHtml ? `<h2>Items</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ""}
      <p class="total">Total: ${formatNGN(invoice.amount)}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Finance"
        description="Comprehensive revenue tracking, invoices, and payment management."
        actions={[
          { label: "Create Invoice", onClick: () => openModal("invoice"), variant: "primary" },
          { label: "Record Expense", onClick: () => openModal("expense") },
          { label: "Generate P&L", onClick: () => {
            const totalRevenue = paidTotal + pendingTotal;
            const totalExpenses = clinicExpenses.reduce((acc, e) => acc + e.amount, 0);
            const netProfit = totalRevenue - totalExpenses;
            const content = [
              "PROFIT & LOSS STATEMENT",
              "========================",
              "",
              `Period: ${new Date().toLocaleDateString("en-NG")}`,
              "",
              "REVENUE",
              `  Paid Invoices:  ${formatNGN(paidTotal)}`,
              `  Pending Invoices: ${formatNGN(pendingTotal)}`,
              `  Total Revenue:  ${formatNGN(totalRevenue)}`,
              "",
              "EXPENSES",
              ...clinicExpenses.map(e => `  ${e.category} (${e.id}): ${formatNGN(e.amount)} - ${e.description}`),
              `  Total Expenses: ${formatNGN(totalExpenses)}`,
              "",
              "========================",
              `NET PROFIT: ${formatNGN(netProfit)}`,
            ].join("\n");
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "profit-and-loss.txt";
            a.click();
            URL.revokeObjectURL(url);
          }, variant: "outline" },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
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

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Revenue (Today)</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(paidTotal)}</p>
                  <p className="mt-1 text-xs text-slate-500">From {paidInvoices.length} invoices</p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Outstanding</p>
                  <p className="mt-1 text-2xl font-bold text-rose-600">{formatNGN(pendingTotal)}</p>
                  <p className="mt-1 text-xs text-slate-500">{pendingInvoices.length} pending payments</p>
                </div>
                <Filter className="h-4 w-4 text-amber-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">HMO Receivables</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNGN(clinicHmoClaims.reduce((acc, c) => acc + (c.status !== "Paid" ? c.amount : 0), 0))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{clinicHmoClaims.filter(c => c.status !== "Paid").length} active claims</p>
                </div>
                <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Daily Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNGN(clinicExpenses.filter(e => e.dateISO === "2026-05-26").reduce((acc, e) => acc + e.amount, 0))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Operational costs today</p>
                </div>
                <TrendingDown className="h-4 w-4 text-rose-500 shrink-0" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses (Last 5 Months)</CardTitle>
                <p className="text-sm text-slate-500">Visual breakdown of income categories and spending.</p>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center border-t">
                <div className="space-y-4 w-full px-4">
                  {clinicRevenueHistory.map((data) => (
                    <div key={data.month} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>{data.month}</span>
                        <span>{formatNGN(data.private + data.hmo)}</span>
                      </div>
                      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${((data.private + data.hmo) / 3000000) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-rose-400 opacity-50 absolute left-0" 
                          style={{ width: `${(data.expenses / 3000000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center space-x-4 pt-2 border-t">
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-500 font-medium">Revenue</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="text-[10px] text-slate-500 font-medium">Expenses</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Breakdown</CardTitle>
                <p className="text-sm text-slate-500">How your patients are paying today.</p>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col justify-center border-t space-y-6">
                {[
                  { label: "POS", amount: paidInvoices.filter(i => i.method === "POS").reduce((acc, i) => acc + i.amount, 0), color: "bg-blue-500" },
                  { label: "Bank Transfer", amount: paidInvoices.filter(i => i.method === "Transfer").reduce((acc, i) => acc + i.amount, 0), color: "bg-emerald-500" },
                  { label: "Cash", amount: paidInvoices.filter(i => i.method === "Cash").reduce((acc, i) => acc + i.amount, 0), color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">{formatNGN(item.amount)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`} 
                        style={{ width: `${(item.amount / paidTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Invoice Management</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Track and manage all patient billings.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search invoices..." 
                  className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setInvoiceFilterOpen(!invoiceFilterOpen)} className="shrink-0">
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </CardHeader>
          {invoiceFilterOpen && (
            <div className="px-6 py-3 border-b bg-slate-50 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Status</label>
                <select
                  className="text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={invoiceFilterStatus}
                  onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Voided">Voided</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">From</label>
                <input
                  type="date"
                  className="text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={invoiceFilterDateFrom}
                  onChange={(e) => setInvoiceFilterDateFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">To</label>
                <input
                  type="date"
                  className="text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={invoiceFilterDateTo}
                  onChange={(e) => setInvoiceFilterDateTo(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInvoiceFilterStatus("All");
                  setInvoiceFilterDateFrom("");
                  setInvoiceFilterDateTo("");
                }}
              >
                Clear
              </Button>
            </div>
          )}
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((i) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.id}</TableCell>
                    <TableCell>{i.patientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{i.payerType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">{formatNGN(i.amount)}</TableCell>
                    <TableCell>{statusBadge(i.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{i.createdISO.slice(0, 10)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openModal("invoice")}>View</Button>
                      <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handlePrintInvoice(i)}>Print</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {activeTab === "hmo" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">HMO Claims & Receivables</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Manage insurance claims and track reimbursements.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const csvData = clinicHmoClaims.map(c => ({
                "Claim ID": c.id,
                "HMO Provider": c.hmo,
                "Patient": c.patientName,
                "Amount (NGN)": c.amount,
                "Status": c.status,
                "Submitted On": c.submittedISO,
                "Details": c.claimDetails || "",
              }));
              exportCSV(csvData, "hmo-claims-schedule.csv");
            }} className="self-start">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Schedule</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Claim ID</TableHead>
                  <TableHead>HMO Provider</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="pr-6 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicHmoClaims.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.hmo}</TableCell>
                    <TableCell>{c.patientName}</TableCell>
                    <TableCell className="font-bold tabular-nums">{formatNGN(c.amount)}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{c.submittedISO}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openModal("claim")}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {activeTab === "expenses" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Operational Expenses</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Track all clinic spending and utility payments.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => openModal("expense")} className="self-start">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Expense ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicExpenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{e.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.description}</TableCell>
                    <TableCell className="font-bold text-rose-600 tabular-nums">{formatNGN(e.amount)}</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.dateISO}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openModal("expense")}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Transaction Ledger</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Real-time log of all incoming payments across all methods.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const csvData = paidInvoices.map(i => ({
                "Ref ID": i.id.replace("INV", "PAY"),
                "Invoice ID": i.id,
                "Patient": i.patientName,
                "Method": i.method,
                "Amount (NGN)": i.amount,
                "Status": "Success",
                "Date": i.createdISO.slice(0, 10),
                "Time": i.createdISO.split("T")[1]?.slice(0, 5) || "",
              }));
              exportCSV(csvData, "transaction-ledger.csv");
            }} className="self-start">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Ref ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidInvoices.map((i) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.id.replace("INV", "PAY")}</TableCell>
                    <TableCell>{i.patientName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-3 w-3 text-slate-400" />
                        <span>{i.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 tabular-nums">{formatNGN(i.amount)}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 border-none">Success</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{i.createdISO.split("T")[1].slice(0, 5)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setReceiptInvoice(i);
                        setReceiptModalOpen(true);
                      }}>Receipt</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {activeTab === "debtors" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Outstanding Balances</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Patients with unpaid or partially paid invoices.</p>
            </div>
            <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50 self-start" onClick={() => {
              setReminderSent(false);
              setReminderModalOpen(true);
            }}>
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send Reminders</span>
              <span className="sm:hidden">Remind</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Aging</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvoices.map((i) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.id}</TableCell>
                    <TableCell>{i.patientName}</TableCell>
                    <TableCell className="font-bold text-rose-600 tabular-nums">{formatNGN(i.amount)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">Today</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-200">Payment Due</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="primary" size="sm" onClick={() => openModal("transaction")}>Collect</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Payment Receipt" className="max-w-md">
        {receiptInvoice && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <p className="text-lg font-bold text-slate-900">Payment Receipt</p>
              <p className="text-xs text-slate-500">Vemtap Clinic</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt ID</span>
                <span className="font-medium">{receiptInvoice.id.replace("INV", "RCT")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice ID</span>
                <span className="font-medium">{receiptInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient</span>
                <span className="font-medium">{receiptInvoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-600">{formatNGN(receiptInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium">{receiptInvoice.createdISO.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-medium">{receiptInvoice.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span>{statusBadge(receiptInvoice.status)}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={() => {
                const printWindow = window.open("", "_blank");
                if (!printWindow) return;
                printWindow.document.write(`
                  <html><head><title>Receipt ${receiptInvoice.id}</title>
                  <style>body{font-family:sans-serif;padding:40px;text-align:center}h1{margin:0;font-size:1.5em}p{margin:4px 0}.line{border-top:1px dashed #ccc;margin:16px 0}.amt{font-size:1.4em;font-weight:bold}</style>
                  </head><body>
                  <h1>Vemtap Clinic</h1>
                  <p>Payment Receipt</p>
                  <div class="line"></div>
                  <p><strong>Receipt:</strong> ${receiptInvoice.id.replace("INV", "RCT")}</p>
                  <p><strong>Invoice:</strong> ${receiptInvoice.id}</p>
                  <p><strong>Patient:</strong> ${receiptInvoice.patientName}</p>
                  <p class="amt">${formatNGN(receiptInvoice.amount)}</p>
                  <p><strong>Date:</strong> ${receiptInvoice.createdISO.slice(0, 10)}</p>
                  <p><strong>Method:</strong> ${receiptInvoice.method}</p>
                  <div class="line"></div>
                  <p style="font-size:0.8em;color:#999">Thank you for your payment</p>
                  </body></html>
                `);
                printWindow.document.close();
                printWindow.print();
              }}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Send Reminders Confirmation Modal */}
      <Modal isOpen={reminderModalOpen} onClose={() => setReminderModalOpen(false)} title="Send Payment Reminders" className="max-w-md">
        {!reminderSent ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send payment reminders to <strong>{pendingInvoices.length} debtors</strong>?
            </p>
            <p className="text-xs text-slate-500">
              This will send an SMS and email notification to all patients with pending invoices totaling {formatNGN(pendingTotal)}.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={() => setReminderSent(true)}>
                Confirm & Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-900">Reminders Sent!</p>
            <p className="text-xs text-slate-500">
              Payment reminders have been sent to {pendingInvoices.length} debtors.
            </p>
            <Button variant="primary" size="sm" className="w-full" onClick={() => setReminderModalOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
