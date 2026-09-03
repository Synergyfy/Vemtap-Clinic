"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Cog, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAllProductionItems, useUpdateProductionStage } from "@/hooks/useOptician";

const stageLabels: Record<string, string> = {
  received: "Order Received",
  lens_cutting: "Production Started",
  edging: "Edging",
  coating: "Coating",
  assembly: "Assembly",
  quality_check: "Quality Check",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
};

const stageOrder = ["received", "lens_cutting", "quality_check", "ready_for_pickup"];

function stageBadge(stage: string) {
  const label = stageLabels[stage] || stage;
  const colorMap: Record<string, string> = {
    received: "bg-slate-600 text-white",
    lens_cutting: "bg-amber-600 text-white",
    quality_check: "bg-violet-600 text-white",
    ready_for_pickup: "bg-emerald-600 text-white",
    completed: "bg-green-600 text-white",
  };
  return <Badge className={colorMap[stage] || "bg-slate-600 text-white"}>{label}</Badge>;
}

function ProductionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get("order");

  const { data: production = [], isLoading } = useAllProductionItems();
  const updateStage = useUpdateProductionStage();

  const [detailProd, setDetailProd] = useState<string | null>(null);

  const advanceStage = (prodId: string, currentStage: string) => {
    const idx = stageOrder.indexOf(currentStage);
    if (idx < stageOrder.length - 1) {
      const nextStage = stageOrder[idx + 1];
      updateStage.mutate({ orderId: prodId, stage: nextStage });
    }
  };

  const orderedProduction = useMemo(() => {
    return [...production].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
  }, [production]);

  const selectedProd = detailProd ? production.find((p) => p.id === detailProd) : null;
  const preselectedProd = preselectedOrder
    ? production.find((p) => p.lensOrderId === preselectedOrder)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading production queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Lens Production Tracking"
        description="Monitor every lens order through the production workflow: received → started → quality check → ready for pickup."
        actions={[
          { label: "Production Queue", href: "#queue", variant: "default" },
        ]}
      />

      {preselectedProd && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors shrink-0" title="Go back">
            <ArrowLeft size={18} />
          </button>
          <Cog size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Tracking production for <span className="font-bold">{preselectedProd.patientName}</span> — {preselectedProd.lensType}. Current stage: <strong>{stageLabels[preselectedProd.stage] || preselectedProd.stage}</strong>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {stageOrder.map((stage) => {
          const count = production.filter((p) => p.stage === stage).length;
          return (
            <Card key={stage}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500">{stageLabels[stage]}</p>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile: card layout per stage */}
      <div className="md:hidden space-y-4">
        {stageOrder.map((stage) => {
          const items = production.filter((p) => p.stage === stage);
          if (items.length === 0) return null;
          return (
            <Card key={stage}>
              <CardHeader className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-100">
                {stageBadge(stage)}
                <span className="text-xs font-medium text-slate-500">{items.length} item(s)</span>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100">
                {items.map((p) => (
                  <div key={p.id} className={`p-4 ${p.lensOrderId === preselectedOrder ? "bg-amber-50/50" : ""}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button onClick={() => setDetailProd(p.id)} className="font-medium text-slate-900 text-sm hover:text-amber-700 transition-colors truncate text-left">{p.patientName}</button>
                      <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{p.startedAt ? new Date(p.startedAt).toLocaleDateString() : "—"}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{p.lensType}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        <span className="font-medium text-slate-500">{p.technicianId || "Unassigned"}</span> &middot; Due: {p.estimatedCompletion ? new Date(p.estimatedCompletion).toLocaleDateString() : "—"}
                      </div>
                      {stageOrder.indexOf(stage) < stageOrder.length - 1 ? (
                        <button onClick={() => advanceStage(p.lensOrderId, stage)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Advance</button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><CheckCircle2 size={12} />Complete</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {production.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No production items.</p>}
      </div>

      {/* Desktop: table layout per stage */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <div className="min-w-[900px]">
          {stageOrder.map((stage) => {
            const items = production.filter((p) => p.stage === stage);
            if (items.length === 0) return null;
            return (
              <div key={stage} className="border-b border-slate-100 last:border-b-0">
                <div className="px-6 py-3 bg-slate-50 flex items-center gap-2">
                  {stageBadge(stage)}
                  <span className="text-xs font-medium text-slate-500">{items.length} item(s)</span>
                </div>
                <div className="p-4 sm:p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Lens Type</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Est. Completion</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((p) => (
                        <TableRow key={p.id} className={p.lensOrderId === preselectedOrder ? "bg-amber-50/50" : ""}>
                          <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                            <button onClick={() => setDetailProd(p.id)} className="hover:text-amber-700 transition-colors text-left">{p.patientName}</button>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.lensType}</TableCell>
                          <TableCell className="text-xs text-slate-500 tabular-nums">{p.startedAt ? new Date(p.startedAt).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-sm text-slate-600">{p.technicianId || "Unassigned"}</TableCell>
                          <TableCell className="text-xs text-slate-500">{p.estimatedCompletion ? new Date(p.estimatedCompletion).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-right">
                            {stageOrder.indexOf(stage) < stageOrder.length - 1 ? (
                              <button onClick={() => advanceStage(p.lensOrderId, stage)} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">
                                Advance to {stageLabels[stageOrder[stageOrder.indexOf(stage) + 1]]}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 size={14} />Complete</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
          {production.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No production items.</div>}
        </div>
      </div>

      <Modal isOpen={!!selectedProd} onClose={() => setDetailProd(null)} title="Production Item">
        {selectedProd && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <Cog size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedProd.patientName}</h4>
                <p className="text-sm text-slate-500">{selectedProd.lensType}</p>
                <div className="mt-1">{stageBadge(selectedProd.stage)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {stageOrder.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex flex-col items-center gap-1 ${stageOrder.indexOf(selectedProd.stage) >= i ? "text-amber-600" : "text-slate-300"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      stageOrder.indexOf(selectedProd.stage) > i ? "bg-emerald-100 text-emerald-700" :
                      stageOrder.indexOf(selectedProd.stage) === i ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-[9px] font-medium text-center leading-tight max-w-[70px]">{stageLabels[s]}</span>
                  </div>
                  {i < stageOrder.length - 1 && <div className="flex-1 h-px bg-slate-200 last:hidden" />}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Started</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.startedAt ? new Date(selectedProd.startedAt).toLocaleDateString() : "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Technician</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.technicianId || "Unassigned"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Completion</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.estimatedCompletion ? new Date(selectedProd.estimatedCompletion).toLocaleDateString() : "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order ID</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedProd.lensOrderId.slice(0, 8)}</p>
              </div>
            </div>

            {stageOrder.indexOf(selectedProd.stage) < stageOrder.length - 1 && (
              <button
                onClick={() => { advanceStage(selectedProd.lensOrderId, selectedProd.stage); setDetailProd(null); }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Advance to {stageLabels[stageOrder[stageOrder.indexOf(selectedProd.stage) + 1]]}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm font-medium">Loading production queue...</div></div>}>
      <ProductionContent />
    </Suspense>
  );
}
