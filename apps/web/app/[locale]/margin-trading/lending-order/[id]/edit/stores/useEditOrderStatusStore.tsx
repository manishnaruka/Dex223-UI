import { Address } from "viem";
import { create } from "zustand";

import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum EditOrderStatus {
  INITIAL,
  PENDING_MODIFY,
  LOADING_MODIFY,
  ERROR_MODIFY,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useEditOrderStatusStore = createOperationStatusStore({
  initialStatus: EditOrderStatus.INITIAL,
  operations: ["modifyOrder"],
  errorType: SwapError.UNKNOWN,
});
