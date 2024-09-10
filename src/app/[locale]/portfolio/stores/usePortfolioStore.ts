import uniqby from "lodash.uniqby";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioStore {
  wallets: {
    address: Address;
    isActive: boolean;
    isConnectedWallet?: boolean;
  }[];
  addWallet: (address: Address) => void;
  removeWallet: (address: Address) => void;
  setIsWalletActive: (address: Address, isActive: boolean) => void;
  setAllWalletActive: () => void;
  isConnectedWalletActive: boolean;
  setIsConnectedWalletActive: (isActive: boolean) => void;
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
            isConnectedWalletActive: true,
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
      isConnectedWalletActive: true,
      setIsConnectedWalletActive: (isActive) =>
        set(() => ({
          isConnectedWalletActive: isActive,
        })),
    }),
    {
      name: localStorageKey, // name of the item in the storage (must be unique)
    },
  ),
);

export enum ActiveTab {
  balances = "balances",
  margin = "margin",
  lending = "lending",
  liquidity = "liquidity",
  deposited = "deposited",
}

interface PortfolioActiveTabStore {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const usePortfolioActiveTabStore = create<PortfolioActiveTabStore>((set, get) => ({
  activeTab: ActiveTab.balances,
  setActiveTab: (tab) =>
    set(() => ({
      activeTab: tab,
    })),
}));
