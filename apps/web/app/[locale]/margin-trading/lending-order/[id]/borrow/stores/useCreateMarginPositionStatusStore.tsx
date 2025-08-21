import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum CreateMarginPositionStatus {
  INITIAL,
  PENDING_APPROVE_BORROW,
  LOADING_APPROVE_BORROW,
  ERROR_APPROVE_BORROW,

  PENDING_TRANSFER,
  LOADING_TRANSFER,
  ERROR_TRANSFER,

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

export const useCreateMarginPositionStatusStore = createOperationStatusStore({
  initialStatus: CreateMarginPositionStatus.INITIAL,
  operations: ["approveBorrow", "approveLiquidationFee", "transfer", "borrow"],
  errorType: SwapError.UNKNOWN,
});
