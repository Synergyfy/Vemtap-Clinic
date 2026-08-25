import React from "react";
import PatientLayout from "@/components/patient/PatientLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PatientLayout>{children}</PatientLayout>;
}
