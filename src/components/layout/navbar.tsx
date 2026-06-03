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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold text-brand-navy tracking-tight">
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
          <Button variant="primary" size="sm">Start Free Trial</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-brand-navy"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-2">
                  {link.dropdown ? (
                    <>
                      <button 
                        className="text-lg font-bold text-brand-navy mt-2 flex justify-between items-center"
                        onClick={() => toggleMobileDropdown(link.name)}
                      >
                        {link.name}
                        <ChevronDown size={20} className={cn("transition-transform", mobileDropdowns[link.name] && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {mobileDropdowns[link.name] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col gap-2 pl-4 overflow-hidden"
                          >
                            {link.dropdown.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="text-base font-medium text-slate-600 py-1"
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
                      className="text-lg font-medium text-slate-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <hr className="border-slate-100" />
              <div className="flex flex-col gap-3">
                <Link href="/book-demo" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Book Demo</Button>
                </Link>
                <Button variant="primary" className="w-full">Start Free Trial</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
