"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useSettingsMap, useBulkSetSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import {
  Settings2, Building2, Palette, Bell, ShieldCheck, CreditCard,
  Globe, Save, Clock, ShieldAlert, Database, Eye, Key, Smartphone, Loader2,
  Coins, ArrowRightLeft, Plus, Trash2, Edit3, DollarSign, Check
} from "lucide-react";
import {
  useCurrencies,
  useCurrencyStats,
  useBaseCurrency,
  useCreateCurrency,
  useUpdateCurrency,
  useDeleteCurrency,
  useConvertAmount,
  type CurrencyConfig,
  type CurrencyCode,
} from "@/hooks/useCurrency";

type SettingsTab = "profile" | "branches" | "billing" | "currencies" | "branding" | "notifications" | "security";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings = {}, isLoading } = useSettingsMap();
  const bulkSetMut = useBulkSetSettings();

  // Currency hooks & state
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();
  const { data: currencyStats } = useCurrencyStats();
  const { data: baseCurrency } = useBaseCurrency();
  const createCurrencyMut = useCreateCurrency();
  const updateCurrencyMut = useUpdateCurrency();
  const deleteCurrencyMut = useDeleteCurrency();
  const convertAmountMut = useConvertAmount();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [backupModal, setBackupModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customizeModal, setCustomizeModal] = useState<string | null>(null);

  // Currency Modals & Forms
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyConfig | null>(null);

  const [currCode, setCurrCode] = useState<CurrencyCode>("USD");
  const [currSymbol, setCurrSymbol] = useState("$");
  const [currName, setCurrName] = useState("US Dollar");
  const [currLocale, setCurrLocale] = useState("en-US");
  const [currRate, setCurrRate] = useState<number>(0.00065);
  const [currIsBase, setCurrIsBase] = useState(false);
  const [currIsActive, setCurrIsActive] = useState(true);

  // FX Converter State
  const [convertAmountInput, setConvertAmountInput] = useState<number>(1000);
  const [convertFromCode, setConvertFromCode] = useState<string>("USD");
  const [convertToCode, setConvertToCode] = useState<string>("NGN");
  const [convertedResult, setConvertedResult] = useState<number | null>(null);

  // Form state
  type FormState = {
    clinic_name: string;
    registration_id: string;
    address: string;
    email: string;
    phone: string;
    currency: string;
    timezone: string;
    apply_vat: string;
    invoice_prefix: string;
    payment_terms: string;
    patient_deposits: string;
    auto_hmo_claims: string;
    lock_paid_invoices: string;
    sms_receipts: string;
    theme: string;
    primary_color: string;
    [key: string]: string;
  };

  const [form, setForm] = useState<FormState>({
    clinic_name: "", registration_id: "", address: "", email: "", phone: "",
    currency: "NGN", timezone: "(GMT+01:00) West Central Africa",
    apply_vat: "true", invoice_prefix: "VMT-", payment_terms: "Due on Receipt",
    patient_deposits: "true", auto_hmo_claims: "false", lock_paid_invoices: "true", sms_receipts: "false",
    theme: "light", primary_color: "#0284C7",
  });

  // Load settings into form
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setForm(prev => ({
        ...prev,
        clinic_name: settings.clinic_name || prev.clinic_name,
        registration_id: settings.registration_id || prev.registration_id,
        address: settings.address || prev.address,
        email: settings.email || prev.email,
        phone: settings.phone || prev.phone,
        currency: settings.currency || prev.currency,
        timezone: settings.timezone || prev.timezone,
        apply_vat: settings.apply_vat || prev.apply_vat,
        invoice_prefix: settings.invoice_prefix || prev.invoice_prefix,
        payment_terms: settings.payment_terms || prev.payment_terms,
        patient_deposits: settings.patient_deposits || prev.patient_deposits,
        auto_hmo_claims: settings.auto_hmo_claims || prev.auto_hmo_claims,
        lock_paid_invoices: settings.lock_paid_invoices || prev.lock_paid_invoices,
        sms_receipts: settings.sms_receipts || prev.sms_receipts,
        theme: settings.theme || prev.theme,
        primary_color: settings.primary_color || prev.primary_color,
      }));
    }
  }, [settings]);

  const tabs = [
    { id: "profile", label: "Clinic Profile", icon: Globe },
    { id: "branches", label: "Branch Settings", icon: Building2 },
    { id: "billing", label: "Billing & Taxes", icon: CreditCard },
    { id: "currencies", label: "Currencies & FX", icon: Coins },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Audit", icon: ShieldCheck },
  ];

  const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all";

  const toggle = (key: string) => setForm(f => ({ ...f, [key]: f[key] === "true" ? "false" : "true" }));

  const handleSave = () => {
    const settingsList = Object.entries(form).map(([key, value]) => ({ key, value, category: getTabCategory(key) }));
    bulkSetMut.mutate(settingsList, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
    });
  };

  const getTabCategory = (key: string): string => {
    if (["clinic_name", "registration_id", "address", "email", "phone", "currency", "timezone"].includes(key)) return "profile";
    if (["apply_vat", "invoice_prefix", "payment_terms", "patient_deposits", "auto_hmo_claims", "lock_paid_invoices", "sms_receipts"].includes(key)) return "billing";
    if (["theme", "primary_color"].includes(key)) return "branding";
    return "general";
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Settings & Configuration"
        description="Global control center: Tailor your clinic network's branding, financial rules, and security protocols."
        actions={[
          { label: "Backup Data", variant: "outline", onClick: () => setBackupModal(true) },
          { label: "Save All Changes", variant: "default", onClick: handleSave },
        ]}
      />

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          Settings saved successfully
        </div>
      )}

      {backupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Database size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Backup Started</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">You&apos;ll receive an email when complete.</p>
            <button onClick={() => setBackupModal(false)} className="w-full bg-slate-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors">Close</button>
          </div>
        </div>
      )}

      {customizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Customize {customizeModal}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Template Name</label>
                <input type="text" defaultValue={customizeModal} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Header Text</label>
                <textarea rows={3} className={`${inputClass} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCustomizeModal(null)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => setCustomizeModal(null)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}>
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6 pt-4">
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-6">General Information</h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Clinic Name</label>
                      <input type="text" value={form.clinic_name} onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Registration ID</label>
                      <input type="text" value={form.registration_id} onChange={e => setForm(f => ({ ...f, registration_id: e.target.value }))} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Headquarters Address</label>
                      <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Primary Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Contact Phone</label>
                      <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} />
                    </div>
                  </div>
                )}
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Regional Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Primary Currency</label>
                    <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className={inputClass}>
                      <option value="NGN">NGN (Naira)</option>
                      <option value="USD">USD (Dollar)</option>
                      <option value="GBP">GBP (Pound)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Default Timezone</label>
                    <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} className={inputClass}>
                      <option value="(GMT+01:00) West Central Africa">(GMT+01:00) West Central Africa</option>
                      <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Subscription Plan</p>
                <p className="text-2xl font-black mb-1">Enterprise Multi-Branch</p>
                <Badge className="bg-sky-500 text-white border-none font-black text-[10px] px-2 py-0.5">ACTIVE</Badge>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-white/60">
                    <span>Next Renewal</span><span>Jan 15, 2027</span>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinic Logo</p>
                <div className="w-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all">
                  <Palette size={24} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Change Image</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-sky-600" /> Invoicing & Taxation
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Apply VAT to all invoices</p>
                    <p className="text-[10px] text-slate-400 font-bold">Automatic 7.5% tax calculation</p>
                  </div>
                  <button onClick={() => toggle("apply_vat")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.apply_vat === "true" ? "bg-emerald-600" : "bg-slate-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.apply_vat === "true" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Invoice Prefix</label>
                  <input type="text" value={form.invoice_prefix} onChange={e => setForm(f => ({ ...f, invoice_prefix: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Default Payment Terms</label>
                  <select value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} className={inputClass}>
                    <option>Due on Receipt</option><option>Net 15</option><option>Net 30</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings2 size={20} className="text-emerald-600" /> Operational Billing Toggles
              </h3>
              <div className="space-y-4">
                {[
                  { key: "patient_deposits", label: "Enable Patient Deposits", desc: "Allow advance payments for procedures." },
                  { key: "auto_hmo_claims", label: "Automated HMO Claims", desc: "Generate claim forms on invoice finalization." },
                  { key: "lock_paid_invoices", label: "Lock Paid Invoices", desc: "Prevent edits to invoices after payment confirmation." },
                  { key: "sms_receipts", label: "SMS Receipt Delivery", desc: "Send link to digital receipt via WhatsApp/SMS." },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div className="max-w-[80%]">
                      <p className="text-sm font-bold text-slate-700">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</p>
                    </div>
                    <button onClick={() => toggle(item.key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form[item.key as keyof typeof form] === "true" ? "bg-emerald-600" : "bg-slate-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form[item.key as keyof typeof form] === "true" ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "branding" && (
          <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Patient-Facing Branding</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Configure how your clinic appears on reports, prescriptions, and portals.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Visual Style</p>
                <div className="pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Dashboard Theme</label>
                  <div className="flex gap-4">
                    <button onClick={() => setForm(f => ({ ...f, theme: "dark" }))} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${form.theme === "dark" ? "bg-slate-900 text-white ring-2 ring-sky-400 ring-offset-2" : "bg-slate-900 text-white"}`}>Dark</button>
                    <button onClick={() => setForm(f => ({ ...f, theme: "light" }))} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${form.theme === "light" ? "bg-slate-50 text-slate-900 ring-2 ring-sky-400 ring-offset-2" : "bg-slate-50 text-slate-400"}`}>Light</button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Document Templates</p>
                <div className="space-y-4">
                  {["Clinical Report", "Prescription Sheet", "Invoice Summary"].map(doc => (
                    <div key={doc} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-sky-600"><Eye size={16} /></div>
                        <span className="text-sm font-bold text-slate-700">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-sky-600" onClick={() => setCustomizeModal(doc)}>Customize</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
                <CardHeader className="px-8 py-6 border-b border-slate-50">
                  <CardTitle className="text-base sm:text-lg">Security Audit Log</CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500">Monitoring all administrative and clinical configuration changes.</p>
                </CardHeader>
                <div className="p-8 text-center text-sm text-slate-400">
                  <a href="/admin/security" className="text-sky-600 underline">View full audit log in Admin panel</a>
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white border border-rose-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="text-rose-400" size={20} />
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Compliance Status</p>
                </div>
                <p className="text-2xl font-black text-emerald-400 mb-2">HIPAA/NDPR Compliant</p>
                <p className="text-xs text-white/60 font-medium leading-relaxed mb-6">All sensitive patient data is encrypted at rest and masked in regional analytics views.</p>
              </Card>
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Access Control</p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Smartphone size={14} className="text-sky-600" /> Force 2FA Login</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Require all staff to use mobile verification codes.</p>
                  </div>
                  <div className="space-y-2 pt-6 border-t border-slate-50">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Database size={14} className="text-emerald-600" /> Data Retention</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">Active Policy: 7 Years (Digital Records)</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─── CURRENCIES & EXCHANGE RATES TAB ─── */}
        {activeTab === "currencies" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Currency</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {currencyStats?.base || baseCurrency?.code || "NGN"}
                  </span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    {baseCurrency?.symbol || "₦"} Primary
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">Default ledger accounting currency</p>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configured Currencies</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Coins size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {currencyStats?.total ?? currencies.length}
                </div>
                <p className="text-xs text-slate-400 mt-1">Available across billing and POS</p>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active FX Channels</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <ArrowRightLeft size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-700">
                  {currencyStats?.active ?? currencies.filter(c => c.isActive).length}
                </div>
                <p className="text-xs text-slate-400 mt-1">Enabled for multi-currency conversion</p>
              </Card>
            </div>

            {/* Live FX Converter Widget */}
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <ArrowRightLeft size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Multi-Currency FX Converter</h3>
                    <p className="text-xs text-slate-400">Instant real-time currency conversion based on clinic exchange rates.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount</label>
                  <input
                    type="number"
                    value={convertAmountInput}
                    onChange={(e) => setConvertAmountInput(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From Currency</label>
                  <select
                    value={convertFromCode}
                    onChange={(e) => setConvertFromCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} ({c.symbol} - {c.name})
                      </option>
                    ))}
                    {!currencies.some(c => c.code === "USD") && <option value="USD">USD ($)</option>}
                    {!currencies.some(c => c.code === "NGN") && <option value="NGN">NGN (₦)</option>}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">To Currency</label>
                  <select
                    value={convertToCode}
                    onChange={(e) => setConvertToCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} ({c.symbol} - {c.name})
                      </option>
                    ))}
                    {!currencies.some(c => c.code === "NGN") && <option value="NGN">NGN (₦)</option>}
                    {!currencies.some(c => c.code === "GBP") && <option value="GBP">GBP (£)</option>}
                  </select>
                </div>

                <div>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await convertAmountMut.mutateAsync({
                          amount: convertAmountInput,
                          from: convertFromCode,
                          to: convertToCode,
                        });
                        setConvertedResult(res);
                        toast.success("Amount converted successfully");
                      } catch (err: any) {
                        toast.error(err?.response?.data?.message || err?.message || "Conversion failed");
                      }
                    }}
                    disabled={convertAmountMut.isPending}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl h-10 text-xs shadow-sm"
                  >
                    {convertAmountMut.isPending ? "Converting..." : "Convert Amount"}
                  </Button>
                </div>
              </div>

              {convertedResult !== null && (
                <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Converted Value:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {convertedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {convertToCode}
                  </span>
                </div>
              )}
            </Card>

            {/* Currencies Directory Table */}
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Clinic Currency Configurations</h3>
                  <p className="text-xs text-slate-500">Configure base and secondary currencies with conversion rates to base.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrCode("USD");
                    setCurrSymbol("$");
                    setCurrName("US Dollar");
                    setCurrLocale("en-US");
                    setCurrRate(0.00065);
                    setCurrIsBase(false);
                    setCurrIsActive(true);
                    setAddCurrencyOpen(true);
                  }}
                  className="bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-xs"
                >
                  <Plus size={14} className="mr-1.5" />
                  Add Currency
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100">
                      <TableHead>Code</TableHead>
                      <TableHead>Currency Name</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Locale</TableHead>
                      <TableHead>Rate to Base</TableHead>
                      <TableHead>Base</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currenciesLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">Loading currencies...</TableCell>
                      </TableRow>
                    ) : currencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                          No currency configurations configured. Click "Add Currency" to set up your primary ledger currency.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currencies.map((curr) => (
                        <TableRow key={curr.id} className="border-slate-50 hover:bg-slate-50/70">
                          <TableCell className="font-mono font-bold text-slate-900">{curr.code}</TableCell>
                          <TableCell className="font-medium text-slate-800">{curr.name}</TableCell>
                          <TableCell className="font-bold text-slate-900 font-mono text-base">{curr.symbol}</TableCell>
                          <TableCell className="text-slate-500 font-mono text-xs">{curr.locale}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-slate-700">
                            {curr.isBase ? "1.000000 (Base)" : curr.exchangeRateToBase}
                          </TableCell>
                          <TableCell>
                            {curr.isBase ? (
                              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Base</Badge>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    await updateCurrencyMut.mutateAsync({
                                      id: curr.id,
                                      dto: { isBase: true },
                                    });
                                    toast.success(`${curr.code} set as base currency`);
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.message || "Failed to set base currency");
                                  }
                                }}
                                className="text-[11px] text-slate-400 hover:text-brand-navy hover:underline font-medium"
                              >
                                Set as Base
                              </button>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              curr.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                            )}>
                              {curr.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingCurrency(curr);
                                setCurrSymbol(curr.symbol);
                                setCurrName(curr.name);
                                setCurrLocale(curr.locale);
                                setCurrRate(curr.exchangeRateToBase);
                                setCurrIsBase(curr.isBase);
                                setCurrIsActive(curr.isActive);
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg mr-1 transition-all"
                              title="Edit Currency"
                            >
                              <Edit3 size={15} />
                            </button>
                            {!curr.isBase && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete currency configuration for ${curr.code}?`)) {
                                    try {
                                      await deleteCurrencyMut.mutateAsync(curr.id);
                                      toast.success(`Currency ${curr.code} removed`);
                                    } catch (err: any) {
                                      toast.error(err?.response?.data?.message || "Failed to delete currency");
                                    }
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Currency"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {(activeTab === "branches" || activeTab === "notifications") && (
          <Card className="p-20 text-center border-dashed bg-slate-50/30">
            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <Settings2 className="h-8 w-8 text-slate-300" />
            </div>
            <CardTitle className="text-xl mb-2 text-slate-900 font-black tracking-tight">Deep Module Config</CardTitle>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The detailed {activeTab} logic is currently migrating to the central configuration engine.
              <br />All global defaults are active.
            </p>
            <Button variant="default" className="mt-8 rounded-xl font-bold" onClick={() => setActiveTab("profile")}>Back to Profile</Button>
          </Card>
        )}
      </div>

      {/* ─── ADD CURRENCY MODAL ─── */}
      <Modal isOpen={addCurrencyOpen} onClose={() => setAddCurrencyOpen(false)} title="Configure New Currency">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createCurrencyMut.mutateAsync({
                code: currCode,
                symbol: currSymbol.trim(),
                name: currName.trim(),
                locale: currLocale.trim(),
                exchangeRateToBase: Number(currRate),
                isBase: currIsBase,
                isActive: currIsActive,
              });
              toast.success(`Currency ${currCode} added successfully`);
              setAddCurrencyOpen(false);
            } catch (err: any) {
              toast.error(err?.response?.data?.message || err?.message || "Failed to create currency");
            }
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Code *</label>
              <select
                value={currCode}
                onChange={(e) => {
                  const code = e.target.value as CurrencyCode;
                  setCurrCode(code);
                  if (code === "NGN") {
                    setCurrSymbol("₦");
                    setCurrName("Nigerian Naira");
                    setCurrLocale("en-NG");
                    setCurrRate(1);
                  } else if (code === "USD") {
                    setCurrSymbol("$");
                    setCurrName("US Dollar");
                    setCurrLocale("en-US");
                    setCurrRate(0.00065);
                  } else if (code === "EUR") {
                    setCurrSymbol("€");
                    setCurrName("Euro");
                    setCurrLocale("en-EU");
                    setCurrRate(0.00060);
                  } else if (code === "GBP") {
                    setCurrSymbol("£");
                    setCurrName("British Pound");
                    setCurrLocale("en-GB");
                    setCurrRate(0.00052);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
              >
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Symbol *</label>
              <input
                type="text"
                value={currSymbol}
                onChange={(e) => setCurrSymbol(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Name *</label>
              <input
                type="text"
                value={currName}
                onChange={(e) => setCurrName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Locale String *</label>
              <input
                type="text"
                placeholder="e.g. en-NG, en-US"
                value={currLocale}
                onChange={(e) => setCurrLocale(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Exchange Rate to Base *</label>
            <input
              type="number"
              step="any"
              value={currRate}
              onChange={(e) => setCurrRate(Number(e.target.value))}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Multiplied against base currency amount during conversion.</p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={currIsBase}
                onChange={(e) => setCurrIsBase(e.target.checked)}
                className="rounded text-brand-navy"
              />
              Set as Base Currency
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={currIsActive}
                onChange={(e) => setCurrIsActive(e.target.checked)}
                className="rounded text-brand-navy"
              />
              Active
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddCurrencyOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createCurrencyMut.isPending} className="bg-brand-navy text-white rounded-xl">
              {createCurrencyMut.isPending ? "Creating..." : "Create Currency"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── EDIT CURRENCY MODAL ─── */}
      <Modal isOpen={!!editingCurrency} onClose={() => setEditingCurrency(null)} title={`Edit ${editingCurrency?.code} Configuration`}>
        {editingCurrency && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await updateCurrencyMut.mutateAsync({
                  id: editingCurrency.id,
                  dto: {
                    symbol: currSymbol.trim(),
                    name: currName.trim(),
                    locale: currLocale.trim(),
                    exchangeRateToBase: Number(currRate),
                    isBase: currIsBase,
                    isActive: currIsActive,
                  },
                });
                toast.success(`Currency ${editingCurrency.code} updated`);
                setEditingCurrency(null);
              } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || "Failed to update currency");
              }
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currSymbol}
                  onChange={(e) => setCurrSymbol(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Locale</label>
                <input
                  type="text"
                  value={currLocale}
                  onChange={(e) => setCurrLocale(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Name</label>
              <input
                type="text"
                value={currName}
                onChange={(e) => setCurrName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Exchange Rate to Base</label>
              <input
                type="number"
                step="any"
                value={currRate}
                onChange={(e) => setCurrRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={currIsBase}
                  onChange={(e) => setCurrIsBase(e.target.checked)}
                  className="rounded text-brand-navy"
                />
                Set as Base Currency
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={currIsActive}
                  onChange={(e) => setCurrIsActive(e.target.checked)}
                  className="rounded text-brand-navy"
                />
                Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCurrency(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateCurrencyMut.isPending} className="bg-brand-navy text-white rounded-xl">
                {updateCurrencyMut.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
