"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useHmoClaims, useHmoTotals, useAgingReport } from "@/hooks/useHmo";
import {
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  FileText, ArrowRight, DollarSign, Activity,
  ShieldAlert, Search, Download,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatNGN(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`;
}

function getDaysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "settled" || s === "approved" || s === "reconciled") return "text-emerald-600 bg-emerald-50";
  if (s === "submitted" || s === "partially_approved" || s === "under_review") return "text-amber-600 bg-amber-50";
  if (s === "denied" || s === "appealed" || s === "disputed") return "text-rose-600 bg-rose-50";
  return "text-slate-500 bg-slate-50";
}

export default function HmoAdvancedDashboard() {
  const { data: claims = [], isLoading: claimsLoading } = useHmoClaims();
  const { data: hmoTotals = [], isLoading: totalsLoading } = useHmoTotals();
  const { data: agingData, isLoading: agingLoading } = useAgingReport();

  const loading = claimsLoading || totalsLoading || agingLoading;

  // Compute dashboard KPIs from claims
  const totalReceivables = claims.reduce(
    (s, c) => s + (c.status !== "settled" && c.status !== "denied" ? c.amountClaimed - c.amountApproved : 0),
    0
  );
  const pendingCount = claims.filter((c) => c.status === "submitted").length;
  const queriedRejected = claims.filter((c) => c.status === "denied" || c.status === "appealed").length;
  const paidCount = claims.filter((c) => c.status === "settled").length;
  const paidTotal = claims.reduce((s, c) => s + c.amountApproved, 0);

  // Build aging buckets from claims
  const agingBuckets = React.useMemo(() => {
    const now = new Date();
    const buckets = [
      { label: "Current", range: "0\u201330 days", min: 0, max: 30 },
      { label: "31\u201360 days", range: "31\u201360 days", min: 31, max: 60 },
      { label: "61\u201390 days", range: "61\u201390 days", min: 61, max: 90 },
      { label: "Over 90 days", range: "90+ days", min: 91, max: Infinity },
    ];
    return buckets.map((b) => {
      const bucketClaims = claims.filter((c) => {
        if (c.status === "settled" || c.status === "denied") return false;
        const subDate = c.submittedDate || "";
        const days = subDate ? Math.floor((now.getTime() - new Date(subDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return days >= b.min && days <= b.max;
      });
      return {
        label: b.label,
        range: b.range,
        total: bucketClaims.reduce((s, c) => s + c.amountClaimed - c.amountApproved, 0),
        count: bucketClaims.length,
      };
    });
  }, [claims]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <PageHeader
          title="Advanced HMO Claims"
          description="Revenue recovery engine \u2014 claim forms, bulk processing, remittance reconciliation, appeals, and aging reports."
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
      </div>
    );
  }

  const hasData = claims.length > 0;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Advanced HMO Claims"
        description="Revenue recovery engine \u2014 claim forms, bulk processing, remittance reconciliation, appeals, and aging reports."
        actions={[
          { label: "New Claim", href: "/clinic/hmo-advanced/claims" },
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Denied / Appealed</p>
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
            <p className="text-[10px] text-slate-400 font-bold mt-1">{paidCount} claims settled</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
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
                  Create Your First Claim
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Aging + HMO Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      const colors = ["bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-rose-500"];
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
                  {hmoTotals.length > 0 ? hmoTotals.map((h: any) => {
                    const total = Number(h.totalClaimed || h.total || 0);
                    const paid = Number(h.totalApproved || h.paid || 0);
                    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                    return (
                      <div key={h.hmoId || h.hmoName}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{h.hmoName || h.name}</span>
                          <span className="text-xs text-slate-400">{h.claimCount || h.count || 0} claims</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-emerald-600 font-bold">Paid: {formatNGN(paid)}</span>
                          <span className="text-rose-600 font-bold">Outstanding: {formatNGN(total - paid)}</span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400">No HMO data available</p>
                    </div>
                  )}
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
                    <p className="text-[10px] text-slate-400 font-bold">Challenge denied or appealed claims</p>
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
                    const days = c.submittedDate ? getDaysSince(String(c.submittedDate)) : 0;
                    return (
                      <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{c.claimNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.hmo?.name || c.hmoId}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">{formatNGN(c.amountClaimed)}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-0", statusColor(c.status))}>
                            {c.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {c.submittedDate ? `${days}d` : "-"}
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
