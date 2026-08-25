"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";
import Link from "next/link";

export const RequestDemoPopup = () => {
  const { activeModal, closeModal } = useModals();

  return (
    <Modal
      isOpen={activeModal === "demo"}
      onClose={closeModal}
      title="Request a Personalized Demo"
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">First Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Last Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              placeholder="Doe"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Clinic Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="Vision Eye Clinic"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Work Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="john@clinic.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Phone Number</label>
          <input
            type="tel"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="+234 800 000 0000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Clinic Type</label>
          <select className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white">
            <option>Single Branch Clinic</option>
            <option>Multi-branch Eye Hospital</option>
            <option>Optical Center</option>
            <option>Specialist Ophthalmology Clinic</option>
          </select>
        </div>
        <Button className="w-full mt-4" variant="primary">
          Send Request
        </Button>
        <div className="mt-4 text-center">
          <span className="text-xs text-slate-500">Or skip the wait and </span>
          <Link 
            href="/book-demo" 
            onClick={closeModal}
            className="text-xs font-bold text-brand-blue hover:underline"
          >
            Pick a specific date & time
          </Link>
        </div>
        <p className="text-[10px] text-center text-slate-400 px-4 mt-4">
          By clicking schedule, you agree to our terms of service and privacy policy. We'll contact you within 24 hours.
        </p>
      </form>
    </Modal>
  );
};
