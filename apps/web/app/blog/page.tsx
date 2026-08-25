"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Search, Calendar, Clock, ArrowRight, 
  Tag, ChevronRight, Share2, MessageCircle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const blogPosts = [
  {
    slug: "eye-clinic-growth-strategies",
    title: "5 Proven Strategies to Grow Your Eye Clinic in 2026",
    excerpt: "Discover the latest trends in patient acquisition and retention for modern eye care practices.",
    category: "Clinic Growth",
    author: "Dr. Sarah Chen",
    date: "May 12, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070"
  },
  {
    slug: "hmo-management-tips",
    title: "How to Reduce HMO Claim Rejections by 90%",
    excerpt: "Learn the secrets to clean claim submission and faster remittance reconciliation.",
    category: "HMO Management",
    author: "James Wilson",
    date: "May 10, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1454165833767-1316b044633b?auto=format&fit=crop&q=80&w=2070"
  },
  {
    slug: "optical-inventory-guide",
    title: "The Ultimate Guide to Optical Inventory Management",
    excerpt: "Stop losing money on damaged stock and slow-moving frames with these simple tips.",
    category: "Optical",
    author: "Emily Rodriguez",
    date: "May 8, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1511732351157-1865efda005b?auto=format&fit=crop&q=80&w=2070"
  },
  {
    slug: "healthcare-automation-future",
    title: "The Future of Eye Care: AI and Smart Workflows",
    excerpt: "Exploring how artificial intelligence is transforming ophthalmology diagnostics and operations.",
    category: "Technology",
    author: "Dr. Michael Adebayo",
    date: "May 5, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070"
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
                Vemtap <span className="text-brand-blue">Insights</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed">
                Expert advice, industry trends, and practical guides for modern eye care professionals.
              </p>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue" size={18} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
              />
            </div>
          </div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent z-10"></div>
            <img 
              src={blogPosts[0].image} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt="Featured" 
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 max-w-3xl">
              <div className="flex items-center gap-4 text-white/80 text-sm font-bold mb-4">
                <span className="px-3 py-1 rounded-full bg-brand-blue text-white uppercase tracking-widest text-[10px]">Featured</span>
                <span>• {blogPosts[0].date}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {blogPosts[0].title}
              </h2>
              <p className="text-lg text-slate-200 mb-8 line-clamp-2 opacity-80">
                {blogPosts[0].excerpt}
              </p>
              <Link 
                href={`/blog/${blogPosts[0].slug}`}
                className="inline-flex items-center gap-2 bg-white text-brand-navy px-8 py-4 rounded-2xl font-bold hover:gap-4 transition-all"
              >
                Read Article <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-bold text-brand-navy">Latest Articles</h3>
            <div className="flex gap-2">
              {["All", "Clinic Growth", "Technology", "Optical", "HMO"].map((cat) => (
                <button key={cat} className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-brand-blue hover:bg-brand-soft-blue transition-all">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 relative shadow-lg">
                  <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={post.title} />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-brand-blue text-[10px] font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-3">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                </div>
                <h4 className="text-xl font-bold text-brand-navy mb-4 group-hover:text-brand-blue transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-2 text-brand-blue font-bold group/link">
                  Read More <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center gap-4">
            <Button variant="outline" className="w-12 h-12 rounded-xl p-0" disabled>1</Button>
            <Button variant="ghost" className="w-12 h-12 rounded-xl p-0">2</Button>
            <Button variant="ghost" className="w-12 h-12 rounded-xl p-0">3</Button>
            <span className="text-slate-400 px-2">...</span>
            <Button variant="ghost" className="px-6 rounded-xl">Next</Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stay ahead of the curve.</h2>
          <p className="text-lg text-slate-400 mb-10">Get the latest eye care trends and management tips delivered to your inbox every week.</p>
          <div className="flex flex-col sm:row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your work email" 
              className="flex-grow px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:bg-white/10 transition-all"
            />
            <Button size="lg" variant="primary" className="px-10">Subscribe</Button>
          </div>
          <p className="mt-6 text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={14} /> We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
