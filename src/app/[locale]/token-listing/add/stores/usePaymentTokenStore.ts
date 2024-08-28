import { create } from "zustand";

import { Address } from "viem";

export type PaymentMethod = { token: Address; price: bigint };

interface ListTokensStore {
  paymentToken: PaymentMethod | undefined;
  setPaymentToken: (token: PaymentMethod | undefined) => void;
  reset: () => void;
}

export const usePaymentTokenStore = create<ListTokensStore>((set, get) => ({
  paymentToken: undefined,
  setPaymentToken: (paymentToken) => set({ paymentToken }),

  reset: () =>
    set({
      paymentToken: undefined,
    }),
}));
