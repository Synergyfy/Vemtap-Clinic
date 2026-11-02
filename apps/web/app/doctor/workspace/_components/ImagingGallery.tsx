"use client";

import React, { useState } from "react";
import { 
  Image as ImageIcon, ZoomIn, 
  Maximize2, X, Download, Tag, Plus, UploadCloud
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ScanItem {
  id: string | number;
  type: string;
  date: string;
  url?: string;
}

interface ClinicalImagingGalleryProps {
  scans?: ScanItem[];
  onUpload?: (file: File, type: string) => void;
}

export const ClinicalImagingGallery: React.FC<ClinicalImagingGalleryProps> = ({ scans = [] }) => {
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [localScans, setLocalScans] = useState<ScanItem[]>(scans);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newScan: ScanItem = {
        id: Date.now(),
        type: file.name.split(".")[0] || "Ophthalmic Scan",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        url: URL.createObjectURL(file),
      };
      setLocalScans((prev) => [newScan, ...prev]);
    }
  };

  const activeScans = localScans.length > 0 ? localScans : scans;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clinical Imaging Gallery</h3>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus size={14} /> Upload Scan
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {activeScans.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <UploadCloud size={36} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">No clinical imaging on file</p>
            <p className="text-xs text-slate-400 mt-1">Upload Fundus, OCT, or Slit Lamp captures for this consultation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeScans.map((scan) => (
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
        )}
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
