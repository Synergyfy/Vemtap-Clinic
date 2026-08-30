"use client";

import React from "react";
import { useCashierTransactions, useDeleteProduct, useCashierProducts } from "@/hooks/useCashier";
import {
  Settings2, Printer, Bell, DollarSign, Trash2, AlertTriangle
} from "lucide-react";

export default function CashierSettingsPage() {
  const { data: transactions = [] } = useCashierTransactions();
  const { data: products = [] } = useCashierProducts();
  const deleteProduct = useDeleteProduct();
  const [showReset, setShowReset] = React.useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">POS Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Configure your point of sale terminal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-3">
            <Printer size={20} className="text-sky-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Receipt Printing</h3>
          <p className="text-xs text-slate-500 mb-3">Auto-print receipt after each sale.</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-6 rounded-full bg-emerald-600 relative transition-colors">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow" />
            </div>
            <span className="text-xs font-bold text-slate-700">Enabled</span>
          </label>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Bell size={20} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Notifications</h3>
          <p className="text-xs text-slate-500 mb-3">Sound alerts for completed sales.</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-6 rounded-full bg-emerald-600 relative transition-colors">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow" />
            </div>
            <span className="text-xs font-bold text-slate-700">Enabled</span>
          </label>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-violet-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Default Currency</h3>
          <p className="text-xs text-slate-500 mb-3">Set your local currency.</p>
          <select className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none">
            <option value="NGN">NGN \u2014 Nigerian Naira</option>
            <option value="USD">USD \u2014 US Dollar</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-1">POS Data</h3>
              <p className="text-xs text-slate-500">{transactions.length} transactions, {products.length} products in system. Data is managed via the backend API.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
