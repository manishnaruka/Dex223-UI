import { useReadContract } from "wagmi";

import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";

export default function useOrderByIdFromNode(id: number) {
  const chainId = useCurrentChainId();

  const { data } = useReadContract({
    address: MARGIN_TRADING_ADDRESS[chainId],
    abi: MARGIN_MODULE_ABI,
    functionName: "orders",
    args: [BigInt(id)],
  });

  return data;
}
