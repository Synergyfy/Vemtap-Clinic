"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Glasses, MapPin, Search, ArrowUpRight, CheckCircle2, X, FileText, Download, Loader2, FileCheck2 } from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import jsPDF from "jspdf";

export default function OpticalOrdersPage() {
  const { orders, addNotification } = usePatientStore();
  const [isInvoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const catalogItems = [
    { category: "Frames", items: [
      { name: "Aviator Classic", price: "₦45,000", material: "Titanium", color: "Gold / Black" },
      { name: "Wayfarer Pro", price: "₦38,000", material: "Acetate", color: "Tortoise Shell" },
      { name: "Round Minimal", price: "₦52,000", material: "Stainless Steel", color: "Silver / Gunmetal" },
    ]},
    { category: "Lenses", items: [
      { name: "Anti-Reflective Pro", price: "₦25,000", material: "CR-39", color: "Clear" },
      { name: "Blue Light Shield", price: "₦32,000", material: "Polycarbonate", color: "Slight Yellow Tint" },
      { name: "Transition XTRActive", price: "₦55,000", material: "Photochromic", color: "Clear to Dark" },
    ]},
  ];

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const pastOrders = orders.filter(o => o.status === 'Delivered');

  const steps = [
    { name: "Received", idx: 0 },
    { name: "Production", idx: 1 },
    { name: "Ready", idx: 2 },
    { name: "Delivered", idx: 3 },
  ];

  const getStepIndex = (status: string) => {
    return steps.find(s => s.name === status)?.idx || 0;
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      
      const doc = new jsPDF();
      const order = orders.find(o => o.id === selectedOrderId);
      
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text("Vemtap Clinic - Invoice", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice #${selectedOrderId}`, 20, 30);
      doc.text(`Date Issued: Mar 20, 2025`, 20, 40);
      
      doc.setFontSize(14);
      doc.text("Billed To:", 20, 60);
      doc.setFontSize(12);
      doc.text("Alex Carter", 20, 70);
      doc.text("Patient ID: VC-2024-91", 20, 80);
      
      doc.line(20, 90, 190, 90);
      
      doc.setFontSize(14);
      doc.text("Item Summary", 20, 100);
      doc.setFontSize(12);
      doc.text(`Item: ${order?.type || 'Optical Order'}`, 20, 110);
      doc.text("Frame Cost: $150.00", 20, 120);
      doc.text("Lens Cost (Anti-glare): $100.00", 20, 130);
      doc.setTextColor(13, 148, 136);
      doc.text("HMO Coverage (Reliance): -$150.00", 20, 140);
      
      doc.line(20, 150, 190, 150);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Total Paid: $100.00", 20, 170);
      
      doc.save(`Invoice_${selectedOrderId}.pdf`);

      setTimeout(() => {
        setDownloadSuccess(false);
        setInvoiceOpen(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Optical Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Track your eyewear and contact lens orders.
          </p>
        </div>
        <button onClick={() => setShowCatalog(true)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2">
          <Search className="w-4 h-4" /> Browse Catalog
        </button>
      </header>

      {/* Active Orders Tracker */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Active Orders</h2>
      {activeOrders.length > 0 ? (
        <div className="space-y-6">
          {activeOrders.map((order, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl text-gray-900">{order.type}</h3>
                    <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Order #{order.id} • Placed on {order.date}</p>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  <p className="text-sm text-gray-500">Estimated Pickup</p>
                  <p className="font-bold text-gray-900 text-lg">{order.estimatedPickup}</p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative pt-8 pb-16 mx-6 sm:mx-10 mt-4 border-t border-transparent">
                <div className="absolute top-10 left-0 w-full h-1 bg-gray-100 rounded-full -translate-y-1/2"></div>
                <div 
                  className="absolute top-10 left-0 h-1 bg-teal-500 rounded-full transition-all duration-500 -translate-y-1/2" 
                  style={{ width: `${(getStepIndex(order.status) / 3) * 100}%` }}
                ></div>
                
                {steps.map((step) => {
                  const isActive = getStepIndex(order.status) >= step.idx;
                  const isCurrent = getStepIndex(order.status) === step.idx;
                  const position = (step.idx / 3) * 100;
                  return (
                    <div 
                      key={step.name} 
                      className="absolute top-10 flex flex-col items-center"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 -mt-3 border-4 border-white ${
                        isActive ? 'bg-teal-500' : 'bg-gray-200'
                      } ${isCurrent ? 'ring-4 ring-teal-50' : ''}`}>
                        {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs mt-3 font-medium whitespace-nowrap ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Pickup: <strong>{order.location}</strong></span>
                </div>
                <button 
                  onClick={() => { setSelectedOrderId(order.id); setInvoiceOpen(true); }}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
                >
                  View Invoice <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 bg-white p-6 rounded-3xl border border-gray-100">No active optical orders.</p>
      )}

      {/* Past Orders */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-4">Past Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pastOrders.map((order, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <Glasses className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">Delivered on {order.estimatedPickup}</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedOrderId(order.id); setInvoiceOpen(true); }}
              className="text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors"
            >
              View Invoice
            </button>
          </motion.div>
        ))}
      </div>

      {/* Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowCatalog(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Product Catalog</h2>
                  <p className="text-sm text-gray-500">Browse available frames and lenses</p>
                </div>
                <button onClick={() => setShowCatalog(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-8">
                {catalogItems.map((section) => (
                  <div key={section.category}>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{section.category}</h3>
                    <div className="space-y-3">
                      {section.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.material} &bull; {item.color}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-sm font-black text-teal-700">{item.price}</span>
                            <button onClick={() => { showToast(`${item.name} added to enquiry`); addNotification({ title: "Catalogue Enquiry", message: `You expressed interest in ${item.name} (${item.price}). A representative will follow up.`, time: "Just now", type: "general" }); }}
                              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors">Enquire</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCatalog(false)}
                className="w-full mt-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {isInvoiceOpen && selectedOrderId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setInvoiceOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" /> Invoice #{selectedOrderId}
                  </h2>
                </div>
                <button onClick={() => setInvoiceOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Billed To</p>
                    <p>Alex Carter</p>
                    <p>Patient ID: VC-2024-91</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Date Issued</p>
                    <p>Mar 20, 2025</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Item</span>
                    <span className="font-medium text-gray-900 text-right w-1/2">
                      {orders.find(o => o.id === selectedOrderId)?.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frame Cost</span>
                    <span className="font-medium text-gray-900">$150.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lens Cost (Anti-glare)</span>
                    <span className="font-medium text-gray-900">$100.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-teal-600 font-medium pt-3 border-t border-gray-100">
                    <span>HMO Coverage (Reliance)</span>
                    <span>-$150.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-bold text-2xl text-gray-900">$100.00</span>
                </div>
                
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:bg-teal-400"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Preparing PDF...</>
                  ) : downloadSuccess ? (
                    <><FileCheck2 className="w-5 h-5" /> Download Complete!</>
                  ) : (
                    <><Download className="w-5 h-5" /> Download PDF</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
