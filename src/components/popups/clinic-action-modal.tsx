"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Trash2, ShieldAlert, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClinicActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  clinicName: string;
}

export function ClinicActionModal({ isOpen, onClose, clinicId, clinicName }: ClinicActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-soft-blue flex items-center justify-center text-brand-blue">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-black text-brand-navy">{clinicName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{clinicId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-slate-50">
              <ExternalLink size={16} /> View Details
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-slate-50">
              <Settings size={16} /> Edit Settings
            </Button>
            <div className="my-2 border-t border-slate-100"></div>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              <ShieldAlert size={16} /> Suspend Clinic
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 size={16} /> Delete Clinic
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
