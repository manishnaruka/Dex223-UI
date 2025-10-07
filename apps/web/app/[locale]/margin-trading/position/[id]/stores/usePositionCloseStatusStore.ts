import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum PositionCloseStatus {
  INITIAL,

  PENDING_CLOSE,
  LOADING_CLOSE,
  ERROR_CLOSE,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const usePositionCloseStatusStore = createOperationStatusStore({
  initialStatus: PositionCloseStatus.INITIAL,
  operations: ["positionClose"],
  errorType: SwapError.UNKNOWN,
});
