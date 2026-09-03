"use client";

import React, { useState } from "react";
import { 
  Image as ImageIcon, ZoomIn, 
  Maximize2, X, Download, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock data for scan images
const mockScans = [
  { id: 1, type: "Fundus", date: "June 18, 2026", url: "/public/vercel.svg" }, // Placeholders
  { id: 2, type: "OCT", date: "June 18, 2026", url: "/public/next.svg" },
  { id: 3, type: "Retina Scan", date: "May 24, 2026", url: "/public/window.svg" },
];

export const ClinicalImagingGallery = () => {
  const [selectedScan, setSelectedScan] = useState<typeof mockScans[0] | null>(null);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clinical Imaging Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mockScans.map((scan) => (
            <div 
              key={scan.id} 
              className="group relative aspect-square rounded-2xl bg-slate-100 overflow-hidden cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all"
              onClick={() => setSelectedScan(scan)}
            >
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                <ImageIcon size={48} />
              </div>
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <ZoomIn className="text-white" />
                <span className="text-white font-black text-xs">VIEW</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase text-slate-900">
                {scan.type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedScan(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black">{selectedScan.type} Scan</h2>
                <p className="text-xs text-slate-500 font-bold">{selectedScan.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-xs font-black hover:bg-slate-200">
                  <Tag size={14} /> Annotate
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
            
            <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-slate-400 font-black">High-Fidelity Viewer Placeholder</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
