import { ClinicAppointment, ClinicQueueItem, formatNGN } from "@/app/clinic/_mock/clinic-data";

export type DoctorSchedule = {
  id: string;
  day: string;
  timeSlot: string;
  type: "Consultation" | "Surgery" | "Review";
  patientName?: string;
};

export const doctorWaitingPatients: ClinicQueueItem[] = [
  { id: "Q-201", patientId: "P-003", patientName: "Fatima Yusuf", stage: "Consultation", priority: "Normal", waitMinutes: 12, status: "Waiting" },
  { id: "Q-205", patientId: "P-009", patientName: "Emeka Obi", stage: "Consultation", priority: "Urgent", waitMinutes: 5, status: "Waiting" },
  { id: "Q-206", patientId: "P-010", patientName: "Sarah Ahmed", stage: "Consultation", priority: "Normal", waitMinutes: 18, status: "Waiting" },
];

export const doctorTodayAppointments: ClinicAppointment[] = [
  { id: "A-1001", patientId: "P-003", patientName: "Fatima Yusuf", dateISO: "2026-06-18", startTime: "09:00", endTime: "09:30", service: "Consultation", provider: "Dr. A. Bello", kind: "Regular", status: "Checked-in", createdISO: "2026-06-17T18:30:00" },
  { id: "A-1005", patientId: "P-006", patientName: "Maryam Sule", dateISO: "2026-06-18", startTime: "10:30", endTime: "11:00", service: "Consultation", provider: "Dr. A. Bello", kind: "Walk-in", reason: "Itchy eyes", status: "Scheduled", createdISO: "2026-06-18T08:10:00" },
  { id: "A-1006", patientId: "P-011", patientName: "Samuel John", dateISO: "2026-06-18", startTime: "11:30", endTime: "12:00", service: "Consultation", provider: "Dr. A. Bello", kind: "Regular", status: "Scheduled", createdISO: "2026-06-16T10:00:00" },
];

export const doctorFollowUpsDue = [
  { id: "FU-001", patientName: "Fatima Yusuf", dueISO: "2026-06-25", reason: "Review conjunctivitis symptoms", status: "Pending" },
  { id: "FU-003", patientName: "John Doe", dueISO: "2026-06-20", reason: "Post-op cataract review", status: "Pending" },
];

export const doctorPerformanceStats = {
  patientsSeenToday: 8,
  avgConsultationTime: "24m",
  patientSatisfaction: 4.9,
  pendingReports: 2,
};

export const doctorRecentConsultations = [
  { id: "C-101", patientName: "Adesuwa Okoro", date: "2026-06-17", diagnosis: "Myopia", status: "Completed" },
  { id: "C-102", patientName: "Chidi Okafor", date: "2026-06-17", diagnosis: "Glaucoma Suspect", status: "Completed" },
  { id: "C-103", patientName: "Ifeanyi Nwosu", date: "2026-06-16", diagnosis: "Post-cataract recovery", status: "Completed" },
];
