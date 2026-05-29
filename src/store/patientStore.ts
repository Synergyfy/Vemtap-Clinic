import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ------------------
// Types
// ------------------

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  type: string;
  doctor: string;
  date: string;
  location: string;
  status: AppointmentStatus;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'invoice' | 'prescription' | 'general';
  unread: boolean;
}

export type OrderStatus = 'Received' | 'Production' | 'Ready' | 'Delivered';

export interface OpticalOrder {
  id: string;
  type: string;
  status: OrderStatus;
  date: string;
  estimatedPickup: string;
  location: string;
}

export interface Invoice {
  id: string;
  date: string;
  desc: string;
  amount: number;
  hmoCovered: number;
  status: 'Paid' | 'Unpaid' | 'Covered';
}

// ------------------
// State & Actions
// ------------------

interface PatientState {
  // Appointments
  appointments: Appointment[];
  bookAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  rescheduleAppointment: (id: number, newDate: string) => void;
  cancelAppointment: (id: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'unread'>) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;

  // Optical Orders
  orders: OpticalOrder[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Billing
  invoices: Invoice[];
  outstandingBalance: number;
  payInvoice: (id: string) => void;

  // Global Reset
  resetStore: () => void;
}

// ------------------
// Initial Data
// ------------------

const initialAppointments: Appointment[] = [
  { id: 1, type: "Comprehensive Eye Exam", doctor: "Dr. Sarah Jenkins", date: "Today, 10:30 AM", location: "Main Branch", status: "upcoming" },
  { id: 2, type: "Follow-up Consultation", doctor: "Dr. Michael Chen", date: "Oct 25, 2026, 02:00 PM", location: "Downtown Clinic", status: "upcoming" },
  { id: 3, type: "Lens Fitting", doctor: "Opt. David Smith", date: "Sep 10, 2026, 11:15 AM", location: "Main Branch", status: "completed" }
];

const initialNotifications: Notification[] = [
  { id: 1, title: "Appointment Reminder", message: "Don't forget your eye exam today at 10:30 AM.", time: "2 hours ago", type: "appointment", unread: true },
  { id: 2, title: "New Invoice Available", message: "Invoice INV-2026-89 is ready for payment.", time: "1 day ago", type: "invoice", unread: true },
  { id: 3, title: "Prescription Updated", message: "Dr. Jenkins has updated your active prescription.", time: "3 days ago", type: "prescription", unread: false },
];

const initialOrders: OpticalOrder[] = [
  { id: "VO-8421", type: "Single Vision • Anti-reflective coating", status: "Production", date: "Oct 5, 2026", estimatedPickup: "Oct 12, 2026", location: "Main Branch, 123 Vision Way" },
  { id: "VO-7102", type: "Reading Glasses", status: "Delivered", date: "Mar 10, 2025", estimatedPickup: "Mar 20, 2025", location: "Main Branch" }
];

const initialInvoices: Invoice[] = [
  { id: "INV-2026-89", date: "Oct 10, 2026", desc: "Consultation Fee", amount: 120, hmoCovered: 0, status: "Unpaid" },
  { id: "INV-2026-88", date: "Sep 10, 2026", desc: "Eye Glasses (Anti-glare)", amount: 250, hmoCovered: 150, status: "Paid" },
  { id: "INV-2025-42", date: "Mar 15, 2025", desc: "Consultation & Eye Drops", amount: 85, hmoCovered: 85, status: "Covered" }
];

const initialState = {
  appointments: initialAppointments,
  notifications: initialNotifications,
  orders: initialOrders,
  invoices: initialInvoices,
  outstandingBalance: 120,
};

// ------------------
// Store Creation
// ------------------

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      ...initialState,

      // Appointment Actions
      bookAppointment: (appt) => set((state) => {
        const newAppt: Appointment = {
          ...appt,
          id: Math.max(0, ...state.appointments.map(a => a.id)) + 1,
          status: 'upcoming'
        };
        // Also add a notification
        const newNotif: Notification = {
          id: Math.max(0, ...state.notifications.map(n => n.id)) + 1,
          title: "Appointment Booked",
          message: `Your ${appt.type} with ${appt.doctor} is confirmed.`,
          time: "Just now",
          type: "appointment",
          unread: true
        };
        return { 
          appointments: [newAppt, ...state.appointments],
          notifications: [newNotif, ...state.notifications]
        };
      }),
      rescheduleAppointment: (id, newDate) => set((state) => ({
        appointments: state.appointments.map(a => 
          a.id === id ? { ...a, date: newDate } : a
        )
      })),
      cancelAppointment: (id) => set((state) => ({
        appointments: state.appointments.map(a => 
          a.id === id ? { ...a, status: 'cancelled' } : a
        )
      })),

      // Notification Actions
      addNotification: (notif) => set((state) => ({
        notifications: [
          { ...notif, id: Math.max(0, ...state.notifications.map(n => n.id)) + 1, unread: true },
          ...state.notifications
        ]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, unread: false } : n
        )
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, unread: false }))
      })),

      // Order Actions
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, status } : o
        )
      })),

      // Billing Actions
      payInvoice: (id) => set((state) => {
        const updatedInvoices = state.invoices.map(inv => 
          inv.id === id ? { ...inv, status: 'Paid' as const } : inv
        );
        const newBalance = updatedInvoices
          .filter(inv => inv.status === 'Unpaid')
          .reduce((sum, inv) => sum + inv.amount, 0);

        // Add payment notification
        const newNotif: Notification = {
          id: Math.max(0, ...state.notifications.map(n => n.id)) + 1,
          title: "Payment Successful",
          message: `Payment received for invoice ${id}.`,
          time: "Just now",
          type: "general",
          unread: true
        };

        return {
          invoices: updatedInvoices,
          outstandingBalance: newBalance,
          notifications: [newNotif, ...state.notifications]
        };
      }),

      // Global Reset
      resetStore: () => set(initialState)
    }),
    {
      name: 'patient-portal-storage', // key in localStorage
    }
  )
);
