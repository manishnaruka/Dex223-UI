import { create } from "zustand";

interface ConfirmConvertDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmConvertDialogStore = create<ConfirmConvertDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
