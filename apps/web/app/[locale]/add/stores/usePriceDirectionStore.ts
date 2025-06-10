import { create } from "zustand";

type PriceDirectionStore = {
  invertPrice: boolean;
  setInvertPrice: (invert: boolean) => void;
  toggleInvertPrice: () => void;
};

export const usePriceDirectionStore = create<PriceDirectionStore>((set) => ({
  invertPrice: false,
  setInvertPrice: (invert) => set({ invertPrice: invert }),
  toggleInvertPrice: () => set((state) => ({ invertPrice: !state.invertPrice })),
}));
