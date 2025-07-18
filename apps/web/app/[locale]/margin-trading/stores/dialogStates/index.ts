import { createDialogStateStore } from "@/stores/factories/createDialogStateStore";

export const useConfirmMarginSwapDialogStore = createDialogStateStore();
export const useConfirmBorrowPositionDialogStore = createDialogStateStore();

export const useAllowedTokenListsDialogOpenedStore = createDialogStateStore();
export const useAllowedTokensDialogOpenedStore = createDialogStateStore();
export const useCollateralTokensDialogOpenedStore = createDialogStateStore();
export const useConfirmCreateOrderDialogStore = createDialogStateStore();

export const useConfirmEditOrderDialogStore = createDialogStateStore();
