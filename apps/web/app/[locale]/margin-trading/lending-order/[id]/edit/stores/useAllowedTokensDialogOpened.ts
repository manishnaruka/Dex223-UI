import { create } from "zustand";

interface AllowedTokensDialogOpenedStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAllowedTokensDialogOpenedStore = create<AllowedTokensDialogOpenedStore>(
  (set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }),
);
