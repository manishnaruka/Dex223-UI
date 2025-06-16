import { create } from "zustand";

interface ConfirmCreateMarginPositionDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmCreateMarginPositionDialogStore =
  create<ConfirmCreateMarginPositionDialogStore>((set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  }));
