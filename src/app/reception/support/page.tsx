"use client";

import React, { useState } from "react";
import {
  Headphones, CheckCircle2, MessageSquare, Phone, Mail, Clock,
  ChevronRight, Search, Send, ThumbsUp, BookOpen, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

type Ticket = {
  id: string;
  subject: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  date: string;
  category: string;
};

const initialTickets: Ticket[] = [
  { id: "SUP-2001", subject: "Cannot verify HMO policy", status: "open", priority: "high", date: "Today, 09:30 AM", category: "Technical" },
  { id: "SUP-2002", subject: "Printer not responding", status: "in-progress", priority: "medium", date: "Today, 08:15 AM", category: "Hardware" },
  { id: "SUP-2003", subject: "Patient record merge request", status: "open", priority: "low", date: "Yesterday, 04:20 PM", category: "Data" },
  { id: "SUP-2004", subject: "Biometric scanner offline", status: "resolved", priority: "high", date: "Yesterday, 02:00 PM", category: "Hardware" },
];

const faqItems = [
  { q: "How to reset a patient password?", a: "Go to Settings > Security > Reset Password. Enter the patient ID to generate a reset link." },
  { q: "HMO claim not appearing?", a: "Verify the policy number is correct. If the issue persists, escalate to the HMO queue in Billing." },
  { q: "System running slow?", a: "Try clearing your browser cache. If it continues, submit a ticket with your system specs." },
];

const statusStyles: Record<string, string> = {
  open: "bg-rose-100 text-rose-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const priorityStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-sky-100 text-sky-700",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "faq">("tickets");

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "Technical", priority: "medium" as Ticket["priority"] });

  const [showDetail, setShowDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! I'm the Vemtap support assistant. How can I help you today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filteredTickets = tickets.filter((t) =>
    !query.trim() || [t.subject, t.id, t.category, t.status].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  );

  const createTicket = () => {
    if (!newTicket.subject.trim()) return;
    const ticket: Ticket = {
      id: `SUP-${2001 + tickets.length}`,
      subject: newTicket.subject,
      status: "open",
      priority: newTicket.priority as Ticket["priority"],
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      category: newTicket.category,
    };
    setTickets((current) => [ticket, ...current]);
    setNewTicket({ subject: "", category: "Technical", priority: "medium" });
    setShowNewTicket(false);
    showToast("Support ticket created");
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((current) => [...current, { from: "user", text: chatInput.trim() }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((current) => [...current, { from: "bot", text: "Thanks for your message. A support agent will be with you shortly. For urgent issues, please call the IT desk." }]);
    }, 1000);
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Support</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Submit tickets, view FAQs, or chat with IT support.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Open", value: String(openCount), icon: AlertTriangle, tab: "tickets" },
            { label: "Resolved", value: String(resolvedCount), icon: CheckCircle2, tab: "tickets" },
            { label: "FAQ", value: "6", icon: BookOpen, tab: "faq" },
          ].map((stat) => (
            <button key={stat.label} onClick={() => setActiveTab(stat.tab as "tickets" | "faq")}
              className={cn("bg-white border rounded-xl sm:rounded-[1.5rem] px-3 sm:px-5 py-3 sm:py-4 shadow-sm text-left transition-all hover:shadow-md", activeTab === stat.tab ? "border-sky-200 bg-sky-50" : "border-slate-100")}>
              <stat.icon size={16} className={cn("mb-1 sm:mb-2", activeTab === stat.tab ? "text-sky-600" : "text-sky-400")} />
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-8">
          <section className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets..."
                  className="w-full pl-11 sm:pl-14 pr-3 sm:pr-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/15 font-bold text-slate-900 text-sm" />
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredTickets.map((ticket) => (
                <button key={ticket.id} onClick={() => { setSelectedTicket(ticket); setShowDetail(true); }}
                  className="w-full p-4 sm:p-6 text-left transition-all hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <MessageSquare size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{ticket.subject}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{ticket.id} &bull; {ticket.category} &bull; {ticket.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn("px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", priorityStyles[ticket.priority])}>{ticket.priority}</span>
                    <span className={cn("px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", statusStyles[ticket.status])}>{ticket.status}</span>
                  </div>
                </button>
              ))}
              {filteredTickets.length === 0 && (
                <div className="p-8 sm:p-12 text-center text-slate-400">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold">No tickets found</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5 sm:space-y-8">
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 text-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-xl shadow-slate-900/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center"><Headphones size={18} /></div>
                <div>
                  <h2 className="text-base sm:text-lg font-black">Need Help?</h2>
                  <p className="text-[9px] sm:text-[10px] text-white/50 font-black uppercase tracking-widest">Submit a ticket</p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={() => setShowNewTicket(true)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-slate-900 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all">
                  New Ticket
                </button>
                <button onClick={() => setShowChat(true)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Live Chat
                </button>
              </div>
            </motion.section>

            <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Phone size={14} className="text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">+234 800 123 4567</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Mail size={14} className="text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">it-support@vemtap.com</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Clock size={14} className="text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Mon–Sat, 7 AM – 7 PM</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden">
              <summary className="p-4 sm:p-6 cursor-pointer text-sm sm:text-base font-black text-slate-900 flex items-center justify-between gap-4">
                {faq.q}
                <ChevronRight size={18} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} title="New Support Ticket">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
            <input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="Brief description"
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none font-bold text-slate-900 text-sm">
                <option>Technical</option>
                <option>Hardware</option>
                <option>Data</option>
                <option>Account</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Ticket["priority"] })}
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none font-bold text-slate-900 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={createTicket} disabled={!newTicket.subject.trim()}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Send size={14} /> Submit Ticket
            </button>
            <button onClick={() => setShowNewTicket(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Ticket Details">
        {selectedTicket && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0"><MessageSquare size={24} /></div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedTicket.subject}</h4>
                <p className="text-xs sm:text-sm text-slate-500">{selectedTicket.id} &bull; {selectedTicket.date}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Category</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{selectedTicket.category}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Priority</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", priorityStyles[selectedTicket.priority])}>{selectedTicket.priority}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Status</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", statusStyles[selectedTicket.status])}>{selectedTicket.status}</span>
              </div>
            </div>
            <div className="space-y-2">
              {selectedTicket.status !== "resolved" && (
                <button onClick={() => { setTickets((current) => current.map((t) => t.id === selectedTicket.id ? { ...t, status: "resolved" } : t)); setShowDetail(false); showToast("Ticket resolved"); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Mark Resolved
                </button>
              )}
              {selectedTicket.status !== "in-progress" && selectedTicket.status !== "resolved" && (
                <button onClick={() => { setTickets((current) => current.map((t) => t.id === selectedTicket.id ? { ...t, status: "in-progress" } : t)); setShowDetail(false); showToast("Ticket in progress"); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-blue-700 flex items-center justify-center gap-2">
                  <ChevronRight size={14} /> Start Working
                </button>
              )}
            </div>
            <button onClick={() => setShowDetail(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        )}
      </Modal>

      {/* Chat Modal */}
      <Modal isOpen={showChat} onClose={() => setShowChat(false)} title="Live Chat">
        <div className="space-y-4 sm:space-y-5">
          <div className="h-64 sm:h-80 overflow-y-auto space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium leading-relaxed",
                  msg.from === "user" ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-700")}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
              placeholder="Type your message..."
              className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
            <button onClick={sendChatMessage} disabled={!chatInput.trim()}
              className="px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-all flex items-center justify-center">
              <Send size={16} />
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 text-center">Typical response time: &lt; 5 minutes</p>
        </div>
      </Modal>
    </div>
  );
}
