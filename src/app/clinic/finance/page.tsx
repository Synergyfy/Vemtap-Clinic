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
import { useModals } from "@/lib/modal-context";
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

  const paidInvoices = clinicInvoicesToday.filter((i) => i.status === "Paid");
  const pendingInvoices = clinicInvoicesToday.filter((i) => i.status === "Pending");
  const paidTotal = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "hmo", label: "HMO Claims", icon: Building2 },
    { id: "debtors", label: "Debtors", icon: Users },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Finance"
        description="Comprehensive revenue tracking, invoices, and payment management."
        actions={[
          { label: "Create Invoice", onClick: () => openModal("invoice"), variant: "primary" },
          { label: "Record Expense", onClick: () => openModal("expense") },
          { label: "Generate P&L", onClick: () => alert("Generating Profit & Loss statement..."), variant: "outline" },
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Revenue (Today)</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(paidTotal)}</p>
                <p className="mt-1 text-xs text-slate-500">From {paidInvoices.length} invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Outstanding</p>
                  <Filter className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-1 text-2xl font-bold text-rose-600">{formatNGN(pendingTotal)}</p>
                <p className="mt-1 text-xs text-slate-500">{pendingInvoices.length} pending payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">HMO Receivables</p>
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatNGN(clinicHmoClaims.reduce((acc, c) => acc + (c.status !== "Paid" ? c.amount : 0), 0))}
                </p>
                <p className="mt-1 text-xs text-slate-500">{clinicHmoClaims.filter(c => c.status !== "Paid").length} active claims</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Daily Expenses</p>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatNGN(clinicExpenses.filter(e => e.dateISO === "2026-05-26").reduce((acc, e) => acc + e.amount, 0))}
                </p>
                <p className="mt-1 text-xs text-slate-500">Operational costs today</p>
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
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Invoice Management</CardTitle>
              <p className="text-sm text-slate-500">Track and manage all patient billings.</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search invoice or patient..." 
                  className="pl-9 pr-4 py-2 text-sm border rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
                {clinicInvoicesToday.map((i) => (
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
                      <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => alert("Printing invoice " + i.id + "...")}>Print</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "hmo" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>HMO Claims & Receivables</CardTitle>
              <p className="text-sm text-slate-500">Manage insurance claims and track reimbursements.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => alert("Exporting claim schedule...")}>
              <Download className="h-4 w-4 mr-2" />
              Export Schedule
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "expenses" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Operational Expenses</CardTitle>
              <p className="text-sm text-slate-500">Track all clinic spending and utility payments.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => openModal("expense")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Transaction Ledger</CardTitle>
              <p className="text-sm text-slate-500">Real-time log of all incoming payments across all methods.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => alert("Downloading transaction ledger CSV...")}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
                      <Button variant="ghost" size="sm" onClick={() => alert("Generating receipt for " + i.id + "...")}>Receipt</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "debtors" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Outstanding Balances (Debtors)</CardTitle>
              <p className="text-sm text-slate-500">Patients with unpaid or partially paid invoices.</p>
            </div>
            <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => alert("Sending payment reminders to all debtors...")}>
              <Users className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
