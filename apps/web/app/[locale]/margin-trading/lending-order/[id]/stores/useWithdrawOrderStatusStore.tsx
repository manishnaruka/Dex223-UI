import { Address } from "viem";
import { create } from "zustand";

export enum OrderWithdrawStatus {
  INITIAL,

  PENDING_WITHDRAW,
  LOADING_WITHDRAW,
  ERROR_WITHDRAW,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

interface WithdrawStatusStore {
  status: OrderWithdrawStatus;
  withdrawHash: Address | undefined;
  errorType: SwapError;

  setStatus: (status: OrderWithdrawStatus) => void;
  setErrorType: (errorType: SwapError) => void;
  setWithdrawHash: (hash: Address) => void;
}

export const useWithdrawOrderStatusStore = create<WithdrawStatusStore>((set, get) => ({
  status: OrderWithdrawStatus.INITIAL,
  withdrawHash: undefined,
  errorType: SwapError.UNKNOWN,

  setStatus: (status) => {
    if (status === OrderWithdrawStatus.INITIAL) {
      set({ status, withdrawHash: undefined });
    }

    set({ status });
  },
  setErrorType: (errorType) => set({ errorType }),
  setWithdrawHash: (hash) => set({ withdrawHash: hash }),
}));
