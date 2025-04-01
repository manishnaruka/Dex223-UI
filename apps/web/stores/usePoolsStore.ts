import { Address } from "viem";
import { create } from "zustand";

import { Pool } from "@/sdk_bi/entities/pool";

interface PoolsStore {
  pools: {
    [key: string]: Pool;
  };
  addPool: (key: string, pool: Pool) => void;
  getPool: (key: string) => Pool | undefined;
  poolUpdates: Map<string, Date>;
}

export const usePoolsStore = create<PoolsStore>((set, get) => ({
  pools: {},
  addPool: (key, pool) =>
    set(() => {
      const newPoolUpdates = new Map(get().poolUpdates);
      newPoolUpdates.set(key, new Date());
      return { poolUpdates: newPoolUpdates, pools: { ...get().pools, [key]: pool } };
    }),
  getPool: (key) => get().pools[key],
  poolUpdates: new Map(),
}));

type PoolAddress = {
  isLoading: boolean;
  address?: Address;
};
export type PoolAddresses = {
  [key: string]: PoolAddress;
};
interface PoolAddressesStore {
  addresses: PoolAddresses;
  addPoolAddress: (key: string, address: PoolAddress) => void;
}

export const usePoolAddresses = create<PoolAddressesStore>((set, get) => ({
  addresses: {},
  addPoolAddress: (key, address) => set({ addresses: { ...get().addresses, [key]: address } }),
}));
