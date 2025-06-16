import { create } from "zustand";

interface ConfirmCreateOrderDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmCreateOrderDialogStore = create<ConfirmCreateOrderDialogStore>(
  (set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }),
);
