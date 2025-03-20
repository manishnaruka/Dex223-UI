import { DexChainId } from "@/sdk_hybrid/chains";

export const networks: Array<{
  chainId: DexChainId;
  name: string;
  symbol: string;
  logo: string;
}> = [
  {
    chainId: DexChainId.MAINNET,
    name: "Ethereum",
    symbol: "ETH",
    logo: "/images/chains/ethereum.svg",
  },
  {
    chainId: DexChainId.SEPOLIA,
    name: "Sepolia",
    symbol: "SEP",
    logo: "/images/chains/sepolia.svg",
  },
  {
    chainId: DexChainId.BSC_TESTNET,
    name: "BSC Testnet",
    symbol: "tBNB",
    logo: "/images/chains/bsc.svg",
  },
  {
    chainId: DexChainId.EOS,
    name: "EOS EVM Network",
    symbol: "EOS",
    logo: "/images/chains/eos.svg",
  },
];
