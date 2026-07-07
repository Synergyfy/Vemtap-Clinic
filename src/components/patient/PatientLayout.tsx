"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-full bg-gray-50/50 min-h-screen">
      <Sidebar />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
