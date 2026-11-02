"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  ShieldCheck, Globe, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  ExternalLink, Trash2, Edit3, Activity,
  Info, Layers, Settings2, ChevronRight, Phone, Mail, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { 
  useHmoList, 
  useCreateHmo, 
  useHmoPlans, 
  useCreatePlan,
  type HmoItem,
  type HmoPlan
} from "@/hooks/useHmo";

export default function HMODatabasePage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || "";

  // Live queries
  const { data: hmos = [], isLoading: isLoadingHmos, refetch: refetchHmos } = useHmoList();
  const createHmoMutation = useCreateHmo();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHmo, setSelectedHmo] = useState<HmoItem | null>(null);

  // Modal States
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isConfigureRulesOpen, setIsConfigureRulesOpen] = useState(false);
  const [activePlanForRule, setActivePlanForRule] = useState<HmoPlan | null>(null);

  // Form States
  const [newHmo, setNewHmo] = useState({ 
    name: "", 
    contactPerson: "", 
    email: "", 
    phone: "", 
    address: "Nigeria",
    commissionRate: 10 
  });

  const [newPlan, setNewPlan] = useState({ 
    name: "", 
    description: "", 
    coveragePercentage: 100 
  });

  // Fetch plans for selected HMO
  const { data: plans = [], isLoading: isLoadingPlans } = useHmoPlans(selectedHmo?.id || "");
  const createPlanMutation = useCreatePlan();

  // Handlers
  const handleAddHmo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHmo.name.trim()) return;

    try {
      await createHmoMutation.mutateAsync({
        name: newHmo.name,
        contactPerson: newHmo.contactPerson || undefined,
        email: newHmo.email || undefined,
        phone: newHmo.phone || undefined,
        address: newHmo.address || undefined,
        commissionRate: Number(newHmo.commissionRate) || 10,
        clinicId: clinicId,
      });
      setIsAddProviderOpen(false);
      setNewHmo({ name: "", contactPerson: "", email: "", phone: "", address: "Nigeria", commissionRate: 10 });
    } catch (err) {
      console.error("Failed to create HMO provider", err);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name.trim() || !selectedHmo) return;

    try {
      await createPlanMutation.mutateAsync({
        name: newPlan.name,
        description: newPlan.description || undefined,
        coveragePercentage: Number(newPlan.coveragePercentage) || 100,
        hmoId: selectedHmo.id,
      });
      setIsAddPlanOpen(false);
      setNewPlan({ name: "", description: "", coveragePercentage: 100 });
    } catch (err) {
      console.error("Failed to create HMO plan", err);
    }
  };

  const filteredHmos = hmos.filter((h) => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.contactPerson && h.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
    h.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = hmos.filter(h => h.isActive).length;
  const inactiveCount = hmos.length - activeCount;

  // Modal: Add Provider
  const AddProviderModal = () => (
    <Modal isOpen={isAddProviderOpen} onClose={() => setIsAddProviderOpen(false)} title="Register New HMO Provider">
      <form onSubmit={handleAddHmo} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">HMO Name</label>
          <input 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none"
            placeholder="e.g. HMO name"
            value={newHmo.name}
            onChange={(e) => setNewHmo({...newHmo, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Contact Person</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="e.g. Dr. John Adeleke"
              value={newHmo.contactPerson}
              onChange={(e) => setNewHmo({...newHmo, contactPerson: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Phone</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="+234 800 000 0000"
              value={newHmo.phone}
              onChange={(e) => setNewHmo({...newHmo, phone: e.target.value})}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Support Email</label>
            <input 
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="providers@hmo.com"
              value={newHmo.email}
              onChange={(e) => setNewHmo({...newHmo, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Commission Rate (%)</label>
            <input 
              type="number"
              min="0"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="10"
              value={newHmo.commissionRate}
              onChange={(e) => setNewHmo({...newHmo, commissionRate: Number(e.target.value)})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Office / Region</label>
          <input 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
            placeholder="Lagos, Nigeria"
            value={newHmo.address}
            onChange={(e) => setNewHmo({...newHmo, address: e.target.value})}
          />
        </div>
        <Button 
          type="submit" 
          disabled={createHmoMutation.isPending}
          variant="default" 
          className="w-full py-4 rounded-xl mt-4 font-bold shadow-lg shadow-brand-blue/20"
        >
          {createHmoMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Provider"}
        </Button>
      </form>
    </Modal>
  );

  // Modal: Add Plan
  const AddPlanModal = () => (
    <Modal isOpen={isAddPlanOpen} onClose={() => setIsAddPlanOpen(false)} title={`Create Member Plan for ${selectedHmo?.name}`}>
      <form onSubmit={handleAddPlan} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Plan Name</label>
          <input 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
            placeholder="e.g. Platinum Plus, HyBasic"
            value={newPlan.name}
            onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Coverage Percentage (%)</label>
            <input 
              required
              type="number"
              min="1"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="100"
              value={newPlan.coveragePercentage}
              onChange={(e) => setNewPlan({...newPlan, coveragePercentage: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description / Tier</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="e.g. Standard Corporate Tier"
              value={newPlan.description}
              onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={createPlanMutation.isPending}
          variant="default" 
          className="w-full py-4 rounded-xl mt-4 font-bold"
        >
          {createPlanMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Plan"}
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
        <p className="text-sm text-slate-500 leading-relaxed">Coverage specifications and pre-authorization rules for this tariff plan.</p>
        
        <div className="space-y-3">
          {[
            { label: "Coverage Percentage", val: `${activePlanForRule?.coveragePercentage || 100}%` },
            { label: "Pre-Auth Required", val: activePlanForRule?.requiresPreAuth ? "Yes" : "No" },
            { label: "Optical Frame Limit", val: "₦25,000" },
            { label: "Consultation Co-Pay", val: "0%" },
          ].map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-600">{rule.label}</span>
              <span className="text-xs font-black text-brand-navy">{rule.val}</span>
            </div>
          ))}
        </div>

        <Button variant="default" className="w-full py-4 rounded-xl font-bold" onClick={() => setIsConfigureRulesOpen(false)}>
          Close
        </Button>
      </div>
    </Modal>
  );

  // --- Selected Detail View ---
  if (selectedHmo) {
    return (
      <div className="space-y-6 lg:space-y-8 pb-20">
        <AddPlanModal />
        <ConfigureRulesModal />
        
        {/* Detail Header */}
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
                <span className={cn(
                  "text-[8px] lg:text-[10px] font-black px-2 lg:px-3 py-1 rounded-full uppercase tracking-widest border shrink-0",
                  selectedHmo.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {selectedHmo.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-slate-500 font-medium text-xs lg:text-sm flex items-center gap-2 truncate">
                {selectedHmo.id.slice(0, 8)} • <Globe size={14} className="text-slate-400 shrink-0" /> {selectedHmo.address || "Nigeria"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button variant="outline" className="flex-1 lg:flex-none rounded-xl font-bold h-11 lg:h-12 px-6 border-slate-200 text-sm" onClick={() => setSelectedHmo(null)}>Back to HMOs</Button>
            <Button variant="default" className="flex-1 lg:flex-none rounded-xl font-bold h-11 lg:h-12 px-6 shadow-lg shadow-brand-blue/20 text-sm" onClick={() => setIsAddPlanOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Plan
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: General Info */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-base lg:text-lg font-bold text-brand-navy mb-6 flex items-center gap-2">
                <Info size={18} className="text-brand-blue" /> Provider Contact & Details
              </h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Support Email", val: selectedHmo.email || "providers@hmo.com" },
                  { icon: Phone, label: "Provider Line", val: selectedHmo.phone || "Not set" },
                  { icon: Building2, label: "Contact Person", val: selectedHmo.contactPerson || "Not assigned" },
                  { icon: Globe, label: "Commission Rate", val: `${selectedHmo.commissionRate || 0}%` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-bold text-brand-navy truncate">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-navy p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-base lg:text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                <Settings2 size={18} className="text-brand-blue" /> Integration Parameters
              </h3>
              <div className="space-y-4 relative z-10">
                {[
                  { label: "Claims Channel", val: "Digital Automated Submission" },
                  { label: "Turnaround Time", val: "30-Day Reconciliation" },
                  { label: "Pre-Auth Mode", val: "Online Verification" },
                  { label: "Tariff Base", val: "Clinic Standard Negotiated" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-[10px] lg:text-xs text-slate-400 font-bold">{item.label}</span>
                    <span className="text-[10px] lg:text-xs text-brand-blue font-black text-right">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Plans */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-1 lg:order-2">
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-brand-navy">Member Plans ({plans.length})</h3>
                  <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">Active coverage tiers and benefit packages for {selectedHmo.name}.</p>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold gap-2 h-11 px-6 border-slate-200" onClick={() => setIsAddPlanOpen(true)}>
                  <Plus size={16} /> New Plan
                </Button>
              </div>

              {isLoadingPlans ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" /></div>
              ) : plans.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm font-bold text-slate-500">No member plans configured yet.</p>
                  <Button variant="ghost" className="mt-3 text-brand-blue font-bold text-xs" onClick={() => setIsAddPlanOpen(true)}>
                    + Create First Plan
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-5 lg:p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-brand-blue/30 hover:bg-white hover:shadow-lg transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-slate-50">
                          <Layers size={20} />
                        </div>
                        <span className="text-[8px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest shrink-0">
                          Active
                        </span>
                      </div>
                      <h4 className="text-base lg:text-lg font-black text-brand-navy mb-1 truncate">{plan.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{plan.description || "Coverage Plan"}</p>
                      
                      <div className="space-y-3 pt-4 border-t border-slate-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coverage</span>
                          <span className="text-[11px] lg:text-xs font-black text-brand-navy">{plan.coveragePercentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pre-Auth</span>
                          <span className="text-[11px] lg:text-xs font-black text-brand-blue">{plan.requiresPreAuth ? "Required" : "Not Required"}</span>
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
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Main List View ---
  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <AddProviderModal />
      
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 rounded-xl text-xs">
            <ArrowLeft size={16} /> <span className="hidden xs:inline">Back to Config</span><span className="xs:hidden">Back</span>
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200 hidden xs:block"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">HMO Database</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-navy font-black tracking-tight">HMO Database</h1>
          <p className="text-sm lg:text-base text-slate-500 font-medium mt-0.5">Manage insurance providers, contracted commission rates, and member plans.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Button 
            onClick={() => setIsAddProviderOpen(true)}
            variant="default" 
            size="sm" 
            className="flex-1 sm:flex-none gap-2 h-11 px-4 lg:px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20 text-xs lg:text-sm"
          >
            <Plus size={16} /> Add Provider
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Providers", val: hmos.length.toString(), icon: ShieldCheck, color: "blue" },
          { label: "Active Contracts", val: activeCount.toString(), icon: Activity, color: "emerald" },
          { label: "Inactive Providers", val: inactiveCount.toString(), icon: AlertCircle, color: "amber" },
          { label: "Database Status", val: "Live Synced", icon: Building2, color: "purple" },
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

      {/* Search & Filter */}
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
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO Provider</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoadingHmos ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                    <p className="mt-2 text-xs font-bold">Loading live HMO providers...</p>
                  </td>
                </tr>
              ) : filteredHmos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">No HMO providers found</p>
                    <p className="text-xs text-slate-400 mt-1">Add your first insurance provider to start linking patients and submitting claims.</p>
                    <Button 
                      onClick={() => setIsAddProviderOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="mt-4 rounded-xl font-bold"
                    >
                      <Plus size={14} className="mr-1" /> Add Provider
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredHmos.map((hmo) => (
                  <tr key={hmo.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 lg:px-8 py-5 lg:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue group-hover:border-brand-blue/20 transition-all shrink-0">
                          <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm lg:text-base font-bold text-brand-navy truncate">{hmo.name}</p>
                          <p className="text-[9px] lg:text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-widest truncate">
                            <Globe size={10} className="shrink-0" /> {hmo.address || "Nigeria"} • {hmo.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-5 lg:py-6">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{hmo.contactPerson || "Primary Admin"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{hmo.email || hmo.phone || "No contact info"}</p>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-5 lg:py-6">
                      <span className="text-xs font-black text-brand-navy">{hmo.commissionRate || 0}%</span>
                    </td>
                    <td className="px-6 lg:px-8 py-5 lg:py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                        hmo.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {hmo.isActive ? <CheckCircle2 size={14} className="shrink-0" /> : <Clock size={14} className="shrink-0" />}
                        {hmo.isActive ? "Active" : "Inactive"}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
