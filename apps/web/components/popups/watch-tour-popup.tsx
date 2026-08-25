"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { useModals } from "@/lib/modal-context";
import { Play } from "lucide-react";

export const WatchTourPopup = () => {
  const { activeModal, closeModal } = useModals();

  return (
    <Modal
      isOpen={activeModal === "tour"}
      onClose={closeModal}
      title="Vemtap Health Product Tour"
      className="max-w-4xl"
    >
      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
        <div className="relative z-10 w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
          <Play size={32} className="text-white ml-1" fill="currentColor" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white z-10">
          <div className="text-sm font-medium opacity-80 mb-1">Coming Soon</div>
          <div className="text-xl font-bold">Experience the future of eye clinic management</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { title: "Patient Flow", duration: "2:15" },
          { title: "HMO Automation", duration: "1:45" },
          { title: "Optical Workflow", duration: "2:30" },
        ].map((chapter, i) => (
          <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors cursor-pointer">
            <div className="text-xs font-bold text-brand-navy mb-1">{chapter.title}</div>
            <div className="text-[10px] text-slate-400">{chapter.duration}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
