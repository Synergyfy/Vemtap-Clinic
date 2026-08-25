"use client";

import React from "react";
import { RequestDemoPopup } from "./request-demo-popup";
import { WatchTourPopup } from "./watch-tour-popup";
import { ContactSalesPopup } from "./contact-sales-popup";
import { OnboardingModal } from "./onboarding-modal";
import { useModals } from "@/lib/modal-context";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Headphones, ChevronRight, Zap, Send, ShieldAlert, MessageCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
                  <Tooltip content="Unique reference for this invoice">
                    <input type="text" defaultValue="INV-2024-001" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none" />
                  </Tooltip>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                  <Tooltip content="Current payment status">
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Overdue</option>
                    </select>
                  </Tooltip>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Amount Due</label>
                <Tooltip content="Total amount to be paid by the patient or HMO">
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 font-bold">$</span>
                    <input type="number" defaultValue="1240.00" className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 outline-none" />
                  </div>
                </Tooltip>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Notes</label>
                <Tooltip content="Additional information for internal or patient use">
                  <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none min-h-[100px]" placeholder="Add invoice notes..."></textarea>
                </Tooltip>
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
                <Tooltip content="Enter the staff member's legal name">
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none" />
                </Tooltip>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                <Tooltip content="Professional email for dashboard access">
                  <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none" />
                </Tooltip>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Role</label>
                <Tooltip content="Assign system permissions based on role">
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none">
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Receptionist</option>
                    <option>Pharmacist</option>
                  </select>
                </Tooltip>
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
                <Tooltip content="The identifying name for this location">
                  <input type="text" placeholder="e.g. Vemtap Victoria Island" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
                </Tooltip>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location / Address</label>
                <Tooltip content="Physical address of the clinic branch">
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
                </Tooltip>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Branch Manager</label>
                <Tooltip content="Administrator responsible for this branch">
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                    <option>Select Manager</option>
                    <option>Dr. A. Bello</option>
                    <option>Dr. E. Nwachukwu</option>
                  </select>
                </Tooltip>
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
                  <Tooltip content="Choose the category of data for the report">
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                        <option>Revenue Analysis</option>
                        <option>Patient Growth</option>
                        <option>HMO Performance</option>
                        <option>Resource Utilization</option>
                    </select>
                  </Tooltip>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Timeframe</label>
                  <Tooltip content="Select the date range for data aggregation">
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                        <option>Last 30 Days</option>
                        <option>Quarter to Date</option>
                        <option>Year to Date</option>
                        <option>Custom Range</option>
                    </select>
                  </Tooltip>
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
      {activeModal === "expense" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Record Expense</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                  <option>Utilities</option>
                  <option>Salary</option>
                  <option>Supplies</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (NGN)</label>
                <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-600 min-h-[80px]" placeholder="What was this for?"></textarea>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold" onClick={closeModal}>Save Expense</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "claim" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-brand-navy mb-2">HMO Claim Details</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Review and update insurance claim status</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Patient</label>
                  <p className="text-sm font-bold text-slate-900">Patient Name</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount</label>
                  <p className="text-sm font-bold text-slate-900">₦0.00</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Claim Status</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                    <option>Submitted</option>
                    <option>Approved</option>
                    <option>Queried</option>
                    <option>Rejected</option>
                    <option>Paid</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Internal Notes</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none min-h-[100px]" placeholder="Add notes for the finance team..."></textarea>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Close</Button>
                <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold" onClick={closeModal}>Update Claim</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "transaction" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Receive Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                  <option>POS</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount to Collect</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₦</span>
                  <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-4 py-2.5 outline-none font-bold text-slate-900" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold" onClick={closeModal}>Confirm Payment</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "hmo-verify" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-2">HMO Verification</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Real-time coverage & eligibility check</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Search</label>
                <input type="text" placeholder="Name or Hospital ID..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select HMO</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                  <option>AXA Mansard</option>
                  <option>Hygeia HMO</option>
                  <option>NHIA</option>
                  <option>Reliance HMO</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Policy / Enrollee Number</label>
                <input type="text" placeholder="e.g. AXA/12345/B" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold" onClick={() => {
                  console.log("Verifying HMO...");
                  closeModal();
                }}>Verify Coverage</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "hmo-claim" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-brand-navy mb-2">Create Manual Claim</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Generate a new insurance claim submission</p>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">HMO Provider</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                      <option>Hygeia HMO</option>
                      <option>AXA Mansard</option>
                      <option>NHIA</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Service Date</label>
                  <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Clinical Service</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none">
                    <option>Standard Consultation</option>
                    <option>Refraction & Eye Test</option>
                    <option>Cataract Surgery</option>
                    <option>Glaucoma Screening</option>
                    <option>OCT Diagnostic Scan</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Claim Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₦</span>
                  <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-4 py-2.5 outline-none font-bold text-slate-900" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Authorization Code (if any)</label>
                <input type="text" placeholder="AUTH-XXXXX" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none uppercase" />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold" onClick={closeModal}>Submit Claim</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "report-schedule" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-navy mb-2">Automated Reporting</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Configure recurring business intelligence delivery</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Delivery Frequency</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900">
                  <option>Daily Executive Summary</option>
                  <option>Weekly Operational Audit</option>
                  <option>Monthly Revenue Review</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Preferred Channel</label>
                <div className="grid grid-cols-2 gap-3">
                   <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs">WhatsApp</button>
                   <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 font-bold text-xs underline decoration-2">Email PDF</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Recipients (Comma separated)</label>
                <input type="text" placeholder="admin@vemtap.com, ceo@vemtap.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900" />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-4">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold" onClick={closeModal}>Save Schedule</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "staff-profile" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xl">DR</div>
               <div>
                  <h2 className="text-xl font-bold text-brand-navy">Practitioner Intelligence</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Quarterly Performance Profile</p>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                 {[
                   { label: "Volume", val: "145", sub: "Consultations" },
                   { label: "Rating", val: "4.9/5", sub: "Patient Sat." },
                   { label: "Speed", val: "22m", sub: "Avg. Session" },
                 ].map(stat => (
                   <div key={stat.label} className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{stat.val}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">{stat.sub}</p>
                   </div>
                 ))}
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality of Care Metrics</p>
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-xs mb-1 font-bold">
                          <span>Diagnosis Accuracy</span>
                          <span className="text-emerald-600">98%</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "98%" }} />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs mb-1 font-bold">
                          <span>Patient Retention</span>
                          <span className="text-sky-600">82%</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500" style={{ width: "82%" }} />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="flex-1 font-bold" onClick={closeModal}>Close</Button>
                <Button className="flex-1 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold" onClick={() => alert("Downloading detailed performance report...")}>Download Dossier</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "kb-article" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
               <Badge className="bg-sky-50 text-sky-700 border-none font-black text-[10px] tracking-widest uppercase">Support Intelligence</Badge>
               <span className="text-slate-300 text-xs">•</span>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Article #KB-4401</span>
            </div>
            
            <h2 className="text-3xl font-black text-brand-navy mb-4 leading-tight">Optimizing Clinic Workflows & Multi-Branch Coordination</h2>
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-50">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">Updated 2 days ago</span>
               </div>
               <span className="text-slate-200">|</span>
               <span className="text-xs font-bold text-slate-500">8 min read</span>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed">
               <p className="font-medium">
                  Efficient clinic operations require seamless transitions between front-desk registration, clinical vitals, and practitioner consultations. This guide covers the essential protocols for maintaining high throughput during peak hours.
               </p>

               <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">1. Pre-Consultation Efficiency</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
                     <li>Ensure all HMO patients have completed digital pre-verification before queue assignment.</li>
                     <li>Vitals (BP, VA, Intraocular Pressure) should be recorded directly into the patient timeline to eliminate paper lag.</li>
                     <li>Use the "Emergency Override" feature only for critical trauma or acute sight-threatening conditions.</li>
                  </ul>
               </div>

               <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">2. Optical Sales Integration</h3>
                  <p className="text-sm font-medium">
                     Practitioners should tag specific lens recommendations during the consultation. This automatically populates the Optical Order queue, allowing opticians to prepare frames for the patient before they even leave the exam room.
                  </p>
               </div>

               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Was this article helpful?</p>
                  <div className="flex items-center gap-3">
                     <Button size="sm" variant="outline" className="rounded-xl font-bold bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={closeModal}>Yes, thanks!</Button>
                     <Button size="sm" variant="outline" className="rounded-xl font-bold bg-white text-rose-600 border-rose-100 hover:bg-rose-50" onClick={closeModal}>Not really</Button>
                     <div className="flex-1" />
                     <Button variant="ghost" className="text-sky-600 font-bold" onClick={closeModal}>Close Article</Button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "support-ticket" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-6">
               <Headphones size={28} />
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2">Create Support Ticket</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Report an operational or technical issue</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Issue Category</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-sky-100 transition-all">
                  <option>Technical (System/UI)</option>
                  <option>Billing & Finance</option>
                  <option>HMO Sync/Verification</option>
                  <option>Optical Inventory/Sales</option>
                  <option>Hardware/Device Integration</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                   {['Low', 'Medium', 'High'].map(p => (
                     <button key={p} className={cn(
                       "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                       p === 'Medium' ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-100 text-slate-400"
                     )}>{p}</button>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Problem Description</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-medium text-slate-600 focus:ring-2 focus:ring-sky-100 transition-all min-h-[120px]" placeholder="Explain what happened..."></textarea>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-4">
                <Button variant="ghost" className="flex-1 font-bold rounded-2xl" onClick={closeModal}>Discard</Button>
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold h-12 shadow-lg shadow-sky-600/20" onClick={() => {
                  alert("Ticket submitted successfully! ID: INC-" + Math.floor(Math.random() * 9000 + 1000));
                  closeModal();
                }}>Submit Ticket</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUPPORT MODALS */}
      {activeModal === "incident-log" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-brand-navy">Incident Logs</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Platform Monitoring</p>
              </div>
              <Button variant="ghost" onClick={closeModal}>Close</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {[
                { id: "INC-901", title: "Paystack Gateway Timeout", severity: "High", time: "10m ago", status: "Investigating", desc: "Intermittent failures reported during checkout for Nigerian Naira transactions." },
                { id: "INC-900", title: "HMO API Latency", severity: "Medium", time: "2h ago", status: "Resolved", desc: "External provider API experienced slowdown. Failover to secondary node completed." },
                { id: "INC-899", title: "Auth Service Cold Start", severity: "Low", time: "5h ago", status: "Resolved", desc: "Minor delay in login processing during low traffic period." },
              ].map((inc) => (
                <div key={inc.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-brand-navy text-white px-2 py-0.5 rounded uppercase">{inc.id}</span>
                      <h4 className="text-sm font-black text-brand-navy">{inc.title}</h4>
                    </div>
                    <Badge className={cn(
                      "font-black text-[8px] uppercase tracking-widest",
                      inc.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>{inc.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{inc.desc}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Severity: <span className={inc.severity === "High" ? "text-rose-500" : "text-amber-500"}>{inc.severity}</span></span>
                    <span>•</span>
                    <span>Started: {inc.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === "broadcast" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
               <Zap size={28} />
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2">Platform Broadcast</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Send a global memo to all clinic dashboards</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Broadcast Title</label>
                <input type="text" placeholder="e.g. Scheduled Maintenance" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Target Audience</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-amber-100 transition-all">
                  <option>All Clinics & Staff</option>
                  <option>Clinic Administrators Only</option>
                  <option>HMO Compliance Officers</option>
                  <option>Optical Technicians</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Message Content</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-medium text-slate-600 focus:ring-2 focus:ring-amber-100 transition-all min-h-[120px]" placeholder="Write your announcement..."></textarea>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-4">
                <Button variant="ghost" className="flex-1 font-bold rounded-2xl" onClick={closeModal}>Cancel</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold h-12" onClick={() => {
                  alert("Broadcast sent successfully!");
                  closeModal();
                }}>Send Broadcast</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "ticket" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white p-0 rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Left: Ticket Detail */}
            <div className="flex-1 p-10 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-brand-soft-blue text-brand-blue border-none font-black text-[8px] tracking-widest uppercase">Support Ticket</Badge>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-[10px] font-black uppercase">TKT-1042</span>
              </div>
              <h2 className="text-2xl font-black text-brand-navy mb-4">Unable to verify HMO card for patient AXA/4491</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic</p>
                  <p className="text-sm font-bold text-slate-700">ClearVision VI</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User</p>
                  <p className="text-sm font-bold text-slate-700">Receptionist Mary</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Message</p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                  "Every time I try to verify the card for this specific patient, the system throws a 502 error. Other AXA patients are working fine. Please assist."
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Thread</p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="p-4 bg-slate-100 rounded-2xl text-xs font-medium text-slate-600">
                    Checking the logs now. Looks like a malformed request on the HMO end.
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Actions */}
            <div className="w-full md:w-64 bg-slate-50 border-l border-slate-100 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest">Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full bg-brand-navy text-white text-xs font-bold rounded-xl py-6">Assign to Me</Button>
                  <Button variant="outline" className="w-full bg-white text-slate-700 text-xs font-bold rounded-xl py-6">Escalate to Dev</Button>
                  <Button variant="outline" className="w-full bg-white text-emerald-600 border-emerald-100 text-xs font-bold rounded-xl py-6">Resolve Ticket</Button>
                </div>
              </div>
              <Button variant="ghost" className="text-slate-400 font-bold" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "chat-console" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex h-[600px] border border-slate-100">
            {/* Conversations Sidebar */}
            <div className="w-72 border-r border-slate-100 bg-slate-50/50 flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest">Active Chats</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { name: "Dr. Sarah", status: "online", msg: "Hey, we're having trouble..." },
                  { name: "Mary (ClearVision)", status: "busy", msg: "Verification failed again." },
                  { name: "Admin Tunde", status: "online", msg: "Payout query resolved." },
                ].map((c) => (
                  <div key={c.name} className="p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-brand-blue/30 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-2 h-2 rounded-full", c.status === "online" ? "bg-emerald-500" : "bg-amber-500")} />
                      <span className="text-xs font-bold text-brand-navy">{c.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{c.msg}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-soft-blue flex items-center justify-center text-brand-blue font-black">DS</div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">Dr. Sarah</h4>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">Practitioner • Lagos West</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-slate-400" onClick={closeModal}>Close Console</Button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-[1.5rem] rounded-tl-none bg-slate-100 text-sm font-medium text-slate-600">
                    Hey support team, the HMO verification for AXA is timing out for the third time this morning.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-4 rounded-[1.5rem] rounded-tr-none bg-brand-blue text-white text-sm font-bold">
                    We're looking into it, Sarah. Seems to be a global issue with their gateway.
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex items-center gap-4">
                <input type="text" placeholder="Type your response..." className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 outline-none font-medium text-sm focus:ring-2 focus:ring-brand-blue/20" />
                <Button className="bg-brand-blue text-white p-3 rounded-2xl h-12 w-12 flex items-center justify-center shadow-lg shadow-brand-blue/20">
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
