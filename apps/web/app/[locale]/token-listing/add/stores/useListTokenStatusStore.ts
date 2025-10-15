import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum ListTokenStatus {
  INITIAL,

  PENDING_APPROVE,
  LOADING_APPROVE,
  ERROR_APPROVE,

  PENDING_LIST_TOKEN,
  LOADING_LIST_TOKEN,
  ERROR_LIST_TOKEN,

  SUCCESS,
}

export enum ListError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useListTokenStatusStore = createOperationStatusStore({
  initialStatus: ListTokenStatus.INITIAL,
  operations: ["approve", "listToken"],
  errorType: ListError.UNKNOWN,
});
