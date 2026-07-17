"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, ChevronDown, Search, LifeBuoy, Send, CheckCircle2, Bot, ExternalLink } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

const faqs = [
  { q: "How do I dispense a controlled substance?", a: "Controlled substances require dual verification. Go to Dispensing Center, select the Rx, and a senior pharmacist must confirm the dispense action." },
  { q: "What do I do if stock runs out?", a: "Create a Purchase Order from the Suppliers page. Select the drug and supplier, enter quantity, and submit. Once delivered, stock auto-updates." },
  { q: "How do I handle expired drugs?", a: "Expired drugs are flagged in the Inventory page. They should be quarantined and returned to the supplier via a return order." },
  { q: "Can I cancel a prescription?", a: "Yes. Go to Prescriptions and click the cancel button on the detail modal. Cancelled prescriptions show in the Cancelled column." },
  { q: "How do I add a new drug to the inventory?", a: "Only admins can add new drugs. Contact the IT admin or your supervisor to request new drug entries." },
  { q: "How do I reset my password?", a: "Contact the IT department at it@vemtap.com or call extension 2100." },
];

const supportTickets = [
  { id: "TKT-001", subject: "Unable to dispense drug", status: "Open", priority: "High", date: "2026-07-14" },
  { id: "TKT-002", subject: "Inventory sync error", status: "In Progress", priority: "Medium", date: "2026-07-13" },
  { id: "TKT-003", subject: "New supplier request", status: "Resolved", priority: "Low", date: "2026-07-12" },
];

function priorityBadge(p: string) {
  if (p === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (p === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  if (p === "Low") return <Badge variant="secondary">Low</Badge>;
  return <Badge variant="outline">{p}</Badge>;
}

function ticketStatusBadge(s: string) {
  if (s === "Open") return <Badge className="bg-sky-600 text-white">Open</Badge>;
  if (s === "In Progress") return <Badge className="bg-amber-600 text-white">In Progress</Badge>;
  if (s === "Resolved") return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

export default function PharmacySupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Low");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const [detailTicket, setDetailTicket] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendTicket = () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
    setTicketSent(true);
    setTimeout(() => { setNewTicketModal(false); setTicketSent(false); setTicketSubject(""); setTicketDesc(""); setTicketPriority("Low"); }, 1500);
  };

  const selectedTicket = detailTicket ? supportTickets.find((t) => t.id === detailTicket) : null;

  const cardLinks = [
    { icon: LifeBuoy, color: "text-sky-700", bg: "bg-sky-50", title: "IT Support Desk", line1: "it@vemtap.com", line2: "Ext. 2100", mail: "mailto:it@vemtap.com" },
    { icon: Phone, color: "text-teal-700", bg: "bg-teal-50", title: "Pharmacy Hotline", line1: "+234 800 PHARMACY", line2: "", tel: "+234800PHARMACY" },
    { icon: Clock, color: "text-amber-700", bg: "bg-amber-50", title: "Hours", line1: "Mon-Sat 7AM-9PM", line2: "" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Help & Support" description="Get help with pharmacy operations, FAQs, and submit support tickets."
        actions={[{ label: "Submit Ticket", variant: "primary", onClick: () => setNewTicketModal(true) }]} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        {cardLinks.map((c, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center ${c.color} shrink-0`}><c.icon size={24} /></div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{c.title}</p>
                {c.mail ? (
                  <a href={c.mail} className="text-xs text-slate-500 hover:text-teal-700 transition-colors">{c.line1}</a>
                ) : c.tel ? (
                  <a href={c.tel} className="text-xs text-slate-500 hover:text-teal-700 transition-colors">{c.line1}</a>
                ) : (
                  <p className="text-xs text-slate-500">{c.line1}</p>
                )}
                {c.line2 && <p className="text-xs text-slate-400">{c.line2}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><HelpCircle size={18} /> FAQs</CardTitle>
            <div className="relative w-36 sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-900">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-3 pb-3 text-sm text-slate-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
            {filteredFaqs.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No FAQs match your search.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><MessageSquare size={18} /> Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {supportTickets.map((t) => (
                <div key={t.id} onClick={() => setDetailTicket(t.id)} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{t.subject}</p>
                      <span className="text-[9px] font-mono text-slate-400">{t.id}</span>
                    </div>
                    {ticketStatusBadge(t.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    {priorityBadge(t.priority)}
                    <span className="text-[10px] text-slate-400">{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead><TableHead>Subject</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setDetailTicket(t.id)}>
                      <TableCell className="text-xs font-mono text-slate-500">{t.id}</TableCell>
                      <TableCell className="text-sm text-slate-900">{t.subject}</TableCell>
                      <TableCell>{priorityBadge(t.priority)}</TableCell>
                      <TableCell>{ticketStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{t.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!detailTicket} onClose={() => setDetailTicket(null)} title="Ticket Details">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-700"><MessageSquare size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h4>
                <p className="text-sm text-slate-500 font-mono">{selectedTicket.id} &bull; {selectedTicket.date}</p>
                <div className="mt-1 flex gap-2">{priorityBadge(selectedTicket.priority)}{ticketStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600">Our support team is reviewing your request. You will be notified when there is an update.</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailTicket(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Ticket Modal */}
      <Modal isOpen={newTicketModal} onClose={() => { setNewTicketModal(false); setTicketSent(false); }} title="Submit Support Ticket">
        {ticketSent ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center"><Send size={32} className="text-emerald-600" /></div>
            <p className="text-lg font-bold text-emerald-700">Ticket submitted!</p>
            <p className="text-sm text-slate-500">We&apos;ll respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
              <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50" placeholder="Brief description of the issue" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Priority</label>
              <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none" placeholder="Describe the issue in detail..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setNewTicketModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={sendTicket} disabled={!ticketSubject.trim() || !ticketDesc.trim()} className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200">Submit Ticket</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
