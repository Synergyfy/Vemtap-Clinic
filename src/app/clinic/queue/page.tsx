 "use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { clinicQueue, type ClinicQueueItem } from "@/app/clinic/_mock/clinic-data";

function stageBadge(stage: string) {
  if (stage === "Reception") return <Badge variant="secondary">Reception</Badge>;
  if (stage === "Vitals") return <Badge className="bg-indigo-600 text-white">Vitals</Badge>;
  if (stage === "Billing") return <Badge className="bg-emerald-600 text-white">Billing</Badge>;
  if (stage === "Consultation") return <Badge className="bg-sky-600 text-white">Consultation</Badge>;
  if (stage === "Refraction") return <Badge className="bg-purple-600 text-white">Refraction</Badge>;
  if (stage === "Optical") return <Badge className="bg-fuchsia-600 text-white">Optical</Badge>;
  return <Badge variant="outline">{stage}</Badge>;
}

function statusBadge(status: string) {
  if (status === "In-service") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  return <Badge variant="secondary">Waiting</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  return <Badge variant="outline">Normal</Badge>;
}

function renderWaitBadge(waitMinutes: number, priority: string) {
  if (priority === "Urgent") {
    return (
      <Badge className="bg-rose-50 border border-rose-200 text-rose-700 animate-pulse font-mono font-medium text-[10px]">
        ⏱️ {waitMinutes}m wait
      </Badge>
    );
  }
  if (waitMinutes > 20) {
    return (
      <Badge className="bg-amber-50 border border-amber-200 text-amber-700 font-mono font-medium text-[10px]">
        ⏱️ {waitMinutes}m wait
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 font-mono font-medium text-[10px]">
      ⏱️ {waitMinutes}m wait
    </Badge>
  );
}

function renderClinicalPath(currentStage: string, stageOrder: string[]) {
  const idx = stageOrder.indexOf(currentStage);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {stageOrder.map((s, sIdx) => {
        const isPast = sIdx < idx;
        const isCurrent = sIdx === idx;
        return (
          <React.Fragment key={s}>
            <span className={[
              "px-2 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase transition-all",
              isCurrent 
                ? "bg-sky-600 text-white shadow-sm ring-1 ring-sky-300 scale-105" 
                : isPast 
                  ? "bg-slate-100 text-slate-500 border border-slate-200" 
                  : "bg-slate-50 text-slate-300 border border-slate-100"
            ].join(" ")} title={s}>
              {s.substring(0, 3)}
            </span>
            {sIdx < stageOrder.length - 1 && (
              <span className={isPast ? "text-slate-400 text-[10px]" : "text-slate-200 text-[10px]"}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

type QueueTab = "Live board" | "Waiting patients" | "Doctor queue" | "Emergency queue" | "Analytics";

function tabButtonClass(active: boolean) {
  return [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "bg-sky-600 text-white" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ].join(" ");
}

function shortISODateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function QueuePage() {
  const [tab, setTab] = React.useState<QueueTab>("Live board");
  const [boardView, setBoardView] = React.useState<"flow-list" | "stage-focus" | "kanban">("flow-list");
  const [selectedStage, setSelectedStage] = React.useState<string>("Reception");
  const [queue, setQueue] = React.useState<ClinicQueueItem[]>(clinicQueue);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    patientName: "",
    stage: "Reception" as ClinicQueueItem["stage"],
    priority: "Normal" as ClinicQueueItem["priority"],
  });

  const stageOrder: ClinicQueueItem["stage"][] = ["Reception", "Vitals", "Consultation", "Refraction", "Optical", "Billing"];

  const activeQueue = queue.filter((q) => q.status !== "Done");
  const waiting = activeQueue.filter((q) => q.status === "Waiting").length;
  const inService = activeQueue.filter((q) => q.status === "In-service").length;
  const urgentCount = activeQueue.filter((q) => q.priority === "Urgent").length;
  const avgWait = Math.round(activeQueue.reduce((acc, q) => acc + q.waitMinutes, 0) / Math.max(1, activeQueue.length));
  const longestWait = Math.max(0, ...activeQueue.map((q) => q.waitMinutes));

  const stageCounts = stageOrder.map((stage) => ({
    stage,
    total: activeQueue.filter((q) => q.stage === stage).length,
    waiting: activeQueue.filter((q) => q.stage === stage && q.status === "Waiting").length,
    inService: activeQueue.filter((q) => q.stage === stage && q.status === "In-service").length,
  }));
  const maxStageTotal = Math.max(1, ...stageCounts.map((s) => s.total));

  const doctorQueue = activeQueue.filter((q) => q.stage === "Consultation" || q.stage === "Refraction");
  const emergencyQueue = activeQueue.filter((q) => q.priority === "Urgent");
  const waitingPatients = activeQueue.filter((q) => q.status === "Waiting");

  const updateItem = (id: string, patch: Partial<ClinicQueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const moveStage = (id: string, direction: -1 | 1) => {
    setQueue((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const idx = stageOrder.indexOf(q.stage);
        const next = stageOrder[Math.max(0, Math.min(stageOrder.length - 1, idx + direction))] ?? q.stage;
        return { ...q, stage: next };
      })
    );
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.patientName.trim()) return;
    const nextId = `Q-${200 + queue.length + 1}`;
    const newItem: ClinicQueueItem = {
      id: nextId,
      patientId: "P-NEW",
      patientName: addForm.patientName.trim(),
      stage: addForm.stage,
      priority: addForm.priority,
      waitMinutes: 0,
      status: "Waiting",
    };
    setQueue((prev) => [newItem, ...prev]);
    setIsAddOpen(false);
    setAddForm({ patientName: "", stage: "Reception", priority: "Normal" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Queue Management"
        description="Live patient flow by stage: reception → vitals → consultation → refraction → optical → billing."
        actions={[
          { label: "Open dashboard", href: "/clinic/dashboard" },
          { label: "Appointments", href: "/clinic/appointments" },
          { label: "Add to queue", onClick: () => setIsAddOpen(true), variant: "primary" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {(["Live board", "Waiting patients", "Doctor queue", "Emergency queue", "Analytics"] as QueueTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tabButtonClass(tab === t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In queue</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeQueue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Waiting</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In service</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inService}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Urgent</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{urgentCount}</p>
          </CardContent>
        </Card>
      </div>

      {tab === "Live board" ? (
        <div className="space-y-6">
          {/* Top layout view switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">Layout View:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBoardView("flow-list")}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                    boardView === "flow-list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  ].join(" ")}
                >
                  📋 Clinical Flow List
                </button>
                <button
                  type="button"
                  onClick={() => setBoardView("stage-focus")}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                    boardView === "stage-focus" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  ].join(" ")}
                >
                  🏥 Department Focus
                </button>
                <button
                  type="button"
                  onClick={() => setBoardView("kanban")}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                    boardView === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  ].join(" ")}
                >
                  📊 Kanban Board
                </button>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Updated {shortISODateTime(new Date().toISOString())}</p>
          </div>

          {/* 1. Clinical Flow List View */}
          {boardView === "flow-list" && (
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Active Patient Queue Flow</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Enterprise clinical view showing all active patients sorted by clinical path priority and wait times.</p>
                  </div>
                  <Badge className="bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold px-3 py-1">
                    {activeQueue.length} Active Patients
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Table Layout: visible on tablet/desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-[120px] font-bold text-slate-700">Queue ID</TableHead>
                        <TableHead className="font-bold text-slate-700">Patient Name</TableHead>
                        <TableHead className="font-bold text-slate-700">Current Stage</TableHead>
                        <TableHead className="font-bold text-slate-700 w-[300px]">Clinical Progress Path</TableHead>
                        <TableHead className="font-bold text-slate-700">Wait Duration</TableHead>
                        <TableHead className="font-bold text-slate-700">Priority & Status</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 pr-6">Quick Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeQueue.length > 0 ? (
                        activeQueue
                          .slice()
                          .sort((a, b) => (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes)
                          .map((q) => (
                            <TableRow key={q.id} className={[
                              "hover:bg-slate-50/50 transition-colors",
                              q.priority === "Urgent" ? "bg-rose-50/20 hover:bg-rose-50/30" : ""
                            ].join(" ")}>
                              <TableCell className="font-mono font-bold text-slate-600">{q.id}</TableCell>
                              <TableCell>
                                <div className="font-bold text-slate-900 text-sm">{q.patientName}</div>
                                <div className="text-xs text-slate-400 font-medium">Patient ID: {q.patientId}</div>
                              </TableCell>
                              <TableCell>{stageBadge(q.stage)}</TableCell>
                              <TableCell>{renderClinicalPath(q.stage, stageOrder)}</TableCell>
                              <TableCell>{renderWaitBadge(q.waitMinutes, q.priority)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {priorityBadge(q.priority)}
                                  {statusBadge(q.status)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, -1)}
                                    className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    disabled={stageOrder.indexOf(q.stage) === 0}
                                    title="Move to Previous Stage"
                                  >
                                    ← Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: q.status === "In-service" ? "Waiting" : "In-service" })}
                                    className={[
                                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all border shadow-sm",
                                      q.status === "In-service"
                                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                        : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                                    ].join(" ")}
                                  >
                                    {q.status === "In-service" ? "⏸ Pause" : "▶ Serve"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, 1)}
                                    className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    disabled={stageOrder.indexOf(q.stage) === stageOrder.length - 1}
                                    title="Move to Next Stage"
                                  >
                                    Next →
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: "Done" })}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                                  >
                                    ✓ Done
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="max-w-md mx-auto">
                              <p className="text-base font-semibold text-slate-700">No active patients in queue</p>
                              <p className="text-sm text-slate-400 mt-1">Add a patient using the "Add to queue" action button above.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Grid Layout: visible on smaller screens */}
                <div className="block md:hidden divide-y divide-slate-100 bg-white">
                  {activeQueue.length > 0 ? (
                    activeQueue
                      .slice()
                      .sort((a, b) => (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes)
                      .map((q) => (
                        <div key={q.id} className={[
                          "p-4 flex flex-col gap-3 transition-colors",
                          q.priority === "Urgent" ? "bg-rose-50/20" : ""
                        ].join(" ")}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{q.patientName}</div>
                              <div className="text-xs text-slate-400 font-mono font-medium mt-0.5">#{q.id} • ID: {q.patientId}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {priorityBadge(q.priority)}
                              {statusBadge(q.status)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-500">Stage:</span>
                            {stageBadge(q.stage)}
                            <div className="ml-auto">
                              {renderWaitBadge(q.waitMinutes, q.priority)}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Path:</div>
                            {renderClinicalPath(q.stage, stageOrder)}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => moveStage(q.id, -1)}
                                className="flex-1 py-2 hover:bg-slate-150 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-30 flex items-center justify-center bg-white"
                                disabled={stageOrder.indexOf(q.stage) === 0}
                              >
                                ← Back
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStage(q.id, 1)}
                                className="flex-1 py-2 hover:bg-slate-150 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-30 flex items-center justify-center bg-white"
                                disabled={stageOrder.indexOf(q.stage) === stageOrder.length - 1}
                              >
                                Next →
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateItem(q.id, { status: q.status === "In-service" ? "Waiting" : "In-service" })}
                                className={[
                                  "flex-1 py-2 text-xs font-bold rounded-xl transition-all border shadow-sm flex items-center justify-center",
                                  q.status === "In-service"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-sky-50 border-sky-200 text-sky-700"
                                ].join(" ")}
                              >
                                {q.status === "In-service" ? "⏸ Pause" : "▶ Serve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateItem(q.id, { status: "Done" })}
                                className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 transition-colors shadow-sm flex items-center justify-center"
                              >
                                Done ✓
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 bg-white">
                      <p className="text-sm font-semibold text-slate-600">No active patients in queue</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Department Focus View */}
          {boardView === "stage-focus" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Department Selector Sidebar */}
              <div className="lg:col-span-1 space-y-3">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Departments</h3>
                  <div className="space-y-2">
                    {stageOrder.map((stage) => {
                      const stageItems = activeQueue.filter((q) => q.stage === stage);
                      const stageUrgent = stageItems.filter((i) => i.priority === "Urgent").length;
                      const isSelected = selectedStage === stage;
                      return (
                        <button
                          type="button"
                          key={stage}
                          onClick={() => setSelectedStage(stage)}
                          className={[
                            "w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5",
                            isSelected
                              ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-100"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm">{stage}</span>
                            <span className={[
                              "text-xs px-2 py-0.5 rounded-full font-bold",
                              isSelected
                                ? "bg-sky-700 text-white"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            ].join(" ")}>
                              {stageItems.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between w-full text-xs opacity-80">
                            <span>{stageUrgent} urgent</span>
                            <span>•</span>
                            <span>{stageItems.filter((i) => i.status === "Waiting").length} waiting</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Department Queue List */}
              <div className="lg:col-span-3">
                <Card className="border border-slate-200 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <CardHeader className="bg-white border-b border-slate-100 py-5 flex-row items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-bold text-slate-900">{selectedStage} Queue</CardTitle>
                          {stageBadge(selectedStage)}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Live operational queue list for {selectedStage} department.</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          {activeQueue.filter((q) => q.stage === selectedStage).length}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Patients waiting/in-service</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {activeQueue.filter((q) => q.stage === selectedStage).length > 0 ? (
                          activeQueue
                            .filter((q) => q.stage === selectedStage)
                            .slice()
                            .sort((a, b) => (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes)
                            .map((q) => (
                              <div key={q.id} className={[
                                "p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4",
                                q.priority === "Urgent" ? "bg-rose-50/10 hover:bg-rose-50/20" : ""
                              ].join(" ")}>
                                <div className="flex items-start gap-4">
                                  <div className="bg-slate-100 text-slate-700 text-xs font-mono font-black p-2.5 rounded-xl border border-slate-200">
                                    {q.id}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900 text-base">{q.patientName}</h4>
                                      {priorityBadge(q.priority)}
                                      {statusBadge(q.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                      <span>Patient ID: {q.patientId}</span>
                                      <span>•</span>
                                      <span>{renderWaitBadge(q.waitMinutes, q.priority)}</span>
                                    </div>
                                    <div className="pt-1.5">
                                      {renderClinicalPath(q.stage, stageOrder)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, -1)}
                                    className="px-3 py-2 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    disabled={stageOrder.indexOf(q.stage) === 0}
                                  >
                                    ← Back
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: q.status === "In-service" ? "Waiting" : "In-service" })}
                                    className={[
                                      "px-4 py-2 text-xs font-bold rounded-xl transition-all border shadow-sm",
                                      q.status === "In-service"
                                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                        : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                                    ].join(" ")}
                                  >
                                    {q.status === "In-service" ? "⏸ Pause" : "▶ Serve"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, 1)}
                                    className="px-3 py-2 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    disabled={stageOrder.indexOf(q.stage) === stageOrder.length - 1}
                                  >
                                    Next Dept →
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: "Done" })}
                                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                                  >
                                    ✓ Done
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-20">
                            <div className="max-w-md mx-auto">
                              <div className="text-3xl">📭</div>
                              <h4 className="text-base font-semibold text-slate-700 mt-2">No patients currently in {selectedStage}</h4>
                              <p className="text-sm text-slate-400 mt-1">Patients will appear here once they are checked in or moved from other stages.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 3. Spacious Kanban Board View */}
          {boardView === "kanban" && (
            <div className="-mx-6 overflow-x-auto px-6 pb-4">
              <div className="flex gap-5" style={{ minWidth: "1800px" }}>
                {stageOrder.map((stage) => {
                  const items = activeQueue
                    .filter((q) => q.stage === stage)
                    .slice()
                    .sort(
                      (a, b) =>
                        (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes
                    );

                  return (
                    <div key={stage} className="flex-1 min-w-[280px] max-w-[340px] rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col">
                      <div className="border-b border-slate-200 px-4 py-3 bg-white rounded-t-2xl">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{stage}</p>
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                            {items.length}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                          <span>{items.filter((i) => i.priority === "Urgent").length} urgent</span>
                          <span>•</span>
                          <span>{items.filter((i) => i.status === "Waiting").length} waiting</span>
                        </div>
                      </div>
                      <div className="max-h-[580px] space-y-3 overflow-auto p-4 flex-1">
                        {items.length ? (
                          items.map((q) => (
                            <div
                              key={q.id}
                              className={[
                                "rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all",
                                q.priority === "Urgent" ? "border-rose-200 bg-rose-50/30" : "hover:border-slate-300",
                              ].join(" ")}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{q.patientName}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">#{q.id}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    {priorityBadge(q.priority)}
                                    {statusBadge(q.status)}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                  <span>Wait time:</span>
                                  {renderWaitBadge(q.waitMinutes, q.priority)}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                  {renderClinicalPath(q.stage, stageOrder)}
                                </div>
                                
                                <div className="flex items-center gap-1 mt-1 pt-2 border-t border-slate-100 justify-between">
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, -1)}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors text-xs font-bold"
                                    disabled={stageOrder.indexOf(q.stage) === 0}
                                    title="Move back"
                                  >
                                    ←
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: q.status === "In-service" ? "Waiting" : "In-service" })}
                                    className={[
                                      "px-2 py-1 text-[11px] font-bold rounded-lg transition-colors flex-1 text-center border shadow-sm mx-1",
                                      q.status === "In-service"
                                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                        : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                                    ].join(" ")}
                                  >
                                    {q.status === "In-service" ? "Pause" : "Serve"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveStage(q.id, 1)}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors text-xs font-bold"
                                    disabled={stageOrder.indexOf(q.stage) === stageOrder.length - 1}
                                    title="Move forward"
                                  >
                                    →
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(q.id, { status: "Done" })}
                                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm ml-1"
                                  >
                                    ✓ Done
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-5 text-center">
                            <p className="text-xs font-semibold text-slate-700">No patients</p>
                            <p className="mt-1 text-[10px] text-slate-400">Empty stage</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {tab === "Waiting patients" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Waiting patients</CardTitle>
            <p className="text-sm text-slate-500">{waitingPatients.length} waiting</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingPatients
                  .slice()
                  .sort(
                    (a, b) =>
                      (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes
                  )
                  .map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.patientName}</TableCell>
                      <TableCell>{stageBadge(q.stage)}</TableCell>
                      <TableCell>{priorityBadge(q.priority)}</TableCell>
                      <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Doctor queue" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Doctor queue</CardTitle>
            <p className="text-sm text-slate-500">{doctorQueue.length} patient(s)</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorQueue
                  .slice()
                  .sort(
                    (a, b) =>
                      (b.priority === "Urgent" ? 1 : 0) - (a.priority === "Urgent" ? 1 : 0) || b.waitMinutes - a.waitMinutes
                  )
                  .map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.patientName}</TableCell>
                      <TableCell>{stageBadge(q.stage)}</TableCell>
                      <TableCell>{priorityBadge(q.priority)}</TableCell>
                      <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Emergency queue" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Emergency queue</CardTitle>
            <p className="text-sm text-slate-500">{emergencyQueue.length} urgent case(s)</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emergencyQueue
                  .slice()
                  .sort((a, b) => b.waitMinutes - a.waitMinutes)
                  .map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.patientName}</TableCell>
                      <TableCell>{stageBadge(q.stage)}</TableCell>
                      <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Analytics" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Queue analytics</CardTitle>
              <p className="text-sm text-slate-500">Today</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Average wait</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{avgWait}m</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Longest wait</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{longestWait}m</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Urgent cases</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{urgentCount}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Load by stage</p>
                <p className="mt-1 text-sm text-slate-500">Current patients in each stage (excluding Done).</p>
                <div className="mt-4 space-y-3">
                  {stageCounts.map((s) => {
                    const width = Math.round((s.total / maxStageTotal) * 100);
                    return (
                      <div key={s.stage} className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-700">{s.stage}</p>
                          <p className="text-sm text-slate-500 tabular-nums">
                            {s.total} total • {s.waiting} waiting • {s.inService} in service
                          </p>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-sky-600" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Bottleneck stage</p>
                <p className="mt-1 text-sm text-slate-500">
                  {stageCounts.slice().sort((a, b) => b.total - a.total)[0]?.stage ?? "—"} has the highest queue load right now.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Doctor queue</p>
                <p className="mt-1 text-sm text-slate-500">{doctorQueue.length} patient(s) awaiting consultation/refraction.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Emergency</p>
                <p className="mt-1 text-sm text-slate-500">{emergencyQueue.length} urgent case(s) need fast-tracking.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add patient to queue">
        <form onSubmit={submitAdd} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Patient name</label>
            <input
              value={addForm.patientName}
              onChange={(e) => setAddForm((p) => ({ ...p, patientName: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Fatima Yusuf"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Stage</label>
              <select
                value={addForm.stage}
                onChange={(e) => setAddForm((p) => ({ ...p, stage: e.target.value as ClinicQueueItem["stage"] }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                {stageOrder.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select
                value={addForm.priority}
                onChange={(e) => setAddForm((p) => ({ ...p, priority: e.target.value as ClinicQueueItem["priority"] }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Add to queue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
