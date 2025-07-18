import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum OpenOrderStatus {
  INITIAL,

  PENDING_OPEN_ORDER,
  LOADING_OPEN_ORDER,
  ERROR_OPEN_ORDER,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useOpenOrderStatusStore = createOperationStatusStore({
  initialStatus: OpenOrderStatus.INITIAL,
  operations: ["openOrder"],
  errorType: SwapError.UNKNOWN,
});
