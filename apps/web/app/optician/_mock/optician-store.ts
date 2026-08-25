import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LensOrder, LensOrderStatus, InventoryItem, ProductionItem, ProductionStage, Sale } from "./optician-data";
import { lensOrders as initialOrders, inventoryItems as initialInventory, productionItems as initialProduction, salesData as initialSales } from "./optician-data";

interface OpticianState {
  orders: LensOrder[];
  inventory: InventoryItem[];
  production: ProductionItem[];
  sales: Sale[];

  updateOrderStatus: (orderId: string, status: LensOrderStatus) => void;
  updateProductionStage: (prodId: string, stage: ProductionStage) => void;
  deductInventory: (itemId: string, qty: number) => void;
  completeSale: (saleId: string) => void;
  addOrder: (order: LensOrder) => void;
}

export const useOpticianStore = create<OpticianState>()(
  persist(
    (set) => ({
      orders: initialOrders,
      inventory: initialInventory,
      production: initialProduction,
      sales: initialSales,

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),

      updateProductionStage: (prodId, stage) =>
        set((state) => ({
          production: state.production.map((p) =>
            p.id === prodId ? { ...p, stage } : p
          ),
        })),

      deductInventory: (itemId, qty) =>
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i
          ),
        })),

      completeSale: (saleId) =>
        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === saleId ? { ...s, status: "Completed" as const } : s
          ),
        })),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    { name: "optician-station-storage" }
  )
);
