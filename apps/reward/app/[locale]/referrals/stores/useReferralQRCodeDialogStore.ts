import { create } from "zustand";

interface ReferralQRCodeDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useReferralQRCodeDialogStore = create<ReferralQRCodeDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
