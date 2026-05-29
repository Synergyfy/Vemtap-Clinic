import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/lib/modal-context";
import { ModalManager } from "@/components/popups/modal-manager";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vemtap Health | Modern Workflow Automation for Eye Clinics",
  description: "Reduce queues, automate patient check-ins, manage HMOs, and streamline operations with the most intelligent platform for eye clinics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen flex flex-col selection:bg-brand-blue/20 selection:text-brand-blue`}
      >
        <ModalProvider>
          {children}
          <ModalManager />
        </ModalProvider>
      </body>
    </html>
  );
}
