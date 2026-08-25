"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Building2, Eye, Glasses, Stethoscope, Microscope, 
  CheckCircle2, ArrowRight, Activity, Users, ShieldCheck, 
  Package, Zap, BarChart3, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";

const industryData: Record<string, any> = {
  "eye-clinics": {
    title: "Eye Clinics",
    icon: Building2,
    hero: "Modernize your general eye practice with end-to-end automation.",
    description: "Vemtap Health provides the foundation for general eye clinics to reduce administrative burden and focus on patient care. Our platform handles everything from the first QR check-in to final HMO reconciliation.",
    benefits: [
      { title: "Reduce Wait Times", desc: "Automated queue management reduces physical waiting room congestion by up to 40%.", icon: Clock },
      { title: "HMO Ready", desc: "Verify insurance and generate claims instantly without manual paperwork.", icon: ShieldCheck },
      { title: "Staff Efficiency", desc: "Digital intake forms and synchronized patient records keep your team moving.", icon: Users },
    ],
    features: [
      "QR Code Self Check-In",
      "Live Queue Board",
      "HMO Remittance Reconcilation",
      "WhatsApp Appointment Reminders",
      "Basic Clinical Notes",
      "Daily Revenue Reporting"
    ]
  },
  "optical-centers": {
    title: "Optical Centers",
    icon: Glasses,
    hero: "Precision tracking for frames, lenses, and lab workflows.",
    description: "Designed for high-volume optical retail and manufacturing. Track every order from the moment a frame is selected until the patient walks out with their new glasses.",
    benefits: [
      { title: "Zero Order Loss", desc: "Real-time status tracking ensures no lens order ever gets lost in the lab.", icon: Activity },
      { title: "Stock Precision", desc: "Maintain perfect inventory levels for frames, cases, and accessories.", icon: Package },
      { title: "Sales Growth", desc: "Integrated POS and recall campaigns drive repeat optical business.", icon: BarChart3 },
    ],
    features: [
      "Lens Production Tracking",
      "Frame Inventory Management",
      "Optical Sales POS",
      "Supplier Order Management",
      "Patient Pickup Notifications",
      "Lens Pricing Automation"
    ]
  },
  "vision-clinics": {
    title: "Vision Clinics",
    icon: Eye,
    hero: "Streamline primary eye care and routine examinations.",
    description: "Optimized for practices focused on primary vision care, refractions, and preventative eye health. Make every visit seamless for both staff and patients.",
    benefits: [
      { title: "Fast Refractions", desc: "Quickly record and access prescription history for every patient.", icon: Zap },
      { title: "Patient Engagement", desc: "Keep patients coming back with automated recall and follow-up alerts.", icon: Users },
      { title: "Simple Billing", desc: "Easy invoicing for consultations and routine tests.", icon: BarChart3 },
    ],
    features: [
      "Prescription History Management",
      "Digital Refraction Forms",
      "Online Appointment Booking",
      "Patient Portal Access",
      "Automated Recall Campaigns",
      "Basic Inventory Tracking"
    ]
  },
  "ophthalmology-centers": {
    title: "Ophthalmology Centers",
    icon: Stethoscope,
    hero: "Advanced clinical modules for complex ophthalmic care.",
    description: "Built for specialist centers requiring deep clinical data, imaging management, and surgical coordination. Vemtap scales with your complexity.",
    benefits: [
      { title: "Clinical Depth", desc: "Record detailed eye exams, from IOP to fundoscopy, in a structured format.", icon: Microscope },
      { title: "Surgical Precision", desc: "Manage theater bookings, pre-op checklists, and post-op follow-ups.", icon: Activity },
      { title: "Image Integration", desc: "Centralized gallery for retina scans, OCT images, and diagnostic reports.", icon: ShieldCheck },
    ],
    features: [
      "Surgery Management Workflow",
      "Diagnostic Imaging Gallery",
      "Advanced Eye Exam Templates",
      "Multi-specialist Coordination",
      "Complex Clinical Reporting",
      "HMO Authorization Tracking"
    ]
  },
  "specialist-clinics": {
    title: "Specialist Clinics",
    icon: Microscope,
    hero: "Customizable workflows for sub-specialty eye care.",
    description: "Whether you specialize in glaucoma, retina, or pediatrics, Vemtap provides the flexibility to track the metrics and clinical data that matter most to your specialty.",
    benefits: [
      { title: "Sub-specialty Focus", desc: "Custom exam templates tailored to your specific area of expertise.", icon: Microscope },
      { title: "Long-term Monitoring", desc: "Track disease progression with dedicated analytics and trend reports.", icon: BarChart3 },
      { title: "Referral Network", desc: "Streamline how you receive and report back to referring doctors.", icon: Users },
    ],
    features: [
      "Custom Exam Module Creator",
      "Disease Progression Analytics",
      "Referral Management System",
      "Advanced Research Export",
      "Sub-specialty Consent Forms",
      "Automated specialist reports"
    ]
  }
};

export default function IndustryDetailPage() {
  const { slug } = useParams();
  const { openModal } = useModals();
  const data = industryData[slug as string];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Industry Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-brand-navy relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="w-16 h-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center mb-8">
              <Icon size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {data.title} <br />
              <span className="text-brand-blue font-light">Workflow OS</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              {data.hero}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="primary" onClick={() => openModal("demo")}>Request Industry Demo</Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => openModal("sales")}>Contact Sales</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description & Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold text-brand-navy mb-6">Built for your unique needs.</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                {data.description}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {data.benefits.map((benefit: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm shrink-0">
                    <benefit.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy mb-1">{benefit.title}</h4>
                    <p className="text-sm text-slate-500">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-12 md:p-20 rounded-[3rem] bg-brand-navy text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-12">Industry-Specific Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                      <CheckCircle2 size={18} className="text-brand-blue group-hover:text-white" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-navy mb-8 leading-tight">
            Elevate your {data.title.toLowerCase()} with Vemtap.
          </h2>
          <p className="text-xl text-slate-500 mb-10">
            Join hundreds of eye care professionals who have transformed their operations with our platform.
          </p>
          <div className="flex flex-col sm:row gap-4 justify-center">
            <Button size="lg" variant="primary" className="px-12" onClick={() => openModal("demo")}>Start Free Trial</Button>
            <Button size="lg" variant="ghost" onClick={() => openModal("tour")}>Watch Product Tour</Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
