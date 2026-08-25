"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, MoreVertical, 
  ShieldCheck, Globe, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  ExternalLink, Trash2, Edit3, Activity,
  Info, Layers, ListTodo, CreditCard, Settings2,
  ChevronRight, Layout, Phone, Mail, MapPin, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

// --- Mock Data ---
const initialHmos = [
  { 
    id: "HMO-001", 
    name: "Reliance HMO", 
    type: "Private", 
    clinics: 242, 
    status: "Active", 
    country: "Nigeria",
    email: "providers@reliancehealth.com",
    phone: "+234 1 700 7333",
    website: "https://reliancehealth.com"
  },
  { id: "HMO-002", name: "AXA Mansard", type: "Private", clinics: 186, status: "Active", country: "Nigeria" },
  { id: "HMO-003", name: "Hygeia HMO", type: "Private", clinics: 154, status: "Active", country: "Nigeria" },
  { id: "HMO-004", name: "NHIA", type: "Government", clinics: 412, status: "Active", country: "Nigeria" },
  { id: "HMO-005", name: "Leadway Health", type: "Private", clinics: 94, status: "Active", country: "Nigeria" },
  { id: "HMO-006", name: "Total Health", type: "Private", clinics: 12, status: "Maintenance", country: "Ghana" },
];

const initialPlans = [
  { name: "HyBasic", code: "HYB-01", coverage: "100%", limit: "₦50k/yr", status: "Active" },
  { name: "HyClassic", code: "HYC-02", coverage: "100%", limit: "₦150k/yr", status: "Active" },
  { name: "HyPremium", code: "HYP-03", coverage: "100%", limit: "₦500k/yr", status: "Active" },
  { name: "Executive Plan", code: "HYE-04", coverage: "100%", limit: "Unlimited", status: "Active" },
];

