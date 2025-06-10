import { create } from "zustand";

import { FeeAmount } from "@/sdk_bi/constants";

import { Bound } from "../components/PriceRange/LiquidityChartRangeInput/types";
import { ZOOM_LEVELS } from "../hooks/types";
import { FullRange } from "./useAddLiquidityAmountsStore";

type Ticks = {
  [Bound.LOWER]?: number;
  [Bound.UPPER]?: number;
};
interface LiquidityPriceRangeStore {
  leftRangeTypedValue: string | FullRange;
  rightRangeTypedValue: string | FullRange;
  startPriceTypedValue: string;
  ticks: Ticks;
  setLeftRangeTypedValue: (leftRangeTypedValue: string | FullRange) => void;
  setRightRangeTypedValue: (rightRangeTypedValue: string | FullRange) => void;
  setStartPriceTypedValue: (startPriceTypedValue: string) => void;
  resetPriceRangeValue: ({ price, feeAmount }: { price?: number; feeAmount: FeeAmount }) => void;
  setFullRange: () => void;
  isFullRange: () => boolean;
  clearPriceRange: () => void;
  setTicks: (partial: Partial<Ticks>) => void;
}

export const useLiquidityPriceRangeStore = create<LiquidityPriceRangeStore>((set, get) => ({
  leftRangeTypedValue: "",
  rightRangeTypedValue: "",
  startPriceTypedValue: "",
  ticks: {
    [Bound.LOWER]: undefined,
    [Bound.UPPER]: undefined,
  },

  isFullRange: () => {
    const { leftRangeTypedValue, rightRangeTypedValue } = get();
    return typeof leftRangeTypedValue === "boolean" && typeof rightRangeTypedValue === "boolean";
  },
  setLeftRangeTypedValue: (leftRangeTypedValue) => set({ leftRangeTypedValue }),
  setRightRangeTypedValue: (rightRangeTypedValue) => set({ rightRangeTypedValue }),
  setStartPriceTypedValue: (startPriceTypedValue) => set({ startPriceTypedValue }),

  resetPriceRangeValue: ({ price, feeAmount }) => {
    if (price) {
      const zoomLevels = ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM];
      set({
        leftRangeTypedValue: (price * zoomLevels.initialMin).toFixed(10),
        rightRangeTypedValue: (price * zoomLevels.initialMax).toFixed(10),
      });
    } else {
      set({
        leftRangeTypedValue: "",
        rightRangeTypedValue: "",
      });
    }
  },
  setFullRange: () =>
    set({
      leftRangeTypedValue: true,
      rightRangeTypedValue: true,
    }),
  clearPriceRange: () =>
    set({
      leftRangeTypedValue: "",
      rightRangeTypedValue: "",
      ticks: {
        [Bound.LOWER]: undefined,
        [Bound.UPPER]: undefined,
      },
    }),
  setTicks: (partial) =>
    set((state) => ({
      ticks: {
        ...state.ticks,
        ...partial,
      },
    })),
}));
