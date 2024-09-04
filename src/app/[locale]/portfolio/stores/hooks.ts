import { useMemo } from "react";

import { usePortfolioStore } from "./usePortfolioStore";

export const useActiveAddresses = () => {
  const { wallets } = usePortfolioStore();

  const activeAddresses = useMemo(() => {
    return wallets.filter((ad) => ad.isActive).map((ad) => ad.address);
  }, [wallets]);

  return {
    activeAddresses,
  };
};
