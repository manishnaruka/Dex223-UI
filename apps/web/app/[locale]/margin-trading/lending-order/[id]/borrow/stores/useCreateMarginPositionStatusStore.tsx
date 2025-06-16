import { Address } from "viem";
import { create } from "zustand";

// TODO: move to global and rename
export enum CreateMarginPositionStatus {
  INITIAL,
  PENDING_APPROVE_BORROW,
  LOADING_APPROVE_BORROW,
  ERROR_APPROVE_BORROW,

  PENDING_APPROVE_LIQUIDATION_FEE,
  LOADING_APPROVE_LIQUIDATION_FEE,
  ERROR_APPROVE_LIQUIDATION_FEE,

  PENDING_BORROW,
  LOADING_BORROW,
  ERROR_BORROW,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

interface SwapStatusStore {
  status: CreateMarginPositionStatus;
  approveBorrowHash: Address | undefined;
  approveLiquidationFeeHash: Address | undefined;
  borrowHash: Address | undefined;
  errorType: SwapError;

  setStatus: (status: CreateMarginPositionStatus) => void;
  setErrorType: (errorType: SwapError) => void;
  setApproveBorrowHash: (hash: Address) => void;
  setConfirmOrderLiquidationFeeHash: (hash: Address) => void;
  setBorrowHash: (hash: Address) => void;
}

export const useCreateMarginPositionStatusStore = create<SwapStatusStore>((set, get) => ({
  status: CreateMarginPositionStatus.INITIAL,
  approveBorrowHash: undefined,
  approveLiquidationFeeHash: undefined,
  borrowHash: undefined,
  errorType: SwapError.UNKNOWN,

  setStatus: (status) => {
    if (status === CreateMarginPositionStatus.INITIAL) {
      set({
        status,
        approveBorrowHash: undefined,
        approveLiquidationFeeHash: undefined,
        borrowHash: undefined,
      });
    }

    set({ status });
  },
  setErrorType: (errorType) => set({ errorType }),
  setApproveBorrowHash: (hash) => set({ approveBorrowHash: hash }),
  setConfirmOrderLiquidationFeeHash: (hash) => set({ approveLiquidationFeeHash: hash }),
  setBorrowHash: (hash) => set({ borrowHash: hash }),
}));
