import { Address, isAddress } from "viem";
import { useReadContract } from "wagmi";

import { ERC20_ABI } from "@/config/abis/erc20";
import useCurrentChainId from "@/hooks/useCurrentChainId";

export default function useTokenFromNode(address: Address | undefined) {
  const chainId = useCurrentChainId();

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: address! as Address,
    chainId,
    query: {
      enabled: !!address && isAddress(address),
    },
  });

  const { data: tokenDecimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: address! as Address,
    chainId,
    query: {
      enabled: !!address && isAddress(address),
    },
  });

  return { tokenSymbol, tokenDecimals };
}
