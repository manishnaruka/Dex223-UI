import { create } from "zustand";

interface WalletDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useMarginSwapSettingsDialogStore = create<WalletDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
