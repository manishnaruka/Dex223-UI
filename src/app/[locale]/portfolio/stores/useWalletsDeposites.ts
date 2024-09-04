import { Address } from "viem";
import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

export type WalletDeposite = {
  token: Token;
  contractAddress: Address;
  value: bigint;
};
export type WalletDeposites = {
  address: Address; // wallet address
  deposites: WalletDeposite[];
};
interface WalletsDepositesStore {
  deposites: WalletDeposites[];
  setAllDeposites: (walletsDeposites: WalletDeposites[]) => void;
  setWalletDeposites: (walletBalance: WalletDeposites) => void;
}

export const useWalletsDeposites = create<WalletsDepositesStore>((set, get) => ({
  deposites: [],
  setAllDeposites: (walletsDeposites) =>
    set((state) => ({
      deposites: walletsDeposites,
    })),
  setWalletDeposites: (walletDeposites) =>
    set((state) => ({
      deposites: [
        ...state.deposites.filter((balance) => balance.address !== walletDeposites.address),
        walletDeposites,
      ],
    })),
}));
