"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Headphones, MessageCircle, Phone, Mail, ChevronRight, Send, Wrench } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

const supportChannels = [
  { title: "Equipment Support", description: "Issues with lens edgers, tracer, or lab equipment", contact: "tech-support@vemtap.com", phone: "+234 800 TECH", icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Inventory Support", description: "Stock requests, supplier issues, or order discrepancies", contact: "inventory@vemtap.com", phone: "+234 800 STOCK", icon: Headphones, color: "text-cyan-600", bg: "bg-cyan-50" },
  { title: "WhatsApp Helpline", description: "Quick optical support via WhatsApp", contact: "Chat on WhatsApp", phone: "+234 800 OPTIC", icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Email Support", description: "Non-urgent inquiries and optical documentation", contact: "optical@vemtap.com", phone: "Response within 24hrs", icon: Mail, color: "text-sky-600", bg: "bg-sky-50" },
];

const faqs = [
  { q: "How do I create a new lens order?", a: "Go to Lens Orders and click the order ID to see details. Use 'Start Production' to begin the workflow." },
  { q: "How do I track production progress?", a: "Go to Production where every order is shown by stage. Click 'Advance' to move to the next stage." },
  { q: "How do I manage inventory stock?", a: "Go to Inventory. You can view all frames, lenses, and accessories. 'Deduct' stock when items are used." },
  { q: "How do I complete a sale?", a: "Go to Optical Sales, find the pending sale, and click 'Complete Sale'. Inventory is deducted automatically." },
];

export default function OpticianSupport() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const sendTicket = () => {
    if (!ticketSubject.trim() || !ticketMsg.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketOpen(false); setTicketSent(false); setTicketSubject(""); setTicketMsg("");
    }, 1500);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Support" description="Get help with the optical hub. Contact support or browse common questions."
        actions={[{ label: "Submit Ticket", onClick: () => setTicketOpen(true), variant: "primary" }]} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        {supportChannels.map((ch) => (
          <Card key={ch.title}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${ch.bg} ${ch.color} shrink-0`}><ch.icon size={24} /></div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900">{ch.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{ch.description}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-slate-700">{ch.contact}</p>
                    <p className="text-sm text-slate-500">{ch.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-slate-200 open:border-amber-200 open:ring-1 open:ring-amber-100">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-4 pb-4"><p className="text-sm text-slate-600">{faq.a}</p></div>
            </details>
          ))}
        </CardContent>
      </Card>

      <Modal isOpen={ticketOpen} onClose={() => { setTicketOpen(false); setTicketSent(false); }} title="Submit Support Ticket">
        {ticketSent ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Send size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">Ticket submitted!</p>
            <p className="text-sm text-slate-500">We&apos;ll respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
              <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Brief description of the issue" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Message</label>
              <textarea value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)} rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                placeholder="Describe your issue in detail..." />
            </div>
            <button onClick={sendTicket} disabled={!ticketSubject.trim() || !ticketMsg.trim()}
              className="w-full inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Ticket
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
