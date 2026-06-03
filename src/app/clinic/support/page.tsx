"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { 
  clinicSupportTickets, 
  clinicKnowledgeBase, 
  clinicSuccessTeam, 
  clinicIncidentLogs 
} from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";
import { cn } from "@/lib/utils";
import { 
  Headphones, 
  MessageSquare, 
  BookOpen, 
  Activity, 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  Mail,
  LifeBuoy,
  Download
} from "lucide-react";

type SupportTab = "tickets" | "success" | "kb" | "health";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "resolved" || s === "operational") return <Badge className="bg-emerald-600 text-white">{status}</Badge>;
  if (s === "awaiting user" || s === "monitoring") return <Badge className="bg-amber-600 text-white">{status}</Badge>;
  return <Badge className="bg-sky-600 text-white">{status}</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (priority === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
}

export default function SupportPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<SupportTab>("tickets");

  const tabs = [
    { id: "tickets", label: "Support Tickets", icon: MessageSquare },
    { id: "success", label: "Success Team", icon: LifeBuoy },
    { id: "kb", label: "Knowledge Base", icon: BookOpen },
    { id: "health", label: "System Health", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Success"
        description="24/7 dedicated support hub for technical issues, training, and account success."
        actions={[
          { label: "Create New Ticket", variant: "primary", onClick: () => openModal("support-ticket") },
          { label: "Live WhatsApp Support", variant: "outline", onClick: () => alert("Redirecting to dedicated WhatsApp support channel...") },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SupportTab)}
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

      <div className="space-y-6">
        {activeTab === "tickets" && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Tickets", value: clinicSupportTickets.length, icon: MessageSquare, color: "text-slate-600" },
                  { label: "Open Now", value: clinicSupportTickets.filter(t => t.status === "Open").length, icon: Clock, color: "text-sky-600" },
                  { label: "Avg Resolution", value: "4.2h", icon: CheckCircle2, color: "text-emerald-600" },
                  { label: "Network Uptime", value: "99.98%", icon: Activity, color: "text-blue-600" },
                ].map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm bg-white">
                      <CardContent className="p-6">
                         <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <stat.icon size={14} className={stat.color} />
                         </div>
                         <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      </CardContent>
                   </Card>
                ))}
             </div>

             <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
                <CardHeader className="px-8 py-6 border-b border-slate-50">
                   <CardTitle className="text-lg">Recent Service Requests</CardTitle>
                   <p className="text-sm text-slate-500">Track the progress of your technical and operational tickets.</p>
                </CardHeader>
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow>
                         <TableHead className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</TableHead>
                         <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</TableHead>
                         <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</TableHead>
                         <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                         <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8 text-right">Updated</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {clinicSupportTickets.map((t) => (
                         <TableRow key={t.id} className="hover:bg-slate-50/50 border-slate-50">
                            <TableCell className="px-8 py-5 font-bold text-slate-900">{t.id}</TableCell>
                            <TableCell className="py-5 font-medium text-slate-700">{t.subject}</TableCell>
                            <TableCell className="py-5">{priorityBadge(t.priority)}</TableCell>
                            <TableCell className="py-5">{statusBadge(t.status)}</TableCell>
                            <TableCell className="py-5 pr-8 text-right font-medium text-slate-500 tabular-nums">
                               {t.updatedISO.split("T")[0]}
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </Card>
          </div>
        )}

        {activeTab === "success" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-8 bg-brand-navy text-white">
                    <h3 className="text-xl font-bold mb-2">Dedicated Support Team</h3>
                    <p className="text-white/60 text-sm mb-8 leading-relaxed">
                       Your clinic has a dedicated success team to ensure smooth operations. Connect with us instantly for any growth or technical needs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {clinicSuccessTeam.map(person => (
                          <div key={person.name} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-black">
                                {person.avatar}
                             </div>
                             <div>
                                <p className="font-bold">{person.name}</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{person.role}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">{person.availability}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-emerald-100">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                             <Smartphone size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Direct</p>
                       </div>
                       <p className="text-xs text-slate-600 font-medium mb-6">Fastest response for operational queries and quick fixes.</p>
                       <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold" onClick={() => alert("Redirecting to WhatsApp support...")}>Start Chat</Button>
                    </Card>
                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-sky-100">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                             <Mail size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Assistance</p>
                       </div>
                       <p className="text-xs text-slate-600 font-medium mb-6">Best for formal requests, billing issues, and contract updates.</p>
                       <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold" onClick={() => alert("Opening default email client to support@vemtap.com...")}>Email Us</Button>
                    </Card>
                 </div>
              </div>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Training & Onboarding</p>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-sm font-bold text-slate-900">Staff Training Session</p>
                       <p className="text-xs text-slate-500 leading-relaxed">Book a personalized training session for your new nurses or front desk team.</p>
                       <Button variant="outline" className="w-full mt-4 rounded-xl font-bold border-slate-100 h-10 text-xs" onClick={() => alert("Opening training scheduler...")}>Book Session</Button>
                    </div>
                    <div className="pt-6 border-t border-slate-50 space-y-2">
                       <p className="text-sm font-bold text-slate-900">Platform Feedback</p>
                       <p className="text-xs text-slate-500 leading-relaxed">Have a feature suggestion? Help us shape the future of Vemtap.</p>
                       <Button variant="ghost" className="w-full mt-2 rounded-xl font-bold text-sky-600 h-10 text-xs" onClick={() => alert("Feature feedback form triggered...")}>Submit Idea</Button>
                    </div>
                 </div>
              </Card>
           </div>
        )}

        {activeTab === "kb" && (
           <div className="space-y-6">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                 <input 
                    type="text" 
                    placeholder="Search for articles, guides, or troubleshooting..." 
                    className="w-full bg-white border border-slate-200 rounded-3xl pl-12 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-100 transition-all shadow-sm"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {clinicKnowledgeBase.map(article => (
                    <Card key={article.id} onClick={() => openModal("kb-article")} className="border-none shadow-sm rounded-3xl hover:translate-y-[-4px] transition-all cursor-pointer group bg-white">
                       <CardContent className="p-6">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-sky-600 group-hover:text-white transition-colors mb-4">
                             <BookOpen size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{article.category}</p>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-4">{article.title}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{article.readTime} Read</span>
                             <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        )}

        {activeTab === "health" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                 <CardHeader className="p-0 mb-8 flex-row items-center justify-between">
                    <div>
                       <CardTitle className="text-lg">Network Service Status</CardTitle>
                       <p className="text-sm text-slate-500 mt-1">Real-time health of Vemtap's core infrastructure and integrations.</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] px-3 py-1">ALL SYSTEMS OPERATIONAL</Badge>
                 </CardHeader>
                 <div className="space-y-6">
                    {[
                      { name: "Core Dashboard API", status: "Operational", load: "12ms" },
                      { name: "NHIA Verification Sync", status: "Operational", load: "145ms" },
                      { name: "HMO Portal Integration", status: "Operational", load: "210ms" },
                      { name: "WhatsApp Notification Gateway", status: "Operational", load: "85ms" },
                      { name: "Patient Portal (Mobile)", status: "Operational", load: "18ms" },
                    ].map(service => (
                       <div key={service.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span className="text-sm font-bold text-slate-700">{service.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{service.load}</span>
                             {statusBadge(service.status)}
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              <div className="space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Incident Log (Last 24h)</p>
                    <div className="space-y-4">
                       {clinicIncidentLogs.map(inc => (
                          <div key={inc.id} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                             <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold leading-tight pr-4">{inc.issue}</p>
                                <span className={cn(
                                   "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                                   inc.severity === "High" ? "bg-rose-500 text-white" : "bg-white/10 text-white/60"
                                )}>{inc.severity}</span>
                             </div>
                             <div className="flex items-center gap-2 mt-2">
                                {statusBadge(inc.status)}
                                <span className="text-[10px] text-white/40 font-bold">{inc.time}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-sky-100">
                    <p className="text-sm font-bold text-slate-900 mb-2">Technical Audit</p>
                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">Download your clinic's technical performance and uptime report for the last quarter.</p>
                    <Button variant="outline" className="w-full rounded-xl font-bold border-sky-100 text-sky-600 h-11 text-xs" onClick={() => alert("Downloading global systems audit XLSX...")}>
                       <Download size={14} className="mr-2" /> Download Audit
                    </Button>
                 </Card>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
