"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Calendar, Clock, Share2, ArrowLeft, 
  MessageCircle, Globe, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlogPostPage() {
  const { slug } = useParams();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Article Header */}
      <article className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-blue font-bold mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
          
          <div className="flex items-center gap-4 text-brand-blue text-sm font-bold mb-6 uppercase tracking-widest">
            Clinic Growth
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-8 leading-tight">
            How to Scale Your Eye Clinic Operations in 2026
          </h1>
          
          <div className="flex items-center justify-between py-8 border-y border-slate-100 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div>
                <div className="font-bold text-brand-navy">Dr. Sarah Chen</div>
                <div className="text-sm text-slate-500">Founder & CEO, Vemtap Health</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1"><Calendar size={16} /> May 12, 2026</span>
              <span className="flex items-center gap-1"><Clock size={16} /> 8 min read</span>
            </div>
          </div>

          <div className="aspect-video rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070" 
              className="w-full h-full object-cover" 
              alt="Scalable Clinic" 
            />
          </div>

          {/* Content Placeholder */}
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
              The landscape of eye care is changing rapidly. With the rise of AI-driven diagnostics and the increasing complexity of HMO management, clinics must adapt or risk falling behind.
            </p>
            
            <h2 className="text-3xl font-bold text-brand-navy mt-12 mb-6">1. Embrace Digital Intake</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Paper forms are the bottleneck of the modern eye clinic. By implementing QR-based self check-in, you can reduce administrative time by up to 30%. This not only improves staff morale but also provides a premium experience for your patients from the moment they walk in.
            </p>

            <div className="bg-slate-50 p-8 rounded-3xl border-l-4 border-brand-blue my-12">
              <p className="text-lg italic text-brand-navy font-medium">
                "Automation isn't about replacing people; it's about freeing them to do the high-value clinical work they were trained for."
              </p>
            </div>

            <h2 className="text-3xl font-bold text-brand-navy mt-12 mb-6">2. Automate HMO Reconciliation</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Revenue leakage often happens in the manual reconciliation of HMO remittances. Using an intelligent system that automatically tracks every claim from submission to payment ensures that no revenue is left on the table.
            </p>
          </div>

          {/* Sharing */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Share</span>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-blue hover:text-white transition-all">
                  <Share2 size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-blue hover:text-white transition-all">
                  <Globe size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-blue hover:text-white transition-all">
                  <MessageCircle size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-blue hover:text-white transition-all">
                  <LinkIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts Preview */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-brand-navy mb-12">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                <div className="aspect-video rounded-2xl bg-slate-200 mb-6" />
                <h4 className="font-bold text-brand-navy mb-2 line-clamp-2">How to Reduce HMO Claim Rejections by 90%</h4>
                <Link href="#" className="text-brand-blue font-bold text-sm">Read More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
