"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Headphones, MessageCircle, Phone, Mail, ChevronRight, Send, ExternalLink, Bot } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

const supportChannels = [
  {
    title: "IT Support",
    description: "Technical issues with the nurse dashboard, devices, or software",
    email: "it-support@vemtap.com",
    phone: "+234 800 IT HELP",
    tel: "+234800ITHELP",
    icon: Headphones,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    title: "Clinical Support",
    description: "Medical protocol questions, patient escalation, or clinical guidance",
    email: "clinical@vemtap.com",
    phone: "+234 800 CLINIC",
    tel: "+234800CLINIC",
    icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "WhatsApp Helpline",
    description: "Quick support via WhatsApp for urgent issues",
    email: "Chat on WhatsApp",
    phone: "+234 800 NURSE",
    whatsapp: "234800NURSE",
    icon: MessageCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    isChat: true,
  },
  {
    title: "Email Support",
    description: "Non-urgent inquiries and documentation requests",
    email: "support@vemtap.com",
    phone: "Response within 24hrs",
    icon: Mail,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
];

const faqs = [
  {
    q: "How do I record patient vitals?",
    a: 'Go to "Vitals Entry" from the sidebar, find the patient in the list, and click "Record". Fill in the measurements and click "Save Vitals".',
  },
  {
    q: "How do I acknowledge monitoring alerts?",
    a: 'Go to "Monitoring", find the alert in the table, and click "Acknowledge". Confirm in the dialog that appears.',
  },
  {
    q: "How do I add treatment notes?",
    a: 'Go to "Treatment Notes" and click "Add Note". Select the patient, choose a category, write your note, and save.',
  },
  {
    q: "How do I schedule a follow-up?",
    a: 'Go to "Follow-ups" and click "Schedule New". Select the patient, enter the reason, pick a due date, and save.',
  },
  {
    q: "How do I mark a patient as completed?",
    a: 'Go to "Assigned Patients", find the patient under "Under Observation", and click "Mark Done". You can also do this from the patient detail modal.',
  },
];

export default function NurseSupport() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! I'm Vemtap Support Bot. How can I help you today?" },
  ]);

  const sendTicket = () => {
    if (!ticketSubject.trim() || !ticketMsg.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketOpen(false);
      setTicketSent(false);
      setTicketSubject("");
      setTicketMsg("");
    }, 1500);
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg.trim();
    setChatHistory((prev) => [...prev, { from: "user", text: msg }]);
    setChatMsg("");
    setTimeout(() => {
      const botReply =
        msg.toLowerCase().includes("vitals")
          ? "To record vitals, go to Vitals Entry, find the patient, and click Record. Fill in BP, temperature, pulse, and vision."
          : msg.toLowerCase().includes("alert")
            ? "Go to Monitoring, click Acknowledge on any open alert, and confirm."
            : msg.toLowerCase().includes("follow")
              ? "Go to Follow-ups, click Schedule New, pick a patient and date."
              : msg.toLowerCase().includes("hello") || msg.toLowerCase().includes("hi")
                ? "Hello! How can I assist you with your nursing workflow today?"
                : "I'll connect you with a human agent shortly. For urgent issues, please call the IT Helpline.";
      setChatHistory((prev) => [...prev, { from: "bot", text: botReply }]);
    }, 800);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Support"
        description="Get help with the nurse station. Contact our support team or browse common questions."
        actions={[{ label: "Submit Ticket", onClick: () => setTicketOpen(true), variant: "primary" }]}
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        {supportChannels.map((channel) => (
          <Card key={channel.title} className={channel.isChat ? "cursor-pointer hover:border-emerald-200 transition-all" : ""} onClick={channel.isChat ? () => setChatOpen(true) : undefined}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${channel.bg} ${channel.color} shrink-0`}>
                  <channel.icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{channel.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{channel.description}</p>
                  <div className="mt-3 space-y-1.5">
                    {channel.email && !channel.isChat && (
                      <a href={`mailto:${channel.email}`} className="flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors">
                        <Mail size={14} />
                        {channel.email}
                      </a>
                    )}
                    {channel.whatsapp && (
                      <a href={`https://wa.me/${channel.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                        <MessageCircle size={14} />
                        {channel.email}
                      </a>
                    )}
                    {channel.tel && (
                      <a href={`tel:${channel.tel}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                        <Phone size={14} />
                        {channel.phone}
                      </a>
                    )}
                    {!channel.tel && channel.phone && !channel.isChat && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Phone size={14} />
                        {channel.phone}
                      </p>
                    )}
                    {channel.isChat && (
                      <button onClick={() => setChatOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 mt-2">
                        <MessageCircle size={14} />
                        Start Live Chat
                      </button>
                    )}
                  </div>
                </div>
                {channel.isChat && <ExternalLink size={16} className="text-slate-300 shrink-0" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 open:border-cyan-200 open:ring-1 open:ring-cyan-100"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      {/* Live Chat Modal */}
      <Modal isOpen={chatOpen} onClose={() => { setChatOpen(false); setChatMsg(""); }} title="Live Chat Support">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.from === "user" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                  {msg.from === "bot" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bot size={12} className="text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Support Bot</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button onClick={sendChat} disabled={!chatMsg.trim()} className="rounded-xl bg-cyan-600 p-2.5 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={18} />
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={ticketOpen} onClose={() => { setTicketOpen(false); setTicketSent(false); }} title="Submit Support Ticket">
        {ticketSent ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Send size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">Ticket submitted!</p>
            <p className="text-sm text-slate-500">We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
              <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="Brief description of the issue" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Message</label>
              <textarea value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none" placeholder="Describe your issue in detail..." />
            </div>
            <div className="pt-2">
              <button onClick={sendTicket} disabled={!ticketSubject.trim() || !ticketMsg.trim()} className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Submit Ticket</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
