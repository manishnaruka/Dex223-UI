import { Address } from "viem";
import { create } from "zustand";

import { OrderDepositStatus } from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum OrderWithdrawStatus {
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

export const useWithdrawOrderStatusStore = createOperationStatusStore({
  initialStatus: OrderWithdrawStatus.INITIAL,
  operations: ["withdraw"],
  errorType: SwapError.UNKNOWN,
});
