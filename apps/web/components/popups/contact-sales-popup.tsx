"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";
import { MessageSquare, Phone, Mail } from "lucide-react";

export const ContactSalesPopup = () => {
  const { activeModal, closeModal } = useModals();

  return (
    <Modal
      isOpen={activeModal === "sales"}
      onClose={closeModal}
      title="Contact Our Sales Team"
    >
      <div className="space-y-6">
        <p className="text-slate-600 text-sm">
          Have questions about our enterprise plans or custom deployments? Our team is here to help you scale.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Phone size={20} className="text-brand-blue" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Us</div>
              <div className="text-sm font-bold text-brand-navy">+234 (0) 800 VEMTAP</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Mail size={20} className="text-brand-blue" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</div>
              <div className="text-sm font-bold text-brand-navy">sales@vemtap.com</div>
            </div>
          </div>
        </div>

        <form className="space-y-4 pt-4 border-t border-slate-100" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">How can we help?</label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 min-h-[100px]"
              placeholder="Tell us about your clinic's needs..."
            />
          </div>
          <Button className="w-full" variant="primary">
            Send Message
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-brand-blue font-bold text-sm cursor-pointer hover:underline">
          <MessageSquare size={18} />
          <span>Chat with us on WhatsApp</span>
        </div>
      </div>
    </Modal>
  );
};
