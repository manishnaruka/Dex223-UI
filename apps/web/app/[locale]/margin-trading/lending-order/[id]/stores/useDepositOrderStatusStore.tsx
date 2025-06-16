import { Address } from "viem";
import { create } from "zustand";

export enum OrderDepositStatus {
  INITIAL,

  PENDING_APPROVE,
  LOADING_APPROVE,
  ERROR_APPROVE,

  PENDING_DEPOSIT,
  LOADING_DEPOSIT,
  ERROR_DEPOSIT,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

interface SwapStatusStore {
  status: OrderDepositStatus;
  approveHash: Address | undefined;
  depositHash: Address | undefined;
  errorType: SwapError;

  setStatus: (status: OrderDepositStatus) => void;
  setErrorType: (errorType: SwapError) => void;
  setApproveHash: (hash: Address) => void;
  setDepositHash: (hash: Address) => void;
}

export const useDepositOrderStatusStore = create<SwapStatusStore>((set, get) => ({
  status: OrderDepositStatus.INITIAL,
  approveHash: undefined,
  depositHash: undefined,
  errorType: SwapError.UNKNOWN,

  setStatus: (status) => {
    if (status === OrderDepositStatus.INITIAL) {
      set({ status, approveHash: undefined, depositHash: undefined });
    }

    set({ status });
  },
  setErrorType: (errorType) => set({ errorType }),
  setDepositHash: (hash) => set({ depositHash: hash }),
  setApproveHash: (hash) => set({ approveHash: hash }),
}));
