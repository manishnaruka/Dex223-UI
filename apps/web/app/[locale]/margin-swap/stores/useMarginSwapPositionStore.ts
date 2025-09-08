import { create } from "zustand";

interface MarginSwapPositionStore {
  marginSwapPositionId: number | undefined;
  setMarginSwapPositionId: (marginSwapPosition: number) => void;
}

export const useMarginSwapPositionStore = create<MarginSwapPositionStore>((set, get) => ({
  marginSwapPositionId: undefined,
  setMarginSwapPositionId: (marginSwapPositionId) => set({ marginSwapPositionId }),
}));
