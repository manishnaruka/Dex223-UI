import { Address } from "viem";
import { create } from "zustand";

type FirstStepValues = {
  interestRatePerMonth: number;
};

type SecondStepValues = {
  minimumBorrowingAmount: number;
  leverage: number;
};

type ThirdStepValues =
  | {
      liquidationMode: "anyone";
      whitelistedLiquidators?: never;
    }
  | { liquidationMode: "whitelist"; whitelistedLiquidators: Address[] };

interface CreateOrderConfig {
  firstStepValues: FirstStepValues;
  secondStepValues: SecondStepValues;
  thirdStepValues: ThirdStepValues;

  setFirstStepValues: (firstStep: FirstStepValues) => void;
  setSecondStepValues: (secondStep: SecondStepValues) => void;
  setThirdStepValues: (thirdStep: ThirdStepValues) => void;
}

export const useCreateOrderConfigStore = create<CreateOrderConfig>((set, get) => ({
  firstStepValues: {
    interestRatePerMonth: 0,
  },
  secondStepValues: {
    leverage: 5,
    minimumBorrowingAmount: 0,
  },
  thirdStepValues: {
    liquidationMode: "anyone",
  },

  setFirstStepValues: (firstStepValues: FirstStepValues) => set({ firstStepValues }),
  setSecondStepValues: (secondStepValues: SecondStepValues) => set({ secondStepValues }),
  setThirdStepValues: (thirdStepValues: ThirdStepValues) => set({ thirdStepValues }),
}));
