"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useExpenses, useCreateExpense } from "@/hooks/useFinance";
import { useInvoices } from "@/hooks/useBilling";
import { useModals } from "@/lib/modal-context";
import { Modal } from "@/components/ui/modal";
import {
  Search, Plus, Download, Filter, TrendingUp, TrendingDown,
  Wallet, Receipt, Building2, Users, Loader2
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

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
  const { user } = useAuth();
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState("overview");

  // Backend hooks
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const createExpenseMut = useCreateExpense();

  // Local UI state
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilterOpen, setInvoiceFilterOpen] = useState(false);
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState("All");
  const [invoiceFilterDateFrom, setInvoiceFilterDateFrom] = useState("");
  const [invoiceFilterDateTo, setInvoiceFilterDateTo] = useState("");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<any>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: "utilities", amount: "", description: "", date: new Date().toISOString().slice(0, 10) });

  // Derived data
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");
  const pendingInvoices = invoices.filter((i: any) => i.status === "pending" || i.status === "partially_paid");
  const paidTotal = paidInvoices.reduce((acc: number, i: any) => acc + Number(i.totalAmount), 0);
  const pendingTotal = pendingInvoices.reduce((acc: number, i: any) => acc + Number(i.balance || i.totalAmount), 0);
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);

  const filteredInvoices = invoices.filter((i: any) => {
    const patientName = i.patient ? `${i.patient.firstName} ${i.patient.lastName}` : "";
    const matchesSearch = invoiceSearch === "" ||
      patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = invoiceFilterStatus === "All" || i.status === invoiceFilterStatus.toLowerCase();
    const dateStr = i.createdAt?.slice(0, 10) || "";
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

  const handleCreateExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) return;
    createExpenseMut.mutate({
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      date: expenseForm.date,
    }, {
      onSuccess: () => {
        setExpenseModalOpen(false);
        setExpenseForm({ category: "utilities", amount: "", description: "", date: new Date().toISOString().slice(0, 10) });
      },
    });
  };

  const handlePrintInvoice = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const items = invoice.items ? JSON.parse(invoice.items) : [];
    const itemsHtml = items.map((item: any) => `<tr><td>${item.item}</td><td>${formatNGN(item.amount)}</td></tr>`).join("");
    printWindow.document.write(`
      <html><head><title>Invoice ${invoice.invoiceNumber}</title>
      <style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{margin:0}.total{font-size:1.2em;font-weight:bold;text-align:right;margin-top:16px}</style>
      </head><body>
      <h1>Invoice ${invoice.invoiceNumber}</h1>
      <p><strong>Date:</strong> ${invoice.createdAt?.slice(0, 10)}</p>
      <p><strong>Status:</strong> ${invoice.status}</p>
      ${itemsHtml ? `<h2>Items</h2><table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ""}
      <p class="total">Total: ${formatNGN(invoice.totalAmount)}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const isLoadingData = expensesLoading || invoicesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Finance"
        description="Comprehensive revenue tracking, invoices, and expense management."
        actions={[
          { label: "Record Expense", onClick: () => setExpenseModalOpen(true) },
          { label: "Generate P&L", onClick: () => {
            const totalRevenue = paidTotal + pendingTotal;
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
              ...expenses.map((e: any) => `  ${e.category} (${e.id?.slice(0, 8)}): ${formatNGN(e.amount)} - ${e.description}`),
              `  Total Expenses: ${formatNGN(totalExpenses)}`,
              "",
              "========================",
              `NET PROFIT: ${formatNGN(totalRevenue - totalExpenses)}`,
            ].join("\n");
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "profit-and-loss.txt"; a.click();
            URL.revokeObjectURL(url);
          }, variant: "outline" as const },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}>
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
                  <p className="text-sm font-medium text-slate-500">Revenue (Paid)</p>
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
                  <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(totalExpenses)}</p>
                  <p className="mt-1 text-xs text-slate-500">{expenses.length} recorded</p>
                </div>
                <TrendingDown className="h-4 w-4 text-rose-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Net Profit</p>
                  <p className={`mt-1 text-2xl font-bold ${paidTotal - totalExpenses >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatNGN(paidTotal - totalExpenses)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Revenue - Expenses</p>
                </div>
                <Wallet className="h-4 w-4 text-blue-500 shrink-0" />
              </CardContent>
            </Card>
          </div>

          {/* Expenses by category */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    expenses.reduce((acc: Record<string, number>, e: any) => {
                      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 capitalize">{category}</span>
                      <span className="text-sm font-bold text-slate-900">{formatNGN(amount)}</span>
                    </div>
                  ))}
                  {expenses.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No expenses recorded</p>}
                </div>
              )}
            </CardContent>
          </Card>
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
                <input type="text" placeholder="Search invoices..."
                  className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={() => setInvoiceFilterOpen(!invoiceFilterOpen)} className="shrink-0">
                <Filter className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </CardHeader>
          {invoiceFilterOpen && (
            <div className="px-6 py-3 border-b bg-slate-50 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Status</label>
                <select className="text-sm border rounded-md px-2 py-1.5" value={invoiceFilterStatus} onChange={(e) => setInvoiceFilterStatus(e.target.value)}>
                  <option value="All">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">From</label>
                <input type="date" className="text-sm border rounded-md px-2 py-1.5" value={invoiceFilterDateFrom} onChange={(e) => setInvoiceFilterDateFrom(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">To</label>
                <input type="date" className="text-sm border rounded-md px-2 py-1.5" value={invoiceFilterDateTo} onChange={(e) => setInvoiceFilterDateTo(e.target.value)} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setInvoiceFilterStatus("All"); setInvoiceFilterDateFrom(""); setInvoiceFilterDateTo(""); }}>Clear</Button>
            </div>
          )}
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading...</TableCell></TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">No invoices found</TableCell></TableRow>
                ) : filteredInvoices.map((i: any) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.invoiceNumber}</TableCell>
                    <TableCell>{i.patient ? `${i.patient.firstName} ${i.patient.lastName}` : "N/A"}</TableCell>
                    <TableCell className="font-medium tabular-nums">{formatNGN(i.totalAmount)}</TableCell>
                    <TableCell>{statusBadge(i.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{i.createdAt?.slice(0, 10)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handlePrintInvoice(i)}>Print</Button>
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
              <p className="text-xs sm:text-sm text-slate-500">Real-time log of all incoming payments.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const csvData = paidInvoices.map((i: any) => ({
                "Invoice #": i.invoiceNumber,
                "Amount (NGN)": i.totalAmount,
                "Status": i.status,
                "Date": i.createdAt?.slice(0, 10),
              }));
              exportCSV(csvData, "transaction-ledger.csv");
            }} className="self-start">
              <Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Download CSV</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No payments recorded</TableCell></TableRow>
                ) : paidInvoices.map((i: any) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.invoiceNumber}</TableCell>
                    <TableCell className="font-bold text-emerald-600 tabular-nums">{formatNGN(i.totalAmount)}</TableCell>
                    <TableCell><Badge className="bg-emerald-100 text-emerald-700 border-none">Paid</Badge></TableCell>
                    <TableCell className="text-slate-500 text-sm">{i.createdAt?.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {activeTab === "hmo" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">HMO Claims & Receivables</CardTitle>
            <p className="text-xs sm:text-sm text-slate-500">Manage insurance claims and track reimbursements.</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 text-center py-8">HMO claims are managed in the <a href="/clinic/hmo-advanced" className="text-sky-600 underline">HMO Advanced</a> module.</p>
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
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No outstanding balances</TableCell></TableRow>
                ) : pendingInvoices.map((i: any) => (
                  <TableRow key={i.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{i.invoiceNumber}</TableCell>
                    <TableCell>{i.patient ? `${i.patient.firstName} ${i.patient.lastName}` : "N/A"}</TableCell>
                    <TableCell className="font-bold text-rose-600 tabular-nums">{formatNGN(i.balance || i.totalAmount)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-amber-600 border-amber-200">Payment Due</Badge></TableCell>
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
            <Button variant="default" size="sm" onClick={() => setExpenseModalOpen(true)} className="self-start">
              <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Add Expense</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Loading...</TableCell></TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No expenses recorded</TableCell></TableRow>
                ) : expenses.map((e: any) => (
                  <TableRow key={e.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6"><Badge variant="secondary" className="capitalize">{e.category}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.description}</TableCell>
                    <TableCell className="font-bold text-rose-600 tabular-nums">{formatNGN(e.amount)}</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.date?.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Record Expense">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={expenseForm.category} onChange={(e) => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
              <option value="utilities">Utilities</option>
              <option value="salary">Salary</option>
              <option value="supplies">Supplies</option>
              <option value="rent">Rent</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Amount (NGN)</label>
            <input type="number" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={expenseForm.amount} onChange={(e) => setExpenseForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <input type="text" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={expenseForm.description} onChange={(e) => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input type="date" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={expenseForm.date} onChange={(e) => setExpenseForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setExpenseModalOpen(false)}>Cancel</Button>
            <Button variant="default" size="sm" className="flex-1" onClick={handleCreateExpense} disabled={createExpenseMut.isPending}>
              {createExpenseMut.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              {createExpenseMut.isPending ? "Saving..." : "Record Expense"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Payment Receipt" className="max-w-md">
        {receiptInvoice && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <p className="text-lg font-bold text-slate-900">Payment Receipt</p>
              <p className="text-xs text-slate-500">Vemtap Clinic</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Invoice #</span><span className="font-medium">{receiptInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-emerald-600">{formatNGN(receiptInvoice.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{receiptInvoice.createdAt?.slice(0, 10)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span>{statusBadge(receiptInvoice.status)}</span></div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setReceiptModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Send Reminders Modal */}
      <Modal isOpen={reminderModalOpen} onClose={() => setReminderModalOpen(false)} title="Send Payment Reminders" className="max-w-md">
        {!reminderSent ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Send payment reminders to <strong>{pendingInvoices.length} debtors</strong>?</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setReminderModalOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" className="flex-1" onClick={() => setReminderSent(true)}>Confirm & Send</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-emerald-600" /></div>
            <p className="text-sm font-medium text-slate-900">Reminders Sent!</p>
            <Button variant="default" size="sm" className="w-full" onClick={() => setReminderModalOpen(false)}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
