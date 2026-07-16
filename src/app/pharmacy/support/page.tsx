"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, ChevronDown, Search, LifeBuoy, AlertCircle } from "lucide-react";
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

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Help & Support" description="Get help with pharmacy operations, FAQs, and submit support tickets."
        actions={[{ label: "Submit Ticket", variant: "primary", onClick: () => setNewTicketModal(true) }]} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-700"><LifeBuoy size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">IT Support Desk</p>
              <p className="text-xs text-slate-500">it@vemtap.com • Ext. 2100</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700"><Phone size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">Pharmacy Hotline</p>
              <p className="text-xs text-slate-500">+234 800 PHARMACY</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700"><Clock size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">Hours</p>
              <p className="text-xs text-slate-500">Mon-Sat 7AM-9PM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><HelpCircle size={18} /> Frequently Asked Questions</CardTitle>
            <div className="relative w-40 md:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search FAQ..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-900">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-3 pb-3 text-sm text-slate-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
            {filteredFaqs.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No FAQs match your search.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare size={18} /> Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((t) => (
                    <TableRow key={t.id}>
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

      <Modal isOpen={newTicketModal} onClose={() => setNewTicketModal(false)} title="Submit Support Ticket">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
            <input type="text" placeholder="Brief description of the issue..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
            <select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea rows={4} placeholder="Describe the issue in detail..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white resize-none" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setNewTicketModal(false)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
            <button onClick={() => setNewTicketModal(false)} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">Submit Ticket</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
