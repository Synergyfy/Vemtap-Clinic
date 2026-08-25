import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AssignedPatient, VitalsEntry, MonitoringAlert, ObservationNote, FollowUp } from "./nurse-data";
import {
  nurseAssignedPatients as initialPatients,
  nursePendingVitals as initialPendingVitals,
  nurseMonitoringAlerts as initialAlerts,
  nurseObservationNotes as initialNotes,
  nurseFollowUps as initialFollowUps,
} from "./nurse-data";

interface VitalsFormData {
  bloodPressure: string;
  temperature: string;
  pulse: string;
  visionMeasurement: string;
}

interface NurseState {
  assignedPatients: AssignedPatient[];
  pendingVitals: VitalsEntry[];
  monitoringAlerts: MonitoringAlert[];
  observationNotes: ObservationNote[];
  followUps: FollowUp[];

  recordVitals: (patientId: string, data: VitalsFormData) => void;
  acknowledgeAlert: (alertId: string) => void;
  addNote: (patientId: string, patientName: string, note: string, category: ObservationNote["category"]) => void;
  markFollowUpDone: (followUpId: string) => void;
  scheduleFollowUp: (patientId: string, patientName: string, dueDate: string, reason: string) => void;
  markPatientCompleted: (patientId: string) => void;
}

let nextNoteId = 100;
let nextFollowUpId = 100;

export const useNurseStore = create<NurseState>()(
  persist(
    (set) => ({
      assignedPatients: initialPatients,
      pendingVitals: initialPendingVitals,
      monitoringAlerts: initialAlerts,
      observationNotes: initialNotes,
      followUps: initialFollowUps,

      recordVitals: (patientId, data) => set((state) => {
        const patient = state.assignedPatients.find((p) => p.patientId === patientId);
        if (!patient) return state;

        const newVitals: VitalsEntry = {
          id: `V-${Date.now()}`,
          patientId,
          patientName: patient.patientName,
          bloodPressure: data.bloodPressure,
          temperature: data.temperature,
          pulse: data.pulse,
          visionMeasurement: data.visionMeasurement,
          recordedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          recordedBy: "Nurse R. Okeke",
        };

        const newNote: ObservationNote = {
          id: `ON-${nextNoteId++}`,
          patientId,
          patientName: patient.patientName,
          note: `Vitals recorded - BP: ${data.bloodPressure}, Temp: ${data.temperature}°C, Pulse: ${data.pulse}bpm, Vision: ${data.visionMeasurement}`,
          timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          category: "General",
        };

        const resolvedAlert: MonitoringAlert | undefined = state.monitoringAlerts.find(
          (a) => a.patientId === patientId && a.status === "Open" && a.alert.toLowerCase().includes("vitals")
        );

        return {
          assignedPatients: state.assignedPatients.map((p) =>
            p.patientId === patientId && p.status === "Waiting"
              ? { ...p, status: "Under Observation" as const }
              : p
          ),
          pendingVitals: state.pendingVitals.filter((v) => v.patientId !== patientId),
          monitoringAlerts: resolvedAlert
            ? state.monitoringAlerts.map((a) =>
                a.id === resolvedAlert.id ? { ...a, status: "Resolved" as const } : a
              )
            : state.monitoringAlerts,
          observationNotes: [newNote, ...state.observationNotes],
        };
      }),

      acknowledgeAlert: (alertId) => set((state) => ({
        monitoringAlerts: state.monitoringAlerts.map((a) =>
          a.id === alertId ? { ...a, status: "Acknowledged" as const } : a
        ),
      })),

      addNote: (patientId, patientName, note, category) => set((state) => {
        const newNote: ObservationNote = {
          id: `ON-${nextNoteId++}`,
          patientId,
          patientName,
          note,
          timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          category,
        };
        return { observationNotes: [newNote, ...state.observationNotes] };
      }),

      markFollowUpDone: (followUpId) => set((state) => ({
        followUps: state.followUps.map((f) =>
          f.id === followUpId ? { ...f, status: "Completed" as const } : f
        ),
      })),

      scheduleFollowUp: (patientId, patientName, dueDate, reason) => set((state) => {
        const newFollowUp: FollowUp = {
          id: `FU-${nextFollowUpId++}`,
          patientId,
          patientName,
          dueDate,
          reason,
          status: "Pending",
        };
        return { followUps: [...state.followUps, newFollowUp] };
      }),

      markPatientCompleted: (patientId) => set((state) => ({
        assignedPatients: state.assignedPatients.map((p) =>
          p.patientId === patientId
            ? { ...p, status: "Completed" as const }
            : p
        ),
      })),
    }),
    {
      name: "nurse-station-storage",
    }
  )
);
