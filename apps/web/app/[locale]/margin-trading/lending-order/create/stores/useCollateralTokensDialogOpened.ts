import { create } from "zustand";

interface CollateralTokensDialogOpenedStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCollateralTokensDialogOpenedStore = create<CollateralTokensDialogOpenedStore>(
  (set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }),
);
