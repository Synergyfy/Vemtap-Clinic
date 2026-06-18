"use client";

import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const invoiceTotal = useMemo(
    () => selectedServices.reduce((total, service) => total + service.amount, 0),
    [selectedServices]
  );

  const filteredPatients = patients.filter((patient) =>
    [patient.name, patient.id, patient.provider].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const pendingHmoCount = hmoQueue.filter((item) => item.status !== "Approved").length;

  const addService = (service: (typeof serviceCatalog)[number]) => {
    setSelectedServices((current) => [...current, service]);
    setInvoiceStatus("Draft");
  };

  const removeService = (indexToRemove: number) => {
    setSelectedServices((current) => current.filter((_, index) => index !== indexToRemove));
    setInvoiceStatus("Draft");
  };

  const verifyHmo = (id: string) => {
    setHmoQueue((current) =>
      current.map((item) => item.id === id ? { ...item, status: "Approved" } : item)
    );
  };

  const generateInvoice = () => {
    setInvoiceStatus("Generated");
    setReceiptNumber(`INV-2026-${118 + selectedServices.length}`);
  };

  const collectPayment = () => {
    if (invoiceStatus === "Draft") generateInvoice();
    setInvoiceStatus("Paid");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & HMO Support</h1>
          <p className="text-slate-500 font-medium">Generate mock invoices, verify HMO requests, and collect frontend payments.</p>
        </div>
        <div className="flex items-center gap-3">
          {["Draft", "Generated", "Paid"].map((status) => (
            <div key={status} className={cn("px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest", invoiceStatus === status ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400")}>
              {status}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <aside className="xl:col-span-1 space-y-6">
          <section className="bg-white border border-slate-100 rounded-[3rem] p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-4">Patient Lookup</h2>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search patient..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold"
              />
            </div>
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setInvoiceStatus("Draft");
                  }}
                  className={cn("w-full p-4 rounded-2xl border text-left transition-all", selectedPatient.id === patient.id ? "bg-sky-50 border-sky-100" : "border-slate-100 hover:bg-slate-50")}
                >
                  <p className="text-xs font-black text-slate-900">{patient.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{patient.id} - {patient.provider}</p>
                </button>
              ))}
            </div>
          </section>

          <section id="hmo-queue" className="bg-amber-500 text-white rounded-[3rem] p-6 shadow-xl shadow-amber-500/20 scroll-mt-24">
            <ShieldCheck size={34} className="mb-4 opacity-90" />
            <h2 className="text-lg font-black">HMO Verification Queue</h2>
            <p className="text-xs text-white/80 font-medium mt-1 mb-5">{pendingHmoCount} mock approvals still need frontdesk action.</p>
            <div className="space-y-3">
              {hmoQueue.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white/15 border border-white/15">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black">{item.patient}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">{item.provider}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-white text-amber-700 px-2 py-1 rounded-full">{item.id}</span>
                  </div>
                  <p className="text-[10px] text-white/80 mt-3">{item.request}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn("flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest", item.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-white/15 text-white")}>{item.status}</span>
                    <button onClick={() => verifyHmo(item.id)} disabled={item.status === "Approved"} className="px-3 py-2 rounded-xl bg-white text-amber-700 text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 disabled:opacity-60">
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <main className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Invoice Builder</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Generate invoice</p>
              </div>
              <ReceiptText size={30} className="text-sky-600" />
            </div>

            <div className="p-8 space-y-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Patient</p>
                  <p className="text-lg font-black text-slate-900">{selectedPatient.name}</p>
                </div>
                <span className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest", selectedPatient.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                  {selectedPatient.plan} - {selectedPatient.provider}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceCatalog.map((service) => (
                  <button key={service.name} onClick={() => addService(service)} className="p-4 rounded-2xl border border-slate-100 hover:border-sky-100 hover:bg-sky-50/60 transition-all flex items-center justify-between gap-3 text-left">
                    <div>
                      <p className="text-xs font-black text-slate-900">{service.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{formatCurrency(service.amount)}</p>
                    </div>
                    <Plus size={16} className="text-sky-600" />
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {selectedServices.map((service, index) => (
                  <div key={`${service.name}-${index}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-400" />
                      <p className="text-sm font-bold text-slate-700">{service.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(service.amount)}</p>
                      <button onClick={() => removeService(index)} className="p-2 rounded-xl hover:bg-white text-slate-300 hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <section className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/20">
              <Wallet size={36} className="text-sky-400 mb-6" />
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Invoice Total</p>
              <p className="text-4xl font-black mt-1">{formatCurrency(invoiceTotal)}</p>
              <div className="mt-8 space-y-3">
                {["Cash", "Card", "Transfer", "HMO cover"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={cn("w-full p-4 rounded-2xl border text-left text-xs font-black uppercase tracking-widest transition-all", paymentMethod === method ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white/70 border-white/10")}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <button onClick={generateInvoice} className="mt-6 w-full py-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-500 flex items-center justify-center gap-2">
                <ReceiptText size={16} /> Generate Invoice
              </button>
              <button onClick={collectPayment} className="mt-3 w-full py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Collect Payment
              </button>
            </section>

            <section className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  {paymentMethod === "Cash" ? <Banknote size={22} /> : paymentMethod === "Card" ? <CreditCard size={22} /> : <BadgeCheck size={22} />}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Receipt Preview</h2>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Frontend mock</p>
                </div>
              </div>
              <div className="space-y-3 text-xs font-bold text-slate-600">
                <div className="flex justify-between"><span>Invoice</span><span>{receiptNumber}</span></div>
                <div className="flex justify-between"><span>Payment</span><span>{paymentMethod}</span></div>
                <div className="flex justify-between"><span>Status</span><span>{invoiceStatus}</span></div>
                <div className="flex justify-between pt-3 border-t border-slate-100 text-slate-900"><span>Total</span><span>{formatCurrency(invoiceTotal)}</span></div>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
