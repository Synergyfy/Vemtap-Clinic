"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useModals } from "@/lib/modal-context";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});
  const { openModal } = useModals();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-group")) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleMobileDropdown = (name: string) => {
    setMobileDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Solutions", href: "/industries" },
    { name: "Pricing", href: "/pricing" },
    { 
      name: "Resources", 
      href: "#",
      dropdown: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Blog", href: "/blog" },
      ]
    },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] py-2.5 sm:py-3"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shadow-sm shadow-brand-blue/20">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-brand-navy tracking-tight">
            Vemtap<span className="text-brand-blue">Health</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div 
              key={link.name} 
              className="relative nav-group"
            >
              {link.dropdown ? (
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-blue transition-colors py-2"
                  onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                >
                  {link.name} <ChevronDown size={14} className={cn("transition-transform", activeDropdown === link.name && "rotate-180")} />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-brand-blue transition-colors py-2"
                >
                  {link.name}
                </Link>
              )}

              {link.dropdown && (
                <AnimatePresence>
                  {activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50"
                    >
                      {link.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-brand-blue px-4">
            Login
          </Link>
          <Link href="/book-demo">
            <Button variant="outline" size="sm">Book Demo</Button>
          </Link>
          <Button variant="default" size="sm">Start Free Trial</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-brand-navy shadow-sm backdrop-blur-sm transition hover:border-brand-blue/30 hover:text-brand-blue"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile navigation"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="md:hidden absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 p-4">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-2">
                  {link.dropdown ? (
                    <>
                      <button 
                        className="mt-1 flex items-center justify-between rounded-xl px-2 py-2 text-base font-semibold text-brand-navy transition hover:bg-slate-50"
                        onClick={() => toggleMobileDropdown(link.name)}
                      >
                        {link.name}
                        <ChevronDown size={18} className={cn("transition-transform", mobileDropdowns[link.name] && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {mobileDropdowns[link.name] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col gap-1 overflow-hidden rounded-2xl bg-slate-50 px-3 py-2"
                          >
                            {link.dropdown.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-brand-blue"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="rounded-xl px-2 py-2 text-base font-medium text-slate-700 transition hover:bg-slate-50 hover:text-brand-blue"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <hr className="border-slate-100" />
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Login</Button>
                </Link>
                <Link href="/book-demo" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Book Demo</Button>
                </Link>
                <Button variant="default" className="w-full justify-center">Start Free Trial</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
