import { create } from "zustand";

interface AllowedTokenListsDialogOpenedStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAllowedTokenListsDialogOpenedStore = create<AllowedTokenListsDialogOpenedStore>(
  (set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }),
);
