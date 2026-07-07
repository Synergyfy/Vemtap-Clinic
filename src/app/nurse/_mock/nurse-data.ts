export type AssignedPatient = {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  purpose: string;
  status: "Waiting" | "Under Observation" | "Completed";
  assignedAt: string;
  priority: "Normal" | "Urgent";
};

export type VitalsEntry = {
  id: string;
  patientId: string;
  patientName: string;
  bloodPressure: string;
  temperature: string;
  pulse: string;
  visionMeasurement: string;
  recordedAt: string;
  recordedBy: string;
};

export type MonitoringAlert = {
  id: string;
  patientId: string;
  patientName: string;
  alert: string;
  severity: "Low" | "Medium" | "High";
  timestamp: string;
  status: "Open" | "Acknowledged" | "Resolved";
};

export type ObservationNote = {
  id: string;
  patientId: string;
  patientName: string;
  note: string;
  timestamp: string;
  category: "General" | "Medication" | "Procedure";
};

export type FollowUp = {
  id: string;
  patientId: string;
  patientName: string;
  dueDate: string;
  reason: string;
  status: "Pending" | "Completed" | "Missed";
};

export const nurseAssignedPatients: AssignedPatient[] = [
  { id: "N-001", patientId: "P-003", patientName: "Fatima Yusuf", age: 34, gender: "Female", purpose: "Pre-consultation vitals", status: "Waiting", assignedAt: "2026-07-06 08:30", priority: "Normal" },
  { id: "N-002", patientId: "P-009", patientName: "Emeka Obi", age: 45, gender: "Male", purpose: "Post-op monitoring", status: "Under Observation", assignedAt: "2026-07-06 07:15", priority: "Urgent" },
  { id: "N-003", patientId: "P-010", patientName: "Sarah Ahmed", age: 28, gender: "Female", purpose: "Eye test preparation", status: "Waiting", assignedAt: "2026-07-06 09:00", priority: "Normal" },
  { id: "N-004", patientId: "P-012", patientName: "Chidi Okafor", age: 52, gender: "Male", purpose: "Glaucoma pressure check", status: "Completed", assignedAt: "2026-07-06 06:45", priority: "Normal" },
  { id: "N-005", patientId: "P-015", patientName: "Blessing Amos", age: 9, gender: "Female", purpose: "Vision screening", status: "Waiting", assignedAt: "2026-07-06 09:15", priority: "Normal" },
  { id: "N-006", patientId: "P-018", patientName: "James Eze", age: 67, gender: "Male", purpose: "Cataract pre-op", status: "Under Observation", assignedAt: "2026-07-06 08:00", priority: "Urgent" },
];

export const nursePendingVitals: VitalsEntry[] = [
  { id: "V-001", patientId: "P-003", patientName: "Fatima Yusuf", bloodPressure: "--", temperature: "--", pulse: "--", visionMeasurement: "--", recordedAt: "Pending", recordedBy: "--" },
  { id: "V-003", patientId: "P-010", patientName: "Sarah Ahmed", bloodPressure: "--", temperature: "--", pulse: "--", visionMeasurement: "--", recordedAt: "Pending", recordedBy: "--" },
  { id: "V-005", patientId: "P-015", patientName: "Blessing Amos", bloodPressure: "--", temperature: "--", pulse: "--", visionMeasurement: "--", recordedAt: "Pending", recordedBy: "--" },
];

export const nurseMonitoringAlerts: MonitoringAlert[] = [
  { id: "MA-001", patientId: "P-009", patientName: "Emeka Obi", alert: "Post-op BP elevation detected", severity: "High", timestamp: "2026-07-06 07:45", status: "Open" },
  { id: "MA-002", patientId: "P-018", patientName: "James Eze", alert: "Pre-op anxiety, elevated pulse", severity: "Medium", timestamp: "2026-07-06 08:15", status: "Open" },
  { id: "MA-003", patientId: "P-003", patientName: "Fatima Yusuf", alert: "Scheduled vitals overdue", severity: "Low", timestamp: "2026-07-06 09:00", status: "Open" },
];

export const nurseObservationNotes: ObservationNote[] = [
  { id: "ON-001", patientId: "P-009", patientName: "Emeka Obi", note: "Patient recovering well post-op. BP slightly elevated, monitoring every 30 min.", timestamp: "2026-07-06 07:30", category: "General" },
  { id: "ON-002", patientId: "P-009", patientName: "Emeka Obi", note: "Administered prescribed pain medication.", timestamp: "2026-07-06 08:00", category: "Medication" },
  { id: "ON-003", patientId: "P-018", patientName: "James Eze", note: "Pre-op preparation completed. Patient prepped for cataract surgery.", timestamp: "2026-07-06 08:30", category: "Procedure" },
  { id: "ON-004", patientId: "P-012", patientName: "Chidi Okafor", note: "IOP measured at 18 mmHg. Within normal range. Patient discharged.", timestamp: "2026-07-06 07:00", category: "General" },
];

export const nurseFollowUps: FollowUp[] = [
  { id: "FU-001", patientId: "P-009", patientName: "Emeka Obi", dueDate: "2026-07-08", reason: "Post-op wound check", status: "Pending" },
  { id: "FU-002", patientId: "P-012", patientName: "Chidi Okafor", dueDate: "2026-07-20", reason: "IOP re-assessment", status: "Pending" },
  { id: "FU-003", patientId: "P-018", patientName: "James Eze", dueDate: "2026-07-10", reason: "Post-cataract follow-up", status: "Pending" },
  { id: "FU-004", patientId: "P-003", patientName: "Fatima Yusuf", dueDate: "2026-07-05", reason: "Conjunctivitis review", status: "Completed" },
];

export const nurseStats = {
  assignedToday: 6,
  underObservation: 2,
  waitingForVitals: 3,
  completedToday: 1,
  pendingFollowUps: 3,
  activeAlerts: 3,
};
