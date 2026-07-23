"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useHmoAdvancedStore, formatNGN, getDaysSince } from "@/store/hmoAdvancedStore";
import { exportClaimsCsv } from "@/lib/claim-exports";
import {
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  FileText, ArrowRight, DollarSign, Activity,
  ShieldAlert, Search, Download, Loader2,
  BarChart3, Plus, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'approved' || s === 'reconciled') return 'text-emerald-600 bg-emerald-50';
  if (s === 'submitted' || s === 'partial' || s === 'under_review') return 'text-amber-600 bg-amber-50';
  if (s === 'queried' || s === 'rejected' || s === 'dismissed') return 'text-rose-600 bg-rose-50';
  return 'text-slate-500 bg-slate-50';
}

export default function HmoAdvancedDashboard() {
  const { claims, remittances, appeals, getHmoTotals, getAgingBuckets } = useHmoAdvancedStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const hmoTotals = getHmoTotals();
  const agingBuckets = getAgingBuckets();

  const totalReceivables = claims.reduce((s, c) => s + (c.status !== 'paid' && c.status !== 'rejected' ? c.total - (c.paidAmount || 0) : 0), 0);
  const pendingCount = claims.filter((c) => c.status === 'draft' || c.status === 'submitted').length;
  const queriedRejected = claims.filter((c) => c.status === 'queried' || c.status === 'rejected').length;
  const paidCount = claims.filter((c) => c.status === 'paid').length;
  const paidTotal = claims.reduce((s, c) => s + (c.paidAmount || 0), 0);
  const openAppeals = appeals.filter((a) => a.status !== 'approved' && a.status !== 'dismissed').length;

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <PageHeader
          title="Advanced HMO Claims"
          description="Revenue recovery engine — claim forms, bulk processing, remittance reconciliation, appeals, and aging reports."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-3" />
                <div className="h-8 w-28 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-slate-50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="h-5 w-36 bg-slate-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-48 bg-slate-50 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasData = claims.length > 0;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Advanced HMO Claims"
        description="Revenue recovery engine — claim forms, bulk processing, remittance reconciliation, appeals, and aging reports."
        actions={[
          { label: "New Claim", href: "/clinic/hmo-advanced/claims" },
          { label: "Export Data", onClick: () => exportClaimsCsv(claims) },
        ]}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Receivables</p>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><DollarSign size={18} className="text-amber-600" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatNGN(totalReceivables)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Unpaid across all HMOs</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Claims</p>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Clock size={18} className="text-amber-600" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Awaiting submission or approval</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queries / Rejected</p>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center"><AlertCircle size={18} className="text-rose-600" /></div>
            </div>
            <p className="text-2xl font-black text-rose-600">{queriedRejected}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Require appeal or action</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collected YTD</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-600" /></div>
            </div>
            <p className="text-2xl font-black text-emerald-600">{formatNGN(paidTotal)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{paidCount} claims paid</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        /* Empty State */
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">
              <Wallet size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Welcome to HMO Claims</h2>
            <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
              Track, submit, and reconcile HMO claims from one place. Create your first claim to get started with revenue recovery.
            </p>
            <div className="flex gap-3">
              <Link href="/clinic/hmo-advanced/claims">
                <Button variant="default" className="h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700">
                  <Plus size={16} /> Create Your First Claim
                </Button>
              </Link>
              <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 gap-2" onClick={() => exportClaimsCsv(claims)}>
                <Download size={16} /> Import Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Aging + HMO Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aging Buckets */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Aging Receivables</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Outstanding claims by age bucket</p>
                  </div>
                  <Activity size={20} className="text-slate-300" />
                </div>
                {agingBuckets.some((b) => b.count > 0) ? (
                  <div className="space-y-3">
                    {agingBuckets.map((bucket, ci) => {
                      const max = Math.max(...agingBuckets.map((b) => b.total), 1);
                      const pct = (bucket.total / max) * 100;
                      const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500'];
                      return (
                        <div key={bucket.label}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-700">{bucket.label}</span>
                            <span className="text-slate-400 font-medium">{bucket.range}</span>
                            <span className="font-black text-slate-900">{formatNGN(bucket.total)} <span className="text-slate-400 font-medium normal-case">({bucket.count})</span></span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", colors[ci])} style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No outstanding receivables</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* HMO Totals */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">HMO Revenue Summary</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Outstanding vs collected per HMO</p>
                  </div>
                  <TrendingUp size={20} className="text-slate-300" />
                </div>
                <div className="space-y-4">
                  {hmoTotals.map((h) => {
                    const pct = h.total > 0 ? Math.round((h.paid / h.total) * 100) : 0;
                    return (
                      <div key={h.hmoName}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{h.hmoName}</span>
                          <span className="text-xs text-slate-400">{h.count} claims</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-emerald-600 font-bold">Paid: {formatNGN(h.paid)}</span>
                          <span className="text-rose-600 font-bold">Outstanding: {formatNGN(h.outstanding)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/clinic/hmo-advanced/claims" className="block">
              <Card className="border-none shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                    <FileText size={22} className="text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">Claims Management</p>
                    <p className="text-[10px] text-slate-400 font-bold">Bulk processing, forms, status tracking</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/clinic/hmo-advanced/reconciliation" className="block">
              <Card className="border-none shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Search size={22} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">Reconciliation</p>
                    <p className="text-[10px] text-slate-400 font-bold">Match remittances to claims</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/clinic/hmo-advanced/appeals" className="block">
              <Card className="border-none shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <ShieldAlert size={22} className="text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">Appeals</p>
                    <p className="text-[10px] text-slate-400 font-bold">{openAppeals} open — challenge rejected claims</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Claims */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Recent Claims</h3>
                <p className="text-[10px] text-slate-400 font-bold">Latest 5 submissions</p>
              </div>
              <Link href="/clinic/hmo-advanced/claims">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-sky-600 gap-1">
                  View All <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {claims.slice(0, 5).map((c) => {
                    const days = c.submittedDate ? getDaysSince(c.submittedDate) : 0;
                    return (
                      <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{c.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.hmoName}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.patientName}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">{formatNGN(c.total)}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", statusColor(c.status))}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {c.submittedDate ? `${days}d` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
