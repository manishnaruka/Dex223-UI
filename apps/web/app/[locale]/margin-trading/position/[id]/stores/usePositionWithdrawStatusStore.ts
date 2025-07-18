import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum PositionWithdrawStatus {
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

export const useWithdrawPositionStatusStore = createOperationStatusStore({
  initialStatus: PositionWithdrawStatus.INITIAL,
  operations: ["withdraw"],
  errorType: SwapError.UNKNOWN,
});
