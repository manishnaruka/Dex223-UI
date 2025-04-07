import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
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

export const useActiveAddresses = ({
  searchValue,
  setSearchValue,
}: {
  searchValue: string;
  setSearchValue: (value: string) => void;
}) => {
  const { setShowFromSearch } = usePortfolioStore();
  const { wallets } = usePortfolioWallets();
  const t = useTranslations("Portfolio");

  const errorSearch = useMemo(() => {
    return Boolean(searchValue) && !isAddress(searchValue) ? t("enter_in_correct_format") : "";
  }, [searchValue, t]);

  const [activeAddresses, setActiveAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (searchValue && !errorSearch) {
      // Update `setShowFromSearch` based on `searchValue`
      if (setShowFromSearch) setShowFromSearch(true);
      setActiveAddresses([searchValue as Address]);
    } else {
      // Update `setShowFromSearch` based on no search
      if (setShowFromSearch) setShowFromSearch(false);
      const activeWallets = wallets.filter((ad) => ad.isActive).map((ad) => ad.address);
      setActiveAddresses(activeWallets);
    }
  }, [searchValue, errorSearch, wallets, setShowFromSearch]);

  const memoizedActiveAddresses = useMemo(() => activeAddresses, [activeAddresses]);

  return {
    activeAddresses: memoizedActiveAddresses,
    searchValue,
    setSearchValue,
    errorSearch,
  };
};
