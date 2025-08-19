import { createRecentTransactionsStore } from "@/stores/factories/createRecentTransactionsStore";

const localStorageKey = "lending-order-recent-transactions-state";

export const useLendingOrderRecentTransactionsStore =
  createRecentTransactionsStore(localStorageKey);
