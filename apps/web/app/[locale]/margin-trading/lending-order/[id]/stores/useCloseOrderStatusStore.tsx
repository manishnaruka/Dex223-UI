import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum OrderCloseStatus {
  INITIAL,

  PENDING_CLOSE_ORDER,
  LOADING_CLOSE_ORDER,
  ERROR_CLOSE_ORDER,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useCloseOrderStatusStore = createOperationStatusStore({
  initialStatus: OrderCloseStatus.INITIAL,
  operations: ["closeOrder"],
  errorType: SwapError.UNKNOWN,
});
