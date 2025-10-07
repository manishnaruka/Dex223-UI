import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum PositionDepositStatus {
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

export const useDepositPositionStatusStore = createOperationStatusStore({
  initialStatus: PositionDepositStatus.INITIAL,
  operations: ["approve", "transfer", "deposit"],
  errorType: SwapError.UNKNOWN,
});
