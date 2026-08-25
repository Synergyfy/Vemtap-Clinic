"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "demo" | "tour" | "sales" | "clinic" | "invoice" | "transaction" | "staff" | "branch" | "report" | "expense" | "claim" | "hmo-verify" | "hmo-claim" | "report-schedule" | "staff-profile" | "kb-article" | "support-ticket" | "incident-log" | "broadcast" | "ticket" | "chat-console" | null;

interface ModalContextType {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
};
