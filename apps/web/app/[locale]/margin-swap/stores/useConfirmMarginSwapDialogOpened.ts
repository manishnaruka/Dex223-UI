import { create } from "zustand";

interface ConfirmMarginSwapDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmMarginSwapDialogStore = create<ConfirmMarginSwapDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
