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
      {activeModal === "staff" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Add Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Role</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none">
                  <option>Doctor</option>
                  <option>Nurse</option>
                  <option>Receptionist</option>
                  <option>Pharmacist</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl" onClick={closeModal}>Add Member</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "branch" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Register New Branch</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Branch Name</label>
                <input type="text" placeholder="e.g. Vemtap Victoria Island" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location / Address</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Branch Manager</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                  <option>Select Manager</option>
                  <option>Dr. A. Bello</option>
                  <option>Dr. E. Nwachukwu</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-sky-600/20" onClick={closeModal}>Create Branch</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "report" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-brand-navy mb-2">Generate Global Report</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Select report parameters for the entire network</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Report Type</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                    <option>Revenue Analysis</option>
                    <option>Patient Growth</option>
                    <option>HMO Performance</option>
                    <option>Resource Utilization</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Timeframe</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                    <option>Last 30 Days</option>
                    <option>Quarter to Date</option>
                    <option>Year to Date</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Included Branches</label>
                <div className="flex flex-wrap gap-2">
                   {['Vemtap Main', 'Vemtap Ikeja', 'Vemtap Lekki'].map(b => (
                     <div key={b} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-3 h-3 bg-sky-500 rounded-sm" />
                        <span className="text-[10px] font-bold text-slate-700">{b}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={closeModal}>Close</Button>
                <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20" onClick={() => {
                  console.log("Generating report...");
                  closeModal();
                }}>Download PDF</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
