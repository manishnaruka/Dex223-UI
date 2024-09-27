import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Address, isAddress } from "viem";
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
  const { searchValue, setSearchValue } = usePortfolioStore();
  const { wallets } = usePortfolioWallets();
  const t = useTranslations("Portfolio");

  const errorSearch = useMemo(() => {
    return Boolean(searchValue) && !isAddress(searchValue) ? t("enter_in_correct_format") : "";
  }, [searchValue, t]);

  const activeAddresses = useMemo(() => {
    if (searchValue && !errorSearch) {
      return [searchValue as Address];
    } else {
      return wallets.filter((ad) => ad.isActive).map((ad) => ad.address);
    }
  }, [wallets, errorSearch, searchValue]);

  return {
    activeAddresses,
    searchValue,
    setSearchValue,
    errorSearch,
  };
};
