import { create } from "zustand";

import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

type MarginPositionValues = {
  borrowAmount: string;
  collateralAmount: string;
  collateralToken: Currency | undefined;
  collateralTokenStandard: Standard;
  leverage: string;
  liquidationFeeStandard: Standard;
};

interface CreateMarginPositionConfig {
  values: MarginPositionValues;

  setValues: (values: MarginPositionValues) => void;
}

export const useCreateMarginPositionConfigStore = create<CreateMarginPositionConfig>(
  (set, get) => ({
    values: {
      borrowAmount: "",
      collateralAmount: "",
      collateralToken: undefined,
      collateralTokenStandard: Standard.ERC20,
      leverage: "1",
      liquidationFeeStandard: Standard.ERC20,
    },

    setValues: (values: MarginPositionValues) => set({ values }),
  }),
);
