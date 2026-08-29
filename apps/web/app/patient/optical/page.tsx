"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Glasses, MapPin, Search, ArrowUpRight, CheckCircle2, X, FileText, Download, Loader2, FileCheck2 } from "lucide-react";
import { usePatientLensOrders, usePatientOpticalItems, LensOrder, OpticalItem } from "@/hooks/usePatientPortal";
import { useFormatCurrency } from "@/lib/currency";
import { usePatientProfile } from "@/hooks/usePatientPortal";
import jsPDF from "jspdf";

const steps = [
  { name: "Received", idx: 0 },
  { name: "Production", idx: 1 },
  { name: "Ready", idx: 2 },
  { name: "Delivered", idx: 3 },
];

function getStepIndex(status: string): number {
  const s = status?.toLowerCase();
  if (s === "delivered") return 3;
  if (s === "ready" || s === "ready_for_pickup") return 2;
  if (s === "processing" || s === "in_production") return 1;
  return 0;
}

function getStatusLabel(status: string): string {
  const s = status?.toLowerCase();
  if (s === "delivered") return "Delivered";
  if (s === "ready" || s === "ready_for_pickup") return "Ready for Pickup";
  if (s === "processing" || s === "in_production") return "In Production";
  return "Received";
}

export default function OpticalOrdersPage() {
  const { data: orders = [], isLoading: ordersLoading } = usePatientLensOrders();
  const { data: catalogItems = [] } = usePatientOpticalItems();
  const { data: profile } = usePatientProfile();
  const formatCurrency = useFormatCurrency();

  const [isInvoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LensOrder | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeOrders = orders.filter((o) => getStepIndex(o.status) < 3);
  const pastOrders = orders.filter((o) => getStepIndex(o.status) >= 3);

  const handleDownload = () => {
    if (!selectedOrder) return;
    setIsDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136);
      doc.text("Vemtap Clinic - Invoice", 20, 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Order #${selectedOrder.id.slice(0, 8)}`, 20, 30);
      doc.text(`Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}`, 20, 40);
      doc.text(`Item: ${selectedOrder.lensType}`, 20, 50);
      doc.text(`Total: ${formatCurrency(selectedOrder.totalPrice, { decimals: true })}`, 20, 60);
      doc.line(20, 70, 190, 70);
      doc.text(`Status: ${getStatusLabel(selectedOrder.status)}`, 20, 90);
      doc.save(`Invoice_${selectedOrder.id.slice(0, 8)}.pdf`);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setInvoiceOpen(false);
      }, 2000);
    }, 1500);
  };

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : "Patient";

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Optical Orders</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Track your eyewear and contact lens orders.</p>
        </div>
        <Link href="/patient/optical/catalogue" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2">
          <Search className="w-4 h-4" /> Browse Catalog
        </Link>
      </header>

      {ordersLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Active Orders */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">Active Orders</h2>
          {activeOrders.length > 0 ? (
            <div className="space-y-6">
              {activeOrders.map((order) => {
                const currentStep = getStepIndex(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-gray-900">{order.lensType}</h3>
                          <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">Order #{order.id.slice(0, 8)} &bull; {formatCurrency(order.totalPrice, { decimals: true })}</p>
                        {order.frameDescription && (
                          <p className="text-gray-500 text-sm mt-1">{order.frameDescription}</p>
                        )}
                      </div>
                      <div className="flex flex-col md:items-end gap-1">
                        <p className="text-sm text-gray-500">Estimated Pickup</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "TBD"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="relative pt-8 pb-16 mx-6 sm:mx-10 mt-4 border-t border-transparent">
                      <div className="absolute top-10 left-0 w-full h-1 bg-gray-100 rounded-full -translate-y-1/2" />
                      <div
                        className="absolute top-10 left-0 h-1 bg-teal-500 rounded-full transition-all duration-500 -translate-y-1/2"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      />

                      {steps.map((step) => {
                        const isActive = currentStep >= step.idx;
                        const isCurrent = currentStep === step.idx;
                        const position = (step.idx / 3) * 100;
                        return (
                          <div
                            key={step.name}
                            className="absolute top-10 flex flex-col items-center"
                            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 -mt-3 border-4 border-white ${
                              isActive ? "bg-teal-500" : "bg-gray-200"
                            } ${isCurrent ? "ring-4 ring-teal-50" : ""}`}>
                              {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-xs mt-3 font-medium whitespace-nowrap ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                              {step.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Main Branch</span>
                      </div>
                      <button
                        onClick={() => { setSelectedOrder(order); setInvoiceOpen(true); }}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
                      >
                        View Invoice <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 bg-white p-6 rounded-3xl border border-gray-100">No active optical orders.</p>
          )}

          {/* Past Orders */}
          <h2 className="text-lg font-bold text-gray-900 mt-10 mb-4">Past Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <Glasses className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{order.lensType}</h3>
                    <p className="text-sm text-gray-500">
                      Delivered {order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedOrder(order); setInvoiceOpen(true); }}
                  className="text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors"
                >
                  View Invoice
                </button>
              </motion.div>
            ))}
          </div>
          {pastOrders.length === 0 && (
            <p className="text-gray-500 bg-white p-6 rounded-3xl border border-gray-100">No past orders yet.</p>
          )}
        </>
      )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {isInvoiceOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setInvoiceOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" /> Invoice #{selectedOrder.id.slice(0, 8)}
                </h2>
                <button onClick={() => setInvoiceOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Billed To</p>
                    <p>{displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Date</p>
                    <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Item</span>
                    <span className="font-medium text-gray-900">{selectedOrder.lensType}</span>
                  </div>
                  {selectedOrder.frameDescription && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Frame</span>
                      <span className="font-medium text-gray-900">{selectedOrder.frameDescription}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.totalPrice, { decimals: true })}</span>
                  </div>
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
