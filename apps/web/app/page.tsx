import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { PatientCheckIn } from "@/components/sections/patient-check-in";
import { HMOManagement } from "@/components/sections/hmo-management";
import { OpticalWorkflow } from "@/components/sections/optical-workflow";
import { QueueManagement } from "@/components/sections/queue-management";
import { OCRAutomation } from "@/components/sections/ocr-automation";
import { MultiBranchAnalytics } from "@/components/sections/multi-branch-analytics";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { PricingSection } from "@/components/sections/pricing-section";
import { FAQ } from "@/components/sections/faq";
import { FinalCTA } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustSection />
      <PatientCheckIn />
      <HMOManagement />
      <OpticalWorkflow />
      <QueueManagement />
      <OCRAutomation />
      <MultiBranchAnalytics />
      <FeaturesGrid />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
