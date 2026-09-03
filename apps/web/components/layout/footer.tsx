"use client";

import React from "react";
import Link from "next/link";
import { Globe, MessageSquare, Share2, ExternalLink, Mail, Phone, MapPin } from "lucide-react";
import { useModals } from "@/lib/modal-context";

export const Footer = () => {
  const { openModal } = useModals();

  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold text-brand-navy">
                Vemtap<span className="text-brand-blue">Health</span>
              </span>
            </Link>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              The modern healthcare workflow automation platform designed specifically for eye clinics, optical centers, and vision care providers.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageSquare, Share2, ExternalLink].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-brand-navy mb-6">Product</h4>
            <ul className="space-y-4">
              {["Features", "Industries", "HMO Management", "Optical Workflow", "Queue Automation", "Pricing", "API"].map((item) => (
                <li key={item}>
                  {item === "Features" || item === "Industries" || item === "Pricing" ? (
                    <Link href={
                      item === "Features" ? "/features" : 
                      item === "Industries" ? "/industries" : "/pricing"
                    } className="text-sm text-slate-500 hover:text-brand-blue transition-colors">
                      {item}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => openModal("tour")}
                      className="text-sm text-slate-500 hover:text-brand-blue transition-colors cursor-pointer text-left w-full"
                    >
                      {item}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-navy mb-6">Resources</h4>
            <ul className="space-y-4">
              {["Documentation", "Help Center", "Blog", "Case Studies", "Status", "FAQ", "Contact"].map((item) => (
                <li key={item}>
                  {item === "Blog" || item === "FAQ" || item === "Contact" ? (
                    <Link href={
                      item === "Blog" ? "/blog" : 
                      item === "FAQ" ? "/faq" : "/contact"
                    } className="text-sm text-slate-500 hover:text-brand-blue transition-colors">
                      {item}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => openModal("tour")}
                      className="text-sm text-slate-500 hover:text-brand-blue transition-colors cursor-pointer text-left w-full"
                    >
                      {item}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-navy mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-500"><Mail size={16} /> support@vemtap.com</li>
              <li className="flex items-center gap-3 text-sm text-slate-500"><Phone size={16} /> +234 (0) 800 VEMTAP</li>
              <li className="flex items-start gap-3 text-sm text-slate-500"><MapPin size={16} /> Lagos, Nigeria <br />Abuja, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Vemtap Health. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs text-slate-400 hover:text-slate-600">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-slate-600">Terms of Service</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-slate-600">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
