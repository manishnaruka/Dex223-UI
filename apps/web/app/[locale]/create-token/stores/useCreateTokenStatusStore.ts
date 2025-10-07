import { createOperationStatusStore } from "@/stores/factories/createOperationStatusStore";

export enum CreateTokenStatus {
  INITIAL,

  PENDING_CREATE_TOKEN,
  LOADING_CREATE_TOKEN,
  ERROR_CREATE_TOKEN,

  PENDING_CREATE_WRAPPER,
  LOADING_CREATE_WRAPPER,
  ERROR_CREATE_WRAPPER,

  SUCCESS,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

export const useCreateTokenStatusStore = createOperationStatusStore({
  initialStatus: CreateTokenStatus.INITIAL,
  operations: ["createToken", "createWrapper"],
  errorType: SwapError.UNKNOWN,
});
