import { Address } from "viem";
import { create } from "zustand";

export const defaultBorrowMarketFilterValues = {
  leverage: "",
  orderCurrencyLimit: "",
  maxInterestRatePerMonth: "",
  minOrderBalance: "",
  minLoanAmount: "",
  liquidationPriceSource: [],
  maxPositionDuration: "",
  minPositionDuration: "",
};

interface BorrowMarketFilterStore {
  leverage: string;
  orderCurrencyLimit: string;
  maxInterestRatePerMonth: string;

  minPositionDuration: string;
  maxPositionDuration: string;

  minOrderBalance: string;
  minLoanAmount: string;

  liquidationPriceSource: Address[];

  setLeverage: (leverage: string) => void;
  setOrderCurrencyLimit: (orderCurrencyLimit: string) => void;
  setMaxInterestRatePerMonth: (maxInterestRatePerMonth: string) => void;
  setMinPositionDuration: (minPositionDuration: string) => void;
  setMaxPositionDuration: (maxPositionDuration: string) => void;
  setMinOrderBalance: (minOrderBalance: string) => void;
  setMinLoanAmount: (minLoanAmount: string) => void;
  setLiquidationPriceSource: (liquidationPriceSource: Address[]) => void;
}

export const useBorrowMarketFilterStore = create<BorrowMarketFilterStore>((set, get) => ({
  ...defaultBorrowMarketFilterValues,
  setLeverage: (leverage) => set({ leverage }),
  setOrderCurrencyLimit: (orderCurrencyLimit) => set({ orderCurrencyLimit }),
  setMaxInterestRatePerMonth: (maxInterestRatePerMonth) => set({ maxInterestRatePerMonth }),
  setMinOrderBalance: (minOrderBalance) => set({ minOrderBalance }),
  setMinLoanAmount: (minLoanAmount) => set({ minLoanAmount }),
  setMinPositionDuration: (minPositionDuration) => set({ minPositionDuration }),
  setMaxPositionDuration: (maxPositionDuration) => set({ maxPositionDuration }),
  setLiquidationPriceSource: (liquidationPriceSource) => set({ liquidationPriceSource }),
}));
