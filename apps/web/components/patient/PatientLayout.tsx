"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Standalone auth and onboarding routes that don't need sidebar/shell
const AUTH_ROUTES = [
  "/patient/welcome",
  "/patient/login",
  "/patient/register",
  "/patient/verify",
  "/patient/complete-profile",
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <>
      {/* Inter + Plus Jakarta Sans + Material Symbols Outlined font links */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {isAuthPage ? (
        // Auth / Onboarding pages render clean standalone view
        children
      ) : (
        // Standard Patient Portal Layout (Full desktop sidebar & topbar + mobile bottom nav)
        <div className="h-full bg-[#F4F9FD] text-[#0F2942] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Sidebar />
          <div className="lg:pl-72 flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 pb-20 lg:pb-8">
              <div className="px-3 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-full w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="h-full w-full"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
            <BottomNav />
          </div>
        </div>
      )}
    </>
  );
}
