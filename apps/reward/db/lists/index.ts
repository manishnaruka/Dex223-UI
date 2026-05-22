import { bscTestnetDefaultList } from "@/db/lists/bsc-testnet-default-list";
import { eosDefaultList } from "@/db/lists/eos-default-list";
import { ethereumDefaultList } from "@/db/lists/ethereum-default-list";
import { mainnetDefaultList } from "@/db/lists/mainnet-default-list";
import { sepoliaDefaultList } from "@/db/lists/sepolia-default-list";
import { DexChainId } from "@/sdk_bi/chains";

export const defaultLists: Record<DexChainId, any> = {
  [DexChainId.MAINNET]: ethereumDefaultList,
  [DexChainId.SEPOLIA]: sepoliaDefaultList,
  // [DexChainId.CALLISTO]: callistoDefaultList,
  [DexChainId.BSC_TESTNET]: bscTestnetDefaultList,
  [DexChainId.EOS]: eosDefaultList,
};
