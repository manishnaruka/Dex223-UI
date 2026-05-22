import { create } from "zustand";

interface SeasonNftDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSeasonNftDialogStore = create<SeasonNftDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