export default function HMODatabasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHmo, setSelectedHmo] = useState<any>(null);
  const [hmos, setHmos] = useState(initialHmos);
  const [plans, setPlans] = useState(initialPlans);

  // Modal States
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isConfigureRulesOpen, setIsConfigureRulesOpen] = useState(false);
  const [activePlanForRule, setActivePlanForRule] = useState<any>(null);

  // Form States
  const [newHmo, setNewHmo] = useState({ name: "", type: "Private", country: "Nigeria" });
  const [newPlan, setNewPlan] = useState({ name: "", code: "", limit: "" });

  // --- Handlers ---
  const handleAddHmo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `HMO-00${hmos.length + 1}`;
    setHmos([{ ...newHmo, id, clinics: 0, status: "Active" } as any, ...hmos]);
    setIsAddProviderOpen(false);
    setNewHmo({ name: "", type: "Private", country: "Nigeria" });
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlans([...plans, { ...newPlan, coverage: "100%", status: "Active" }]);
    setIsAddPlanOpen(false);
    setNewPlan({ name: "", code: "", limit: "" });
  };

  // --- Render Components ---

  // Modal: Add Provider
  const AddProviderModal = () => (
    <Modal isOpen={isAddProviderOpen} onClose={() => setIsAddProviderOpen(false)} title="Register New HMO Provider">
      <form onSubmit={handleAddHmo} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">HMO Name</label>
          <input 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none"
            placeholder="e.g. Wellness Health"
            value={newHmo.name}
            onChange={(e) => setNewHmo({...newHmo, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Type</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
              value={newHmo.type}
              onChange={(e) => setNewHmo({...newHmo, type: e.target.value})}
            >
              <option>Private</option>
              <option>Government</option>
              <option>International</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Country</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="Nigeria"
              value={newHmo.country}
              onChange={(e) => setNewHmo({...newHmo, country: e.target.value})}
            />
          </div>
        </div>
        <Button variant="primary" className="w-full py-4 rounded-xl mt-4 font-bold shadow-lg shadow-brand-blue/20">
          Save Provider
        </Button>
      </form>
    </Modal>
  );

  // Modal: Add Plan
  const AddPlanModal = () => (
    <Modal isOpen={isAddPlanOpen} onClose={() => setIsAddPlanOpen(false)} title="Create Member Plan">
      <form onSubmit={handleAddPlan} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Plan Name</label>
          <input 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
            placeholder="e.g. Platinum Plus"
            value={newPlan.name}
            onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Plan Code</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="PLT-01"
              value={newPlan.code}
              onChange={(e) => setNewPlan({...newPlan, code: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Annual Limit</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="₦1,000,000"
              value={newPlan.limit}
              onChange={(e) => setNewPlan({...newPlan, limit: e.target.value})}
            />
          </div>
        </div>
        <Button variant="primary" className="w-full py-4 rounded-xl mt-4 font-bold">
          Create Plan
        </Button>
      </form>
    </Modal>
  );

  // Modal: Configure Rules
  const ConfigureRulesModal = () => (
    <Modal 
      isOpen={isConfigureRulesOpen} 
      onClose={() => setIsConfigureRulesOpen(false)} 
      title={`Configure Rules: ${activePlanForRule?.name}`}
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-500 leading-relaxed">Define specific coverage exceptions and authorization logic for this plan.</p>
        
        <div className="space-y-3">
          {[
            { label: "Optical Frame Limit", val: "₦25,000" },
            { label: "Drug Co-pay", val: "10%" },
            { label: "Surgery Auth required", val: "Yes", active: true },
            { label: "Wait period for Eye Test", val: "6 Months" },
          ].map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-600">{rule.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-brand-navy">{rule.val}</span>
                <Edit3 size={14} className="text-slate-400 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        <Button variant="primary" className="w-full py-4 rounded-xl font-bold" onClick={() => setIsConfigureRulesOpen(false)}>
          Apply All Rules
        </Button>
      </div>
    </Modal>
  );

  // --- Main Render ---

  if (selectedHmo) {
    return (
      <div className="space-y-6 lg:space-y-8 pb-20">
        <AddPlanModal />
        <ConfigureRulesModal />
        {/* Detail Header - Mobile Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedHmo(null)}
              className="w-10 h-10 p-0 rounded-full hover:bg-slate-100 shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-[1rem] lg:rounded-[1.5rem] bg-brand-soft-blue border border-brand-blue/20 flex items-center justify-center text-brand-blue shadow-sm shrink-0">
              <ShieldCheck size={24} className="lg:w-8 lg:h-8" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-1">
                <h1 className="text-xl lg:text-3xl font-black text-brand-navy tracking-tight truncate">{selectedHmo.name}</h1>
                <span className="bg-emerald-50 text-emerald-600 text-[8px] lg:text-[10px] font-black px-2 lg:px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 shrink-0">
                  {selectedHmo.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium text-xs lg:text-sm flex items-center gap-2 truncate">
                {selectedHmo.id} • <span className="hidden sm:inline">{selectedHmo.type} Provider •</span> <Globe size={14} className="text-slate-400 shrink-0" /> {selectedHmo.country}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button variant="outline" className="flex-1 lg:flex-none rounded-xl font-bold h-11 lg:h-12 px-6 border-slate-200 text-sm" onClick={() => setSelectedHmo(null)}>Close</Button>
            <Button variant="primary" className="flex-1 lg:flex-none rounded-xl font-bold h-11 lg:h-12 px-6 shadow-lg shadow-brand-blue/20 text-sm">Update Profile</Button>
          </div>
        </div>

        {/* Tabbed Interface for Blueprint Sections - Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: General Info & Business Settings */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-base lg:text-lg font-bold text-brand-navy mb-6 flex items-center gap-2">
                <Info size={18} className="text-brand-blue" /> Provider Info
              </h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Support Email", val: selectedHmo.email || "providers@hmo.com" },
                  { icon: Phone, label: "Provider Line", val: selectedHmo.phone || "+234 800 000 0000" },
                  { icon: ExternalLink, label: "Claims Portal", val: "Login to Portal", link: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className={cn("text-sm font-bold text-brand-navy truncate", item.link && "text-brand-blue underline cursor-pointer")}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-navy p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-base lg:text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                <Settings2 size={18} className="text-brand-blue" /> Business Settings
              </h3>
              <div className="space-y-4 relative z-10">
                {[
                  { label: "Claims Method", val: "Digital API / Portal" },
                  { label: "Payment Cycle", val: "30 Days (Net)" },
                  { label: "Authorization", val: "Required for Surgery" },
                  { label: "Pricing Model", val: "Fixed Tariff" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-[10px] lg:text-xs text-slate-400 font-bold">{item.label}</span>
                    <span className="text-[10px] lg:text-xs text-brand-blue font-black text-right">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Plan Management */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-1 lg:order-2">
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-brand-navy">HMO Plan Management</h3>
                  <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">Configure coverage limits and rules for each member plan.</p>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold gap-2 h-11 px-6 border-slate-200" onClick={() => setIsAddPlanOpen(true)}>
                  <Plus size={16} /> New Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((plan, i) => (
                  <div key={i} className="p-5 lg:p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-brand-blue/30 hover:bg-white hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-slate-50">
                        <Layers size={20} />
                      </div>
                      <span className="text-[8px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest shrink-0">
                        {plan.status}
                      </span>
                    </div>
                    <h4 className="text-base lg:text-lg font-black text-brand-navy mb-1 truncate">{plan.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Code: {plan.code}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-200/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Limit</span>
                        <span className="text-[11px] lg:text-xs font-black text-brand-navy">{plan.limit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optical Allowance</span>
                        <span className="text-[11px] lg:text-xs font-black text-brand-blue">₦15,000</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full mt-6 rounded-xl text-brand-blue font-bold text-xs gap-2 group-hover:bg-brand-soft-blue h-10"
                      onClick={() => {
                        setActivePlanForRule(plan);
                        setIsConfigureRulesOpen(true);
                      }}
                    >
                      Configure Rules <ChevronRight size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Intelligence - Optimized Table/List */}
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-brand-navy">Global Service Catalog</h3>
                <Button variant="ghost" className="w-full sm:w-auto text-brand-blue font-bold text-xs lg:text-sm gap-2 h-11 px-4 lg:bg-transparent bg-brand-soft-blue rounded-xl">
                  Manage Services <ExternalLink size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {[
                  { service: "General Consultation", cat: "Clinical", coverage: "Full", auth: "No" },
                  { service: "Refraction & Eye Test", cat: "Optical", coverage: "Full", auth: "No" },
                  { service: "Cataract Surgery", cat: "Surgery", coverage: "Requires Auth", auth: "Yes" },
                  { service: "Anti-Reflection Lenses", cat: "Optical", coverage: "Partial (50%)", auth: "No" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 gap-4 sm:gap-0">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0"></div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{s.service}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.cat}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 lg:gap-10 border-t sm:border-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</p>
                        <p className={cn("text-[11px] lg:text-xs font-bold", s.coverage === "Full" ? "text-emerald-600" : "text-amber-600")}>{s.coverage}</p>
                      </div>
                      <div className="text-right w-12 sm:w-16">
                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth</p>
                        <p className="text-[11px] lg:text-xs font-bold text-brand-navy">{s.auth}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Standard List View ---
  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <AddProviderModal />
      
      {/* Breadcrumbs & Back - Mobile Responsive */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 rounded-xl text-xs">
            <ArrowLeft size={16} /> <span className="hidden xs:inline">Back to Config</span><span className="xs:hidden">Back</span>
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200 hidden xs:block"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">HMO Database</p>
      </div>

      {/* Header - Mobile Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-navy font-black tracking-tight">HMO Database</h1>
          <p className="text-sm lg:text-base text-slate-500 font-medium mt-0.5">Manage global insurance providers and standardized tariff plans.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 h-11 px-4 lg:px-6 rounded-xl font-bold border-slate-200 text-xs lg:text-sm">
            <Download size={16} /> <span className="hidden xs:inline">Export Tariffs</span><span className="xs:hidden">Export</span>
          </Button>
          <Button 
            onClick={() => setIsAddProviderOpen(true)}
            variant="primary" 
            size="sm" 
            className="flex-1 sm:flex-none gap-2 h-11 px-4 lg:px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20 text-xs lg:text-sm"
          >
            <Plus size={16} /> Add Provider
          </Button>
        </div>
      </div>

      {/* Stats Quick View - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Providers", val: hmos.length.toString(), icon: ShieldCheck, color: "blue" },
          { label: "Active Claims", val: "12,402", icon: Activity, color: "emerald" },
          { label: "Govt. Schemes", val: hmos.filter(h => h.type === "Government" || h.type === "Government").length.toString(), icon: Building2, color: "purple" },
          { label: "Maintenance", val: "2", icon: AlertCircle, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 lg:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 transition-colors", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white" : 
              "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
            )}>
              <stat.icon size={20} className="lg:w-6 lg:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
              <h4 className="text-lg lg:text-xl font-black text-brand-navy">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search - Mobile Responsive */}
      <div className="bg-white p-5 lg:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search providers by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 lg:h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-xs lg:text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-10 lg:h-11 px-4 lg:px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-xs">
            <Filter size={14} /> <span className="hidden sm:inline">Filter Type</span><span className="sm:hidden">Type</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-10 lg:h-11 px-4 lg:px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-xs">
            <Globe size={14} /> <span className="hidden sm:inline">Region: All</span><span className="sm:hidden">All Regions</span>
          </Button>
        </div>
      </div>

      {/* Providers Table - Mobile Optimized */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO Provider</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hmos.map((hmo, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 lg:px-8 py-5 lg:py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue group-hover:border-brand-blue/20 transition-all shrink-0">
                        <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm lg:text-base font-bold text-brand-navy truncate">{hmo.name}</p>
                        <p className="text-[9px] lg:text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-widest truncate">
                          <Globe size={10} className="shrink-0" /> {hmo.country} • {hmo.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 lg:py-6">
                    <span className={cn(
                      "text-[9px] lg:text-[10px] font-black px-2 lg:px-3 py-1 rounded-full uppercase tracking-widest shrink-0 whitespace-nowrap",
                      hmo.type === "Government" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {hmo.type}
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-5 lg:py-6">
                    <div className="flex items-center gap-1.5 text-xs lg:text-sm font-black text-brand-navy whitespace-nowrap">
                      <Building2 size={16} className="text-brand-blue shrink-0" />
                      {hmo.clinics} <span className="text-[9px] lg:text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Clinics</span>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 lg:py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                      hmo.status === "Active" ? "bg-emerald-50 text-emerald-600" : 
                      hmo.status === "Maintenance" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {hmo.status === "Active" ? <CheckCircle2 size={14} className="shrink-0" /> : <Clock size={14} className="shrink-0" />}
                      {hmo.status}
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 lg:py-6 text-right">
                    <div className="flex items-center justify-end gap-1 lg:gap-2">
                      <Button 
                        onClick={() => setSelectedHmo(hmo)}
                        variant="ghost" 
                        size="sm" 
                        className="h-9 lg:h-10 px-3 lg:px-4 rounded-xl gap-2 font-black text-[9px] lg:text-[10px] uppercase tracking-widest text-brand-blue hover:bg-brand-soft-blue transition-all"
                      >
                        <Settings2 size={16} className="shrink-0" /> <span className="hidden sm:inline">Configure</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 lg:h-10 lg:w-10 p-0 rounded-xl text-slate-400 hover:text-brand-navy shrink-0">
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - Mobile Responsive */}
        <div className="p-5 lg:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to {hmos.length} of {hmos.length} providers</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" className="rounded-xl font-bold px-4 lg:px-6 h-9 lg:h-10 border-slate-200 text-xs">Prev</Button>
            <Button variant="outline" className="rounded-xl font-bold w-9 h-9 lg:w-10 lg:h-10 p-0 bg-white border-brand-blue text-brand-blue text-xs shadow-sm">1</Button>
            <Button variant="outline" className="rounded-xl font-bold px-4 lg:px-6 h-9 lg:h-10 border-slate-200 text-xs">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
