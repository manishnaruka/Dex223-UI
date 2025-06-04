import { create } from "zustand";

import { Currency } from "@/sdk_bi/entities/currency";

interface AddLiquidityTokensStore {
  tokenA: Currency | undefined;
  tokenB: Currency | undefined;
  setTokenA: (token: Currency | undefined) => void;
  setTokenB: (token: Currency | undefined) => void;
  setBothTokens: ({
    tokenA,
    tokenB,
  }: {
    tokenA: Currency | undefined;
    tokenB: Currency | undefined;
  }) => void;
}

export const useAddLiquidityTokensStore = create<AddLiquidityTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (token) =>
    set({
      tokenA: token,
    }),
  setTokenB: (token) =>
    set({
      tokenB: token,
    }),
  setBothTokens: ({ tokenA, tokenB }) =>
    set(() => {
      return {
        tokenA,
        tokenB,
      };
    }),
}));
