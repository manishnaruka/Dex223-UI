import { create } from "zustand";

interface ConfirmEditOrderDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmEditOrderDialogStore = create<ConfirmEditOrderDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
