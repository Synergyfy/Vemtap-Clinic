"use client";

import React from "react";
import { RequestDemoPopup } from "./request-demo-popup";
import { WatchTourPopup } from "./watch-tour-popup";
import { ContactSalesPopup } from "./contact-sales-popup";
import { OnboardingModal } from "./onboarding-modal";
import { useModals } from "@/lib/modal-context";
import { Button } from "@/components/ui/button";

export const ModalManager = () => {
  const { activeModal, closeModal } = useModals();

  return (
    <>
      <RequestDemoPopup />
      <WatchTourPopup />
      <ContactSalesPopup />
      <OnboardingModal 
        isOpen={activeModal === "clinic"} 
        onClose={closeModal} 
      />
      {activeModal === "invoice" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Manage Invoice</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Invoice ID</label>
                  <input type="text" defaultValue="INV-2024-001" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Amount Due</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold">$</span>
                  <input type="number" defaultValue="1240.00" className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Notes</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none min-h-[100px]" placeholder="Add invoice notes..."></textarea>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="flex-1" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl" onClick={() => {
                  console.log("Saving invoice...");
                  closeModal();
                }}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "transaction" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-bold text-brand-navy mb-1">Transaction Details</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">TXN-8492 • ClearVision</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="font-bold text-slate-900">$1,240.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Method</span>
                <span className="font-bold text-slate-900">Paystack</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-bold text-slate-900">May 26, 2026</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={() => console.log("Viewing receipt...")}>
                View Receipt
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700" onClick={() => console.log("Initiating refund...")}>
                Refund Transaction
              </Button>
            </div>
            <Button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 rounded-xl" onClick={closeModal}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
};
