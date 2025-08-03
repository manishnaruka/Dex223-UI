import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum MarginSwapStatus {
  INITIAL,

  PENDING_SWAP,
  LOADING_SWAP,
  ERROR_SWAP,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useMarginSwapStatusStore = createOperationStatusStore({
  initialStatus: MarginSwapStatus.INITIAL,
  operations: ["marginSwap"],
  errorType: SwapError.UNKNOWN,
});
