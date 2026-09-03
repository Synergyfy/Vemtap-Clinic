"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function QueueDisplayManagePage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/reception/queue");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-sm text-slate-400 font-medium">Redirecting to queue management...</p>
      </div>
    </div>
  );
}
