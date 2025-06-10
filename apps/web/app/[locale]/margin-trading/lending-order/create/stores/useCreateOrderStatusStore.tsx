import { Address } from "viem";
import { create } from "zustand";

// TODO: move to global and rename
export enum CreateOrderStatus {
  INITIAL,
  PENDING_APPROVE,
  LOADING_APPROVE,
  ERROR_APPROVE,

  PENDING_CONFIRM_ORDER,
  LOADING_CONFIRM_ORDER,
  ERROR_CONFIRM_ORDER,

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
  status: CreateOrderStatus;
  approveHash: Address | undefined;
  confirmOrderHash: Address | undefined;
  depositHash: Address | undefined;
  errorType: SwapError;

  setStatus: (status: CreateOrderStatus) => void;
  setErrorType: (errorType: SwapError) => void;
  setApproveHash: (hash: Address) => void;
  setConfirmOrderHash: (hash: Address) => void;
  setDepositHash: (hash: Address) => void;
}

export const useCreateOrderStatusStore = create<SwapStatusStore>((set, get) => ({
  status: CreateOrderStatus.INITIAL,
  approveHash: undefined,
  confirmOrderHash: undefined,
  depositHash: undefined,
  errorType: SwapError.UNKNOWN,

  setStatus: (status) => {
    if (status === CreateOrderStatus.INITIAL) {
      set({ status, confirmOrderHash: undefined, approveHash: undefined, depositHash: undefined });
    }

    set({ status });
  },
  setErrorType: (errorType) => set({ errorType }),
  setConfirmOrderHash: (hash) => set({ confirmOrderHash: hash }),
  setDepositHash: (hash) => set({ depositHash: hash }),
  setApproveHash: (hash) => set({ approveHash: hash }),
}));
