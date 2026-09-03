"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Headphones, MessageSquare, Book, LifeBuoy, Send, Phone, Mail, ExternalLink, Search, CheckCircle2, X, Clock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const articles = [
  { title: "How to use the visual acuity module", category: "Clinical", reads: 342 },
  { title: "Interpreting automated refraction data", category: "Clinical", reads: 201 },
  { title: "Managing multi-branch patient records", category: "Admin", reads: 156 },
];

export default function DoctorSupport() {
  const [chatOpen, setChatOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState<{ title: string; category: string; reads: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string; time: string }[]>([
    { role: "bot", text: "Hello! I'm the Vemtap clinical support assistant. How can I help you today?", time: "Just now" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: "user", text: chatInput, time }]);
    setChatInput("");
    setTimeout(() => {
      const responses = [
        "I've checked our knowledge base. Here's what I found regarding your query. Would you like me to open the relevant article?",
        "That's a great question! Our support team typically responds within 2 hours during working hours. I'll escalate this to a specialist.",
        "I understand the issue. Let me guide you through the steps. First, navigate to the Settings panel in your dashboard..."
      ];
      setChatMessages(prev => [...prev, { role: "bot", text: responses[Math.floor(Math.random() * responses.length)], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Help & Support" description="Need assistance? Our clinical support team is here to help you 24/7." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Live Chat */}
        <Card className="bg-emerald-600 text-white border-none">
          <CardContent className="p-4 sm:p-6">
            <MessageSquare size={28} className="mb-3 sm:mb-4 text-emerald-100 sm:w-8 sm:h-8" />
            <h3 className="text-base sm:text-lg font-bold">Live Chat</h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 mb-4 sm:mb-6">Talk to a support specialist right now for urgent issues.</p>
            <button onClick={() => setChatOpen(true)} className="w-full py-2.5 sm:py-3 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-all text-xs sm:text-sm">
              Start Conversation
            </button>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Book size={16} className="text-emerald-600 sm:w-5 sm:h-5" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
            {articles.map((a) => (
              <button key={a.title} onClick={() => setArticleOpen(a)} className="w-full text-left text-xs sm:text-sm text-slate-500 italic underline cursor-pointer hover:text-emerald-600 transition-colors">{a.title}</button>
            ))}
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <LifeBuoy size={16} className="text-sky-600 sm:w-5 sm:h-5" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2">
            <a href="mailto:clinical@vemtap.com" className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold hover:text-emerald-600 transition-colors">
              <Mail size={14} className="text-slate-400" /> Email: <span className="text-slate-500 font-medium underline">clinical@vemtap.com</span>
            </a>
            <a href="tel:+234800836827" className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold hover:text-emerald-600 transition-colors">
              <Phone size={14} className="text-slate-400" /> Phone: <span className="text-slate-500 font-medium underline">+234 (0) 800 VEMTAP</span>
            </a>
            <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 leading-relaxed">Available Mon-Fri, 8 AM - 6 PM for technical training.</p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Live Chat Modal */}
      <Modal isOpen={chatOpen} onClose={() => setChatOpen(false)} title="Live Support Chat" className="max-w-md">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "bot" && <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-1"><Headphones size={14} /></div>}
                <div className={cn("max-w-[80%] p-3 rounded-2xl", msg.role === "user" ? "bg-emerald-600 text-white rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md")}>
                  <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                  <p className={cn("text-[9px] mt-1 font-bold", msg.role === "user" ? "text-emerald-200" : "text-slate-400")}>{msg.time}</p>
                </div>
                {msg.role === "user" && <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1"><User size={14} /></div>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type your message..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            <button onClick={sendMessage} className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all"><Send size={18} /></button>
          </div>
        </div>
      </Modal>

      {/* 2. Knowledge Base Article Modal */}
      <Modal isOpen={!!articleOpen} onClose={() => setArticleOpen(null)} title={articleOpen?.title || ""}>
        {articleOpen && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px]">{articleOpen.category}</Badge>
              <Badge variant="outline" className="text-[10px] font-mono">{articleOpen.reads} reads</Badge>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                This article provides a comprehensive guide on <strong>{articleOpen.title}</strong>. It covers step-by-step instructions, best practices, and troubleshooting tips for clinical staff using the Vemtap platform.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Article Sections</h4>
              {["Overview & Prerequisites", "Step-by-Step Guide", "Common Issues & Fixes", "Video Tutorial"].map((section, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">{i + 1}</div>
                  <span className="text-sm font-bold text-slate-700">{section}</span>
                  <ArrowRight size={16} className="ml-auto text-slate-300" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setArticleOpen(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
              <button onClick={() => { showToast(`Opening "${articleOpen.title}" in full view...`); setArticleOpen(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"><ExternalLink size={16} /> Open Article</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
