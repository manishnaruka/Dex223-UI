import { create } from "zustand";

import { MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";

interface MarginSwapPositionStore {
  marginSwapPosition: MarginPosition | undefined;
  setMarginSwapPosition: (marginSwapPosition: MarginPosition) => void;
}

export const useMarginSwapPositionStore = create<MarginSwapPositionStore>((set, get) => ({
  marginSwapPosition: undefined,
  setMarginSwapPosition: (marginSwapPosition: MarginPosition) => set({ marginSwapPosition }),
}));
