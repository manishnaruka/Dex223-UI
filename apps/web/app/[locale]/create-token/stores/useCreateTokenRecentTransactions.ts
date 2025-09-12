import { createRecentTransactionsStore } from "@/stores/factories/createRecentTransactionsStore";

const localStorageKey = "ct-recent-transactions-state";
export const useCreateTokenRecentTransactionsStore = createRecentTransactionsStore(localStorageKey);
