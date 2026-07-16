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
import { useOpticianStore } from "@/app/optician/_mock/optician-store";
import type { ProductionStage } from "@/app/optician/_mock/optician-data";

function stageBadge(stage: string) {
  if (stage === "Order Received") return <Badge className="bg-slate-600 text-white">Order Received</Badge>;
  if (stage === "Production Started") return <Badge className="bg-amber-600 text-white">Production Started</Badge>;
  if (stage === "Quality Check") return <Badge className="bg-violet-600 text-white">Quality Check</Badge>;
  if (stage === "Ready for Pickup") return <Badge className="bg-emerald-600 text-white">Ready for Pickup</Badge>;
  return <Badge variant="outline">{stage}</Badge>;
}

const stageOrder: ProductionStage[] = ["Order Received", "Production Started", "Quality Check", "Ready for Pickup"];

function ProductionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get("order");

  const production = useOpticianStore((s) => s.production);
  const orders = useOpticianStore((s) => s.orders);
  const updateProductionStage = useOpticianStore((s) => s.updateProductionStage);
  const updateOrderStatus = useOpticianStore((s) => s.updateOrderStatus);

  const [detailProd, setDetailProd] = useState<string | null>(null);

  const advanceStage = (prodId: string, currentStage: ProductionStage) => {
    const idx = stageOrder.indexOf(currentStage);
    if (idx < stageOrder.length - 1) {
      const nextStage = stageOrder[idx + 1];
      updateProductionStage(prodId, nextStage);

      const prod = production.find((p) => p.id === prodId);
      if (prod && nextStage === "Ready for Pickup") {
        updateOrderStatus(prod.orderId, "Ready");
      }
    }
  };

  const orderedProduction = useMemo(() => {
    return [...production].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
  }, [production]);

  const selectedProd = detailProd ? production.find((p) => p.id === detailProd) : null;
  const preselectedProd = preselectedOrder
    ? production.find((p) => p.orderId === preselectedOrder)
    : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Lens Production Tracking"
        description="Monitor every lens order through the production workflow: received → started → quality check → ready for pickup."
        actions={[
          { label: "Production Queue", href: "#queue", variant: "primary" },
        ]}
      />

      {preselectedProd && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors shrink-0" title="Go back">
            <ArrowLeft size={18} />
          </button>
          <Cog size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Tracking production for <span className="font-bold">{preselectedProd.patientName}</span> — {preselectedProd.lensType}. Current stage: <strong>{preselectedProd.stage}</strong>.
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
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500">{stage}</p>
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
                  <div key={p.id} className={`p-4 ${p.orderId === preselectedOrder ? "bg-amber-50/50" : ""}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button onClick={() => setDetailProd(p.id)} className="font-medium text-slate-900 text-sm hover:text-amber-700 transition-colors truncate text-left">{p.patientName}</button>
                      <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{p.startedAt}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{p.lensType}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        <span className="font-medium text-slate-500">{p.assignedTo}</span> &middot; Due: {p.estimatedCompletion}
                      </div>
                      {stageOrder.indexOf(stage) < stageOrder.length - 1 ? (
                        <button onClick={() => advanceStage(p.id, stage)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Advance</button>
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
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Est. Completion</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((p) => (
                        <TableRow key={p.id} className={p.orderId === preselectedOrder ? "bg-amber-50/50" : ""}>
                          <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                            <button onClick={() => setDetailProd(p.id)} className="hover:text-amber-700 transition-colors text-left">{p.patientName}</button>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.lensType}</TableCell>
                          <TableCell className="text-xs text-slate-500 tabular-nums">{p.startedAt}</TableCell>
                          <TableCell className="text-sm text-slate-600">{p.assignedTo}</TableCell>
                          <TableCell className="text-xs text-slate-500">{p.estimatedCompletion}</TableCell>
                          <TableCell className="text-right">
                            {stageOrder.indexOf(stage) < stageOrder.length - 1 ? (
                              <button onClick={() => advanceStage(p.id, stage)} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">
                                Advance to {stageOrder[stageOrder.indexOf(stage) + 1]}
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
                    <span className="text-[9px] font-medium text-center leading-tight max-w-[70px]">{s}</span>
                  </div>
                  {i < stageOrder.length - 1 && <div className="flex-1 h-px bg-slate-200 last:hidden" />}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Started</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.startedAt}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.assignedTo}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Completion</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedProd.estimatedCompletion}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order Ref</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedProd.orderId}</p>
              </div>
            </div>

            {stageOrder.indexOf(selectedProd.stage) < stageOrder.length - 1 && (
              <button
                onClick={() => { advanceStage(selectedProd.id, selectedProd.stage); setDetailProd(null); }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Advance to {stageOrder[stageOrder.indexOf(selectedProd.stage) + 1]}
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
