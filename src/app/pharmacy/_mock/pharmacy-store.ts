import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Drug, Prescription, DispensingRecord, Supplier, PurchaseOrder, RxStatus } from "./pharmacy-data";
import { drugs as initialDrugs, prescriptions as initialRx, dispensingRecords as initialDispensing, suppliers as initialSuppliers, purchaseOrders as initialPO } from "./pharmacy-data";

interface PharmacyState {
  drugs: Drug[];
  prescriptions: Prescription[];
  dispensingRecords: DispensingRecord[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];

  updateRxStatus: (rxId: string, status: RxStatus) => void;
  dispenseDrug: (prescriptionId: string, patientName: string, drugList: { drugName: string; qty: number }[]) => void;
  confirmPickup: (dispenseId: string) => void;
  deductDrug: (drugId: string, qty: number) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  deliverPurchaseOrder: (poId: string) => void;
  restockDrug: (drugId: string, qty: number) => void;
}

export const usePharmacyStore = create<PharmacyState>()(
  persist(
    (set) => ({
      drugs: initialDrugs,
      prescriptions: initialRx,
      dispensingRecords: initialDispensing,
      suppliers: initialSuppliers,
      purchaseOrders: initialPO,

      updateRxStatus: (rxId, status) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((rx) =>
            rx.id === rxId ? { ...rx, status } : rx
          ),
        })),

      dispenseDrug: (prescriptionId, patientName, drugList) =>
        set((state) => {
          const rec: DispensingRecord = {
            id: `DS-${String(state.dispensingRecords.length + 1).padStart(3, "0")}`,
            prescriptionId,
            patientName,
            dispensedBy: "Pharm. P. Okafor",
            dispensedAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            status: "Dispensed",
            drugs: drugList,
          };
          return {
            prescriptions: state.prescriptions.map((rx) =>
              rx.id === prescriptionId ? { ...rx, status: "Dispensing" as RxStatus } : rx
            ),
            dispensingRecords: [rec, ...state.dispensingRecords],
          };
        }),

      confirmPickup: (dispenseId) =>
        set((state) => {
          const rec = state.dispensingRecords.find((r) => r.id === dispenseId);
          if (!rec) return state;
          return {
            dispensingRecords: state.dispensingRecords.map((r) =>
              r.id === dispenseId ? { ...r, status: "Picked Up" as const } : r
            ),
            prescriptions: state.prescriptions.map((rx) =>
              rx.id === rec.prescriptionId ? { ...rx, status: "Picked Up" as RxStatus } : rx
            ),
          };
        }),

      deductDrug: (drugId, qty) =>
        set((state) => ({
          drugs: state.drugs.map((d) =>
            d.id === drugId ? { ...d, quantity: Math.max(0, d.quantity - qty) } : d
          ),
        })),

      addPurchaseOrder: (po) =>
        set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] })),

      deliverPurchaseOrder: (poId) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === poId ? { ...po, status: "Delivered" as const } : po
          ),
        })),

      restockDrug: (drugId, qty) =>
        set((state) => ({
          drugs: state.drugs.map((d) =>
            d.id === drugId ? { ...d, quantity: d.quantity + qty } : d
          ),
        })),
    }),
    { name: "pharmacy-station-storage" }
  )
);
