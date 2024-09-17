import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

import { usePortfolioStore } from "./usePortfolioStore";

export const usePortfolioWallets = () => {
  const { address: connectedWalletAddress } = useAccount();
  const {
    wallets: walletsStore,
    isConnectedWalletActive,
    setIsWalletActive: setIsWalletActiveStore,
    setIsConnectedWalletActive,
  } = usePortfolioStore();

  const setIsWalletActive = useCallback(
    (address: Address, isActive: boolean) => {
      if (address === connectedWalletAddress) {
        setIsConnectedWalletActive(isActive);
      } else {
        setIsWalletActiveStore(address, isActive);
      }
    },
    [connectedWalletAddress, setIsConnectedWalletActive, setIsWalletActiveStore],
  );
  const wallets = useMemo(() => {
    return connectedWalletAddress
      ? [
          {
            address: connectedWalletAddress,
            isActive: isConnectedWalletActive,
            isConnectedWallet: true,
          },
          ...walletsStore.filter(({ address }) => address !== connectedWalletAddress),
        ]
      : walletsStore;
  }, [connectedWalletAddress, walletsStore, isConnectedWalletActive]);

  return {
    setIsWalletActive,
    wallets,
  };
};

export const useActiveAddresses = () => {
  const { wallets } = usePortfolioWallets();

  const activeAddresses = useMemo(() => {
    return wallets.filter((ad) => ad.isActive).map((ad) => ad.address);
  }, [wallets]);

  return {
    activeAddresses,
  };
};
