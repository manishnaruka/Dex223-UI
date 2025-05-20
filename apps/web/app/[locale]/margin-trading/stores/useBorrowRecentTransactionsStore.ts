import { createRecentTransactionsStore } from "@/stores/factories/createRecentTransactionsStore";

const localStorageKey = "borrow-recent-transactions-state";
export const useBorrowRecentTransactionsStore = createRecentTransactionsStore(localStorageKey);
