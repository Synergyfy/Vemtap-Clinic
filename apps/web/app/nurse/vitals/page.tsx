import React, { Suspense } from "react";
import VitalsContent from "./VitalsContent";

export default function NurseVitalsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading vitals...</div>
      </div>
    }>
      <VitalsContent />
    </Suspense>
  );
}
