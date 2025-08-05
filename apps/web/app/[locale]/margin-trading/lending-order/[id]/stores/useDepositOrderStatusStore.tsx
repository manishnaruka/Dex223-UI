import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum OrderDepositStatus {
  INITIAL,

  PENDING_APPROVE,
  LOADING_APPROVE,
  ERROR_APPROVE,

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

export const useDepositOrderStatusStore = createOperationStatusStore({
  initialStatus: OrderDepositStatus.INITIAL,
  operations: ["approve", "transfer", "deposit"],
  errorType: SwapError.UNKNOWN,
});
