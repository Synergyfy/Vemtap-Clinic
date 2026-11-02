"use client";

import React, { useState } from "react";
import { 
  Ticket, AlertCircle, Search, Plus, MoreVertical, 
  CheckCircle2, Clock, User, Building2, ShieldAlert, 
  Zap, MessageCircle, Activity, Loader2, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import {
  useSupportTickets,
  useSupportTicketStats,
  useCreateSupportTicket,
  useResolveSupportTicket,
  useCloseSupportTicket,
  type SupportTicket
} from "@/hooks/useSupportTickets";

export default function SupportDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    type: "support" as const,
    priority: "medium" as const,
  });

  const queryType = activeTab === "complaints" ? "complaint" : activeTab === "tickets" ? "support" : undefined;
  const { data: tickets = [], isLoading } = useSupportTickets({
    type: queryType,
    search: searchQuery || undefined,
  });
  const { data: stats } = useSupportTicketStats();
  const createMutation = useCreateSupportTicket();
  const resolveMutation = useResolveSupportTicket();
  const closeMutation = useCloseSupportTicket();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;

    try {
      if (!user?.clinicId) {
        console.error("No active clinic is attached to this session");
        return;
      }

      await createMutation.mutateAsync({
        ...newTicket,
        clinicId: user.clinicId,
      });
      setIsCreateModalOpen(false);
      setNewTicket({
        subject: "",
        description: "",
        type: "support",
        priority: "medium",
      });
    } catch (err) {
      console.error("Failed to create ticket", err);
    }
  };

  const openCount = stats?.open ?? tickets.filter(t => t.status === "open").length;
  const inProgressCount = stats?.inProgress ?? tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = stats?.resolved ?? tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const complaintsCount = tickets.filter(t => t.type === "complaint").length;

  return (
    <div className="space-y-10 pb-20">
      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Support Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Subject</label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20"
              placeholder="e.g. HMO Authorization Gateway Latency"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Ticket Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
                value={newTicket.type}
                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as any })}
              >
                <option value="support">General Support</option>
                <option value="complaint">Complaint</option>
                <option value="incident">System Incident</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Priority</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Detailed Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20"
              placeholder="Describe the clinical or operational issue in detail..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Support Ticket"}
          </Button>
        </form>
      </Modal>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket #${selectedTicket.ticketNumber || selectedTicket.id.slice(0, 8)}`}>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedTicket.type}
                </span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                  selectedTicket.priority === "critical" ? "bg-rose-100 text-rose-700" :
                  selectedTicket.priority === "high" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-700"
                )}>
                  {selectedTicket.priority} priority
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-navy">{selectedTicket.subject}</h3>
              <p className="text-xs text-slate-500 mt-1">Logged on {new Date(selectedTicket.createdAt).toLocaleString()}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedTicket.description}
            </div>

            <div className="flex items-center gap-3">
              {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                <Button 
                  onClick={async () => {
                    await resolveMutation.mutateAsync({ id: selectedTicket.id });
                    setSelectedTicket(null);
                  }}
                  disabled={resolveMutation.isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11"
                >
                  Mark as Resolved
                </Button>
              )}
              {selectedTicket.status !== "closed" && (
                <Button 
                  onClick={async () => {
                    await closeMutation.mutateAsync(selectedTicket.id);
                    setSelectedTicket(null);
                  }}
                  disabled={closeMutation.isPending}
                  variant="outline"
                  className="flex-1 font-bold rounded-xl h-11 border-slate-200"
                >
                  Close Ticket
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Support Desk</h1>
          <p className="mt-1 text-slate-500 font-medium">Manage platform-wide tickets, complaints, and live provider issues.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} /> New Support Ticket
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {[
          { label: "Open Tickets", val: String(openCount), icon: Ticket, color: "blue" },
          { label: "Active Complaints", val: String(complaintsCount), icon: AlertCircle, color: "rose" },
          { label: "In Progress", val: String(inProgressCount), icon: Activity, color: "amber" },
          { label: "Resolved Total", val: String(resolvedCount), icon: CheckCircle2, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "rose" ? "bg-rose-50 text-rose-500" :
              stat.color === "amber" ? "bg-amber-50 text-amber-500" :
              "bg-emerald-50 text-emerald-500"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-brand-navy">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {[
            { id: "all", label: "All Items" },
            { id: "tickets", label: "Support Tickets" },
            { id: "complaints", label: "Complaints" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-brand-navy text-white shadow-sm" 
                  : "bg-white text-slate-500 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 outline-none text-xs font-medium focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged</th>
                <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                    <p className="mt-2 text-xs font-bold">Loading live support tickets...</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">No support tickets found</p>
                    <p className="text-xs text-slate-400 mt-1">Provider inquiries and tickets will automatically appear here.</p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="mt-4 rounded-xl font-bold"
                    >
                      <Plus size={14} className="mr-1" /> Create Ticket
                    </Button>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 lg:px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                          <Ticket size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-navy truncate">{ticket.subject}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {ticket.ticketNumber || ticket.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-5">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                        ticket.priority === "critical" ? "bg-rose-100 text-rose-700" :
                        ticket.priority === "high" ? "bg-amber-100 text-amber-700" :
                        ticket.priority === "medium" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        ticket.status === "resolved" ? "bg-emerald-50 text-emerald-600" :
                        ticket.status === "closed" ? "bg-slate-100 text-slate-500" :
                        "bg-sky-50 text-sky-600"
                      )}>
                        {ticket.status === "resolved" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {ticket.status}
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-xs text-slate-500 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="rounded-xl text-xs font-bold text-brand-blue hover:bg-brand-soft-blue"
                      >
                        View
                      </Button>
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
