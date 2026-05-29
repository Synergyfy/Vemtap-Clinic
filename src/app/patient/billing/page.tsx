"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ShieldCheck, FileText, ArrowUpRight, X, Loader2, CheckCircle2, Download } from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import jsPDF from "jspdf";

export default function BillingPage() {
  const { invoices, outstandingBalance, payInvoice } = usePatientStore();
  
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  // We find the first unpaid invoice to pay. In a real app we might allow selecting which one to pay.
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid');
  const invoiceToPay = unpaidInvoices.length > 0 ? unpaidInvoices[0] : null;

  const handlePayment = () => {
    if (!invoiceToPay) return;
    setIsProcessing(true);
    setTimeout(() => {
      payInvoice(invoiceToPay.id);
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentOpen(false);
        setPaymentSuccess(false);
      }, 2000);
    }, 2000);
  };

  const handleDownloadInvoice = (inv: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136);
    doc.text("Vemtap Clinic - Invoice", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #${inv.id}`, 20, 30);
    doc.text(`Date: ${inv.date}`, 20, 40);
    doc.text(`Billed To: Alex Carter`, 20, 60);
    doc.text(`Description: ${inv.desc}`, 20, 80);
    doc.text(`Amount Due: $${inv.amount.toFixed(2)}`, 20, 90);
    if (inv.hmoCovered > 0) {
      doc.text(`HMO Covered: $${inv.hmoCovered.toFixed(2)}`, 20, 100);
    }
    doc.line(20, 110, 190, 110);
    doc.setFontSize(16);
    doc.text(`Status: ${inv.status}`, 20, 130);
    doc.save(`${inv.id}.pdf`);
  };

  return (
    <div className="space-y-6 relative">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Billing & HMO
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Manage your payments, invoices, and insurance coverage.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Payment & HMO Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${outstandingBalance > 0 ? 'bg-red-500' : 'bg-teal-600'} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-white/90 font-medium mb-1">Outstanding Balance</h2>
              <p className="text-3xl font-bold mb-6">${outstandingBalance.toFixed(2)}</p>
              
              {outstandingBalance > 0 ? (
                <>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-6">
                    <p className="text-sm mb-1">Invoice {invoiceToPay?.id}</p>
                    <p className="text-xs text-white/80">{invoiceToPay?.desc}</p>
                  </div>

                  <button 
                    onClick={() => setPaymentOpen(true)}
                    className={`w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors shadow-sm`}
                  >
                    Pay Now
                  </button>
                </>
              ) : (
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm">You are all caught up!</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-teal-50 p-2 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900">HMO Coverage</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Provider</p>
                <p className="font-bold text-gray-900">Reliance HMO</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Plan</p>
                <p className="font-bold text-gray-900">Premium Care</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Enrollee ID</p>
                <p className="font-bold text-gray-900 tracking-wide">RL-8942-X</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-500">Optical Limit</span>
                <span className="font-semibold text-teal-600">$150 / $300</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment History
            </h2>
            
            <div className="space-y-4">
              {invoices.map((inv, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:border-teal-100 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-teal-50 transition-colors mt-1">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{inv.desc}</p>
                      <p className="text-sm text-gray-500">{inv.date} • {inv.id}</p>
                      {inv.hmoCovered > 0 && (
                        <p className="text-xs text-teal-600 font-medium mt-1">HMO Covered: ${inv.hmoCovered.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                    <span className="font-bold text-lg text-gray-900">${inv.amount.toFixed(2)}</span>
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => handleDownloadInvoice(inv)}
                        className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        inv.status === "Paid" ? "bg-green-50 text-green-700" : 
                        inv.status === "Covered" ? "bg-teal-50 text-teal-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentOpen && invoiceToPay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => !isProcessing && setPaymentOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
              {!paymentSuccess ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Secure Payment</h2>
                    {!isProcessing && (
                      <button onClick={() => setPaymentOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                    )}
                  </div>
                  
                  <div className="mb-6 bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Amount Due</p>
                      <p className="text-2xl font-bold text-gray-900">${invoiceToPay.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{invoiceToPay.id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <input type="text" placeholder="123" className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-6 flex justify-center items-center gap-2"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                      ) : (
                        `Pay $${invoiceToPay.amount.toFixed(2)}`
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 flex justify-center items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Securely processed via Stripe
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-500">Thank you for your payment. Your receipt has been sent to your email.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
