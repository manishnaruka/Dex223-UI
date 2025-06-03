import Dexie, { Table } from "dexie";
import { Address } from "viem";

import { DexChainId } from "@/sdk_bi/chains";
import { Token } from "@/sdk_bi/entities/token";
import { IRecentTransaction } from "@/stores/useRecentTransactionsStore";

export type TokenListId =
  | number
  | `custom-${DexChainId}`
  | `default-${DexChainId}`
  | `core-autolisting-${DexChainId}`
  | `free-autolisting-${DexChainId}`
  | undefined;

export interface TokenList {
  id?: TokenListId;
  autoListingContract?: Address;
  lastUpdated?: number;
  enabled: boolean;
  chainId: DexChainId;
  list: {
    logoURI: string;
    version: {
      patch: number;
      minor: number;
      major: number;
    };
    name: string;
    tokens: Token[];
  };
}
export interface RecentTransaction {
  key: string;
  value: IRecentTransaction;
}

export interface Erc223Mapping {
  erc20: Address;
  erc223: Address;
}

export class DatabaseDexie extends Dexie {
  // 'tokenLists' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tokenLists!: Table<TokenList>;
  recentTransactions!: Table<RecentTransaction, string>;
  erc223Mapping!: Table<Erc223Mapping, string>;

  constructor() {
    super("DEX223_INDEXED_DB");
    this.version(1).stores({
      tokenLists: "++id, autoListingContract, lastUpdated, enabled, list, chainId", // Primary key and indexed props
      recentTransactions: "&key",
      erc223Mapping: "&erc20,erc223", // & = primary key по erc20
    });
  }
}

export const db = new DatabaseDexie();
