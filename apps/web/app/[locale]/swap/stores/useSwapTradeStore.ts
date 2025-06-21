import { create } from "zustand";

import { TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { Trade } from "@/sdk_bi/entities/trade";

export enum TradeError {
  NO_LIQUIDITY,
  NO_POOLS,
}

export type TokenTrade = Trade<Currency, Currency, TradeType>;

interface SwapTradeStore {
  trade: TokenTrade | null;
  error: TradeError | null;
  loading: boolean;
  setTrade: (trade: TokenTrade | null) => void;
  setError: (error: TradeError | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSwapTradeStore = create<SwapTradeStore>((set, get) => ({
  trade: null,
  error: null,
  loading: false,
  setTrade: (trade) => set({ trade }),
  setError: (error: TradeError | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),
}));
