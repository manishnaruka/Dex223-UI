import { Address } from "viem";
import { create } from "zustand";

import {
  LendingOrderPeriod,
  LendingOrderPeriodType,
  PerpetualPeriodType,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

type FirstStepValues = {
  interestRatePerMonth: string;
  period: LendingOrderPeriod;
  loanToken: Currency | undefined;
  loanAmount: string;
  loanTokenStandard: Standard;
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
    interestRatePerMonth: "",
    period: {
      type: LendingOrderPeriodType.FIXED, // or PERPETUAL
      lendingOrderDeadline: "", // string or Date
      positionDuration: "",
      borrowingPeriod: {
        type: PerpetualPeriodType.DAYS, // or SECONDS
        borrowingPeriodInDays: "",
        borrowingPeriodInSeconds: "",
      },
    },
    loanToken: undefined,
    loanAmount: "",
    loanTokenStandard: Standard.ERC20,
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
