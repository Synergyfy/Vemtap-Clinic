"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { cn } from "@/lib/utils";
import { 
  Settings2, 
  Building2, 
  Palette, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Globe, 
  Save,
  Clock,
  ShieldAlert,
  Database,
  Eye,
  Key,
  Smartphone
} from "lucide-react";

type SettingsTab = "profile" | "branches" | "billing" | "branding" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [backupModal, setBackupModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applyVat, setApplyVat] = useState(true);
  const [patientDeposits, setPatientDeposits] = useState(true);
  const [autoHmoClaims, setAutoHmoClaims] = useState(false);
  const [lockPaidInvoices, setLockPaidInvoices] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [customizeModal, setCustomizeModal] = useState<string | null>(null);

  const tabs = [
    { id: "profile", label: "Clinic Profile", icon: Globe },
    { id: "branches", label: "Branch Settings", icon: Building2 },
    { id: "billing", label: "Billing & Taxes", icon: CreditCard },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Audit", icon: ShieldCheck },
  ];

  const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all";

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Settings & Configuration"
        description="Global control center: Tailor your clinic network's branding, financial rules, and security protocols."
        actions={[
          { label: "Backup Data", variant: "outline", onClick: () => setBackupModal(true) },
          { label: "Save All Changes", variant: "primary", onClick: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); } },
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
            <button
              onClick={() => setBackupModal(false)}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
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
                <input
                  type="text"
                  defaultValue={customizeModal}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Header Text</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Footer Text</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCustomizeModal(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCustomizeModal(null)}
                className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
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

      <div className="space-y-6 pt-4">
        {activeTab === "profile" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Clinic Name</label>
                          <input type="text" defaultValue="Vemtap Eye Specialist" className={inputClass} />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Registration ID</label>
                          <input type="text" defaultValue="RC-882901-X" className={inputClass} />
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Headquarters Address</label>
                          <input type="text" defaultValue="Plot 12, Admiralty Way, Lekki Phase 1, Lagos" className={inputClass} />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Primary Email</label>
                          <input type="email" defaultValue="admin@vemtap.com" className={inputClass} />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Contact Phone</label>
                          <input type="text" defaultValue="+234 800 VEMTAP" className={inputClass} />
                       </div>
                    </div>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Regional Localization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Primary Currency</label>
                          <select className={inputClass}>
                             <option>NGN (Naira)</option>
                             <option>USD (Dollar)</option>
                             <option>GBP (Pound)</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Default Timezone</label>
                          <select className={inputClass}>
                             <option>(GMT+01:00) West Central Africa</option>
                             <option>(GMT+00:00) London</option>
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
                          <span>Next Renewal</span>
                          <span>Jan 15, 2027</span>
                       </div>
                        <Button
                          className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl border-none font-bold"
                          onClick={() => window.open("https://billing.vemtap.com", "_blank")}
                        >
                          Manage Billing
                        </Button>
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
                    <CreditCard size={20} className="text-sky-600" />
                    Invoicing & Taxation
                 </h3>
                 <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                           <p className="text-sm font-bold text-slate-700">Apply VAT to all invoices</p>
                           <p className="text-[10px] text-slate-400 font-bold">Automatic 7.5% tax calculation</p>
                        </div>
                        <button onClick={() => setApplyVat(!applyVat)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${applyVat ? "bg-emerald-600" : "bg-slate-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${applyVat ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                     </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Invoice Prefix</label>
                       <input type="text" defaultValue="VMT-" className={inputClass} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Default Payment Terms</label>
                       <select className={inputClass}>
                          <option>Due on Receipt</option>
                          <option>Net 15</option>
                          <option>Net 30</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Settings2 size={20} className="text-emerald-600" />
                    Operational Billing Toggles
                 </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between py-4 border-b border-slate-50">
                        <div className="max-w-[80%]">
                           <p className="text-sm font-bold text-slate-700">Enable Patient Deposits</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Allow advance payments for procedures.</p>
                        </div>
                        <button onClick={() => setPatientDeposits(!patientDeposits)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${patientDeposits ? "bg-emerald-600" : "bg-slate-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${patientDeposits ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between py-4 border-b border-slate-50">
                        <div className="max-w-[80%]">
                           <p className="text-sm font-bold text-slate-700">Automated HMO Claims</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Generate claim forms on invoice finalization.</p>
                        </div>
                        <button onClick={() => setAutoHmoClaims(!autoHmoClaims)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoHmoClaims ? "bg-emerald-600" : "bg-slate-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoHmoClaims ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between py-4 border-b border-slate-50">
                        <div className="max-w-[80%]">
                           <p className="text-sm font-bold text-slate-700">Lock Paid Invoices</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Prevent edits to invoices after payment confirmation.</p>
                        </div>
                        <button onClick={() => setLockPaidInvoices(!lockPaidInvoices)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockPaidInvoices ? "bg-emerald-600" : "bg-slate-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockPaidInvoices ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between py-4 last:border-0">
                        <div className="max-w-[80%]">
                           <p className="text-sm font-bold text-slate-700">SMS Receipt Delivery</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Send link to digital receipt via WhatsApp/SMS.</p>
                        </div>
                        <button onClick={() => setSmsReceipts(!smsReceipts)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsReceipts ? "bg-emerald-600" : "bg-slate-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsReceipts ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                     </div>
                  </div>
              </Card>
           </div>
        )}

        {activeTab === "branding" && (
           <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                 <h3 className="text-lg font-bold text-slate-900 mb-2">Patient-Facing Branding</h3>
                 <p className="text-sm text-slate-500 mb-8 font-medium">Configure how your clinic appears on reports, prescriptions, and portals.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Visual Style</p>
                       <div className="grid grid-cols-4 gap-3">
                          {['#0F172A', '#0284C7', '#059669', '#7C3AED'].map(color => (
                             <div key={color} className="aspect-square rounded-2xl border-4 border-slate-50 cursor-pointer transition-all hover:scale-105" style={{ backgroundColor: color }} />
                          ))}
                          <div className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold text-xs">+</div>
                       </div>
                       
                        <div className="pt-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Dashboard Theme</label>
                           <div className="flex gap-4">
                              <button
                                onClick={() => setTheme("dark")}
                                className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === "dark" ? "bg-slate-900 text-white ring-2 ring-sky-400 ring-offset-2" : "bg-slate-900 text-white"}`}
                              >
                                Dark
                              </button>
                              <button
                                onClick={() => setTheme("light")}
                                className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === "light" ? "bg-slate-50 text-slate-900 ring-2 ring-sky-400 ring-offset-2" : "bg-slate-50 text-slate-400"}`}
                              >
                                Light
                              </button>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Document Templates</p>
                       <div className="space-y-4">
                           {['Clinical Report', 'Prescription Sheet', 'Invoice Summary'].map(doc => (
                              <div key={doc} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-all cursor-pointer group">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-sky-600">
                                       <Eye size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{doc}</span>
                                 </div>
                                 <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-sky-600" onClick={() => setCustomizeModal(doc)}>Customize</Button>
                              </div>
                           ))}
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
        )}

        {activeTab === "security" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
                     <CardHeader className="px-8 py-6 border-b border-slate-50">
                       <CardTitle className="text-base sm:text-lg">Security Audit Log</CardTitle>
                       <p className="text-xs sm:text-sm text-slate-500">Monitoring all administrative and clinical configuration changes.</p>
                     </CardHeader>
                     <div className="overflow-x-auto"><Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                             <TableHead className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8 text-right">Time</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {[
                            { user: "Admin (LO)", action: "RECOVERY_INIT", resource: "General Ledger", time: "10 mins ago" },
                            { user: "Dr. A. Bello", action: "EXPORT_RECORDS", resource: "HMO_AXA_MAY26", time: "2 hours ago" },
                            { user: "System", action: "AUTO_BACKUP", resource: "Cloud_Sync_V4", time: "Yesterday" },
                          ].map((log, i) => (
                             <TableRow key={i} className="hover:bg-slate-50/50 border-slate-50">
                                <TableCell className="px-8 py-5 font-bold text-slate-900">{log.user}</TableCell>
                                <TableCell className="py-5 font-black text-[10px] tracking-widest text-slate-500">{log.action}</TableCell>
                                <TableCell className="py-5 font-medium text-slate-600">{log.resource}</TableCell>
                                <TableCell className="py-5 pr-8 text-right font-bold text-slate-400 text-xs">{log.time}</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                     </Table></div>
                  </Card>
              </div>

              <div className="space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-4">
                       <ShieldAlert className="text-rose-400" size={20} />
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Compliance Status</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-400 mb-2">HIPAA/NDPR Compliant</p>
                    <p className="text-xs text-white/60 font-medium leading-relaxed mb-6">
                       All sensitive patient data is encrypted at rest and masked in regional analytics views.
                    </p>
                    <Button
                      className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl border-none font-bold"
                      onClick={() => {
                        const content = `Vemtap Eye Clinic - Compliance Certificate\nGenerated: ${new Date().toLocaleDateString()}\nStatus: Compliant`;
                        const blob = new Blob([content], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "Vemtap-Compliance-Certificate.txt";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download Compliance Cert
                    </Button>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Access Control</p>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                             <Smartphone size={14} className="text-sky-600" />
                             Force 2FA Login
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Require all staff to use mobile verification codes.</p>
                       </div>
                       <div className="space-y-2 pt-6 border-t border-slate-50">
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                             <Database size={14} className="text-emerald-600" />
                             Data Retention
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">Active Policy: 7 Years (Digital Records)</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>
        )}

        {/* Catch-all for other tabs */}
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
              <Button variant="primary" className="mt-8 rounded-xl font-bold" onClick={() => setActiveTab("profile")}>Back to Profile</Button>
           </Card>
        )}
      </div>
    </div>
  );
}
