import { Address } from "viem";

import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

// TODO: move to global and rename
export enum CreateOrderStatus {
  INITIAL,
  PENDING_APPROVE,
  LOADING_APPROVE,
  ERROR_APPROVE,

  PENDING_CONFIRM_ORDER,
  LOADING_CONFIRM_ORDER,
  ERROR_CONFIRM_ORDER,

  PENDING_TRANSFER,
  LOADING_TRANSFER,
  ERROR_TRANSFER,

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

export const useCreateOrderStatusStore = createOperationStatusStore({
  initialStatus: CreateOrderStatus.INITIAL,
  operations: ["createOrder", "approve", "transfer", "deposit"],
  errorType: SwapError.UNKNOWN,
});
