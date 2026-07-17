"use client";

import React, { useMemo, useState } from "react";
import {
  BadgeCheck, Banknote, CheckCircle2, CreditCard, FileText, Plus,
  ReceiptText, Search, ShieldCheck, Trash2, Wallet, X, ArrowRight,
  ChevronRight, Printer, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { motion, AnimatePresence } from "framer-motion";

const patients = [
  { id: "PT-2024-001", name: "Chidimma Okoro", plan: "HMO", provider: "Reliance Health" },
  { id: "PT-2024-002", name: "Babatunde Lawal", plan: "Private", provider: "Self-Pay" },
  { id: "PT-2024-003", name: "Yuki Tanaka", plan: "HMO", provider: "Axa Mansard" },
];

const serviceCatalog = [
  { name: "Eye consultation", amount: 12000 },
  { name: "Eye test / refraction", amount: 8000 },
  { name: "Lens purchase deposit", amount: 35000 },
  { name: "Frame selection deposit", amount: 25000 },
  { name: "Lens pickup balance", amount: 18000 },
];

const initialHmoQueue = [
  { id: "HMO-901", patient: "Chidimma Okoro", provider: "Reliance Health", request: "Eye consultation", status: "Pending approval" },
  { id: "HMO-902", patient: "Yuki Tanaka", provider: "Axa Mansard", request: "Follow-up + refraction", status: "Documents needed" },
  { id: "HMO-903", patient: "Emeka Obi", provider: "Hygeia", request: "Emergency care", status: "Escalated" },
];

const formatCurrency = (value: number) => `NGN ${value.toLocaleString("en-NG")}`;

export default function BillingPage() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [selectedServices, setSelectedServices] = useState([serviceCatalog[0], serviceCatalog[1]]);
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [invoiceStatus, setInvoiceStatus] = useState<"Draft" | "Generated" | "Paid">("Draft");
  const [query, setQuery] = useState("");
  const [hmoQueue, setHmoQueue] = useState(initialHmoQueue);
  const [receiptNumber, setReceiptNumber] = useState("INV-2026-118");
  const [toast, setToast] = useState("");

  // Modal states
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCollect, setShowCollect] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHmoDetail, setShowHmoDetail] = useState<any>(null);

  const invoiceTotal = useMemo(
    () => selectedServices.reduce((total, service) => total + service.amount, 0),
    [selectedServices]
  );

  const filteredPatients = patients.filter((patient) =>
    [patient.name, patient.id, patient.provider].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const pendingHmoCount = hmoQueue.filter((item) => item.status !== "Approved").length;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const addService = (service: (typeof serviceCatalog)[number]) => {
    if (selectedServices.find(s => s.name === service.name)) {
      showToast(`${service.name} already added`);
      return;
    }
    setSelectedServices((current) => [...current, service]);
    setInvoiceStatus("Draft");
    showToast(`${service.name} added`);
  };

  const removeService = (indexToRemove: number) => {
    const removed = selectedServices[indexToRemove];
    setSelectedServices((current) => current.filter((_, index) => index !== indexToRemove));
    setInvoiceStatus("Draft");
    showToast(`${removed.name} removed`);
  };

  const verifyHmo = (id: string) => {
    setHmoQueue((current) =>
      current.map((item) => item.id === id ? { ...item, status: "Approved" } : item)
    );
    showToast("HMO request approved");
  };

  const handleGenerateInvoice = () => {
    setInvoiceStatus("Generated");
    setReceiptNumber(`INV-2026-${118 + selectedServices.length}`);
    setShowGenerate(false);
    showToast("Invoice generated");
  };

  const handleCollectPayment = () => {
    if (invoiceStatus === "Draft") {
      setReceiptNumber(`INV-2026-${118 + selectedServices.length}`);
      setInvoiceStatus("Generated");
    }
    setInvoiceStatus("Paid");
    setShowCollect(false);
    showToast(`Payment collected via ${paymentMethod}`);
  };

  const paymentIcons: Record<string, typeof Banknote> = {
    Cash: Banknote, Card: CreditCard, Transfer: BadgeCheck, "HMO cover": ShieldCheck,
  };
  const PaymentIcon = paymentIcons[paymentMethod] || Banknote;

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Billing & HMO</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Generate invoices, verify HMO, collect payments.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {(["Draft", "Generated", "Paid"] as const).map((status) => (
            <button key={status} onClick={() => setInvoiceStatus(status)}
              className={cn("px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl border text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all", invoiceStatus === status ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-sky-200")}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-8">
        {/* Sidebar */}
        <aside className="xl:col-span-1 space-y-4 sm:space-y-6">
          {/* Patient Lookup */}
          <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-3 sm:mb-4">Patient Lookup</h2>
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient..."
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {filteredPatients.map((patient) => (
                <button key={patient.id} onClick={() => { setSelectedPatient(patient); setInvoiceStatus("Draft"); showToast(`${patient.name} selected`); }}
                  className={cn("w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl border text-left transition-all", selectedPatient.id === patient.id ? "bg-sky-50 border-sky-100" : "border-slate-100 hover:bg-slate-50")}>
                  <p className="text-xs font-black text-slate-900 truncate">{patient.name}</p>
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 sm:mt-1 truncate">{patient.id} &bull; {patient.provider}</p>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No patients found</p>
              )}
            </div>
          </section>

          {/* HMO Queue */}
          <section id="hmo-queue" className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 shadow-xl shadow-amber-500/20 scroll-mt-24">
            <ShieldCheck size={24} className="mb-3 opacity-90" />
            <h2 className="text-base sm:text-lg font-black">HMO Queue</h2>
            <p className="text-[10px] sm:text-xs text-white/80 font-medium mt-0.5 sm:mt-1 mb-3 sm:mb-5">{pendingHmoCount} pending approvals</p>
            <div className="space-y-2 sm:space-y-3">
              {hmoQueue.map((item) => (
                <div key={item.id} onClick={() => setShowHmoDetail(item)}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-white/15 border border-white/15 cursor-pointer hover:bg-white/20 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black truncate">{item.patient}</p>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/60 truncate">{item.provider}</p>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest bg-white text-amber-700 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">{item.id}</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-white/80 mt-1.5 sm:mt-2">{item.request}</p>
                  <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                    <span className={cn("flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-center", item.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-white/15 text-white")}>{item.status}</span>
                    {item.status !== "Approved" && (
                      <button onClick={(e) => { e.stopPropagation(); verifyHmo(item.id); }}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white text-amber-700 text-[7px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all">Verify</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Main */}
        <main className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Invoice Builder */}
          <section className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900">Invoice Builder</h2>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">Generate invoice</p>
              </div>
              <ReceiptText size={24} className="text-sky-600 shrink-0" />
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-8">
              {/* Selected patient */}
              <div className="p-3 sm:p-5 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Patient</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 truncate">{selectedPatient.name}</p>
                </div>
                <span className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center shrink-0", selectedPatient.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                  {selectedPatient.plan} &bull; {selectedPatient.provider}
                </span>
              </div>

              {/* Service catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {serviceCatalog.map((service) => (
                  <button key={service.name} onClick={() => addService(service)}
                    className="p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-100 hover:border-sky-100 hover:bg-sky-50/60 transition-all flex items-center justify-between gap-2 text-left">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-black text-slate-900 truncate">{service.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-0.5">{formatCurrency(service.amount)}</p>
                    </div>
                    <Plus size={14} className="text-sky-600 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Selected services */}
              <div className="space-y-2 sm:space-y-3">
                {selectedServices.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl sm:rounded-2xl">
                    <FileText size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">No services selected</p>
                    <p className="text-[9px] font-medium mt-1">Click a service above to add it</p>
                  </div>
                ) : (
                  selectedServices.map((service, index) => (
                    <div key={`${service.name}-${index}`}
                      className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <FileText size={14} className="text-slate-400 shrink-0" />
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{service.name}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900">{formatCurrency(service.amount)}</p>
                        <button onClick={() => removeService(index)}
                          className="p-1.5 sm:p-2 rounded-lg hover:bg-white text-slate-300 hover:text-rose-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Side panel */}
          <aside className="space-y-4 sm:space-y-8">
            {/* Invoice Total */}
            <section className="bg-slate-900 text-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-xl shadow-slate-900/20">
              <Wallet size={28} className="text-sky-400 mb-4 sm:mb-6" />
              <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest">Invoice Total</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatCurrency(invoiceTotal)}</p>
              <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-3">
                {["Cash", "Card", "Transfer", "HMO cover"].map((method) => (
                  <button key={method} onClick={() => { setPaymentMethod(method); showToast(`Payment method: ${method}`); }}
                    className={cn("w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl border text-left text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all", paymentMethod === method ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20")}>
                    {method}
                  </button>
                ))}
              </div>
              <button onClick={() => selectedServices.length === 0 ? showToast("Add at least one service first") : setShowGenerate(true)}
                className="mt-4 sm:mt-6 w-full py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-500 flex items-center justify-center gap-2 transition-all">
                <ReceiptText size={14} /> Generate Invoice
              </button>
              <button onClick={() => invoiceTotal === 0 ? showToast("Invoice has no services") : setShowCollect(true)}
                disabled={invoiceTotal === 0}
                className="mt-2 sm:mt-3 w-full py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-500 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                <CheckCircle2 size={14} /> Collect Payment
              </button>
            </section>

            {/* Receipt Preview — clickable */}
            <button onClick={() => setShowReceipt(true)}
              className="w-full bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-sm text-left hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <PaymentIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900">Receipt Preview</h2>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{receiptNumber}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 ml-auto shrink-0" />
              </div>
              <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs font-bold text-slate-600">
                <div className="flex justify-between"><span>Payment</span><span>{paymentMethod}</span></div>
                <div className="flex justify-between"><span>Status</span>
                  <span className={cn(invoiceStatus === "Paid" ? "text-emerald-600" : invoiceStatus === "Generated" ? "text-amber-600" : "text-slate-400")}>{invoiceStatus}</span>
                </div>
                <div className="flex justify-between pt-2 sm:pt-3 border-t border-slate-100 text-slate-900 font-black">
                  <span>Total</span><span>{formatCurrency(invoiceTotal)}</span>
                </div>
              </div>
            </button>
          </aside>
        </main>
      </div>

      {/* Generate Invoice Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Invoice">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0"><ReceiptText size={24} /></div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedPatient.name}</h4>
              <p className="text-xs text-slate-500">{selectedPatient.plan} &bull; {selectedPatient.provider}</p>
            </div>
          </div>
          <div className="space-y-2">
            {selectedServices.map((s, i) => (
              <div key={i} className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-700">{s.name}</span>
                <span className="text-xs sm:text-sm font-black text-slate-900">{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-900 text-white">
            <span className="text-xs sm:text-sm font-bold">Total</span>
            <span className="text-xs sm:text-sm font-black">{formatCurrency(invoiceTotal)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleGenerateInvoice}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
              <ReceiptText size={14} /> Confirm & Generate
            </button>
            <button onClick={() => setShowGenerate(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal isOpen={showCollect} onClose={() => setShowCollect(false)} title="Collect Payment">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><Wallet size={24} /></div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedPatient.name}</h4>
              <p className="text-xs text-slate-500">{paymentMethod} &bull; {receiptNumber}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{formatCurrency(invoiceTotal)}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <PaymentIcon size={16} className="text-sky-600" />
              <span className="text-xs font-bold text-slate-600">{paymentMethod}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleCollectPayment}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Confirm {paymentMethod} Payment
            </button>
            <button onClick={() => setShowCollect(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Receipt Detail Modal */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Receipt Details">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PaymentIcon size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-black text-slate-900">{receiptNumber}</h4>
                <p className="text-xs text-slate-500">{selectedPatient.name}</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-bold">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Patient</span>
                <span className="text-slate-900">{selectedPatient.name}</span>
              </div>
              {selectedServices.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-500">{s.name}</span>
                  <span className="text-slate-900">{formatCurrency(s.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-black">
                <span>Total</span>
                <span>{formatCurrency(invoiceTotal)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-400">Payment</span>
                <span className="text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={cn(invoiceStatus === "Paid" ? "text-emerald-600" : invoiceStatus === "Generated" ? "text-amber-600" : "text-slate-400")}>{invoiceStatus}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { window.print(); }}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
              <Printer size={14} /> Print Receipt
            </button>
            <button onClick={() => setShowReceipt(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        </div>
      </Modal>

      {/* HMO Detail Modal */}
      <Modal isOpen={!!showHmoDetail} onClose={() => setShowHmoDetail(null)} title="HMO Request Details">
        {showHmoDetail && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0"><ShieldCheck size={24} /></div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{showHmoDetail.patient}</h4>
                <p className="text-xs text-slate-500">{showHmoDetail.provider} &bull; {showHmoDetail.id}</p>
              </div>
              <span className={cn("px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", showHmoDetail.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{showHmoDetail.status}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Request</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{showHmoDetail.request}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Provider</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{showHmoDetail.provider}</span>
              </div>
            </div>
            {showHmoDetail.status !== "Approved" ? (
              <button onClick={() => { verifyHmo(showHmoDetail.id); setShowHmoDetail(null); }}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> Approve Request
              </button>
            ) : (
              <button onClick={() => setShowHmoDetail(null)}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700">Close</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
