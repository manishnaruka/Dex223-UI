import uniqby from "lodash.uniqby";
import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioStore {
  wallets: {
    address: Address;
    isActive: boolean;
  }[];
  addWallet: (address: Address) => void;
  removeWallet: (address: Address) => void;
  setIsWalletActive: (address: Address, isActive: boolean) => void;
  setAllWalletActive: () => void;
}

const localStorageKey = "portfolio-state";

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      addWallet: (address) =>
        set((state) => ({
          wallets: uniqby([...state.wallets, { address, isActive: true }], "address"),
        })),
      removeWallet: (address) =>
        set((state) => ({ wallets: state.wallets.filter((wallet) => wallet.address !== address) })),
      setIsWalletActive: (address, isActive) =>
        set((state) => ({
          wallets: uniqby(
            state.wallets.map((wallet) => {
              if (wallet.address === address) {
                return {
                  ...wallet,
                  isActive,
                };
              } else {
                return wallet;
              }
            }),
            "address",
          ),
        })),
      setAllWalletActive: () =>
        set((state) => {
          return {
            wallets: uniqby(
              state.wallets.map((wallet) => {
                return {
                  ...wallet,
                  isActive: true,
                };
              }),
              "address",
            ),
          };
        }),
    }),
    {
      name: localStorageKey, // name of the item in the storage (must be unique)
    },
  ),
);
