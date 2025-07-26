import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { useMarginSwapAmountsStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapAmountsStore";
import { useMarginSwapPositionStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapPositionStore";
import { useMarginSwapTokensStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapTokensStore";
import { useMarginTrade } from "@/app/[locale]/swap/hooks/useTrade";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";

export default function useMarginSwap() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { marginSwapPosition } = useMarginSwapPositionStore();
  const { tokenA, tokenB, tokenAStandard } = useMarginSwapTokensStore();
  const { typedValue } = useMarginSwapAmountsStore();
  const { trade } = useMarginTrade();

  const handleMarginSwap = useCallback(async () => {
    if (!walletClient || !marginSwapPosition || !tokenA || !tokenB || !trade || !publicClient) {
      return;
    }
    console.log(marginSwapPosition);

    const positionAssets = await publicClient.readContract({
      abi: MARGIN_MODULE_ABI,
      address: MARGIN_TRADING_ADDRESS[chainId],
      functionName: "getPositionAssets",
      args: [BigInt(marginSwapPosition.id)],
    });

    const args = [
      BigInt(marginSwapPosition.id), // positionId
      BigInt(
        positionAssets.findIndex(
          (_asset) => _asset.toLowerCase() === tokenA.wrapped.address0.toLowerCase(),
        ),
      ), // assetId_1
      BigInt(
        marginSwapPosition.order.allowedTradingAddresses.findIndex(
          (_asset) => _asset.toLowerCase() === tokenA.wrapped.address0.toLowerCase(),
        ),
      ), //whitelistId_1
      BigInt(
        marginSwapPosition.order.allowedTradingAddresses.findIndex(
          (_asset) => _asset.toLowerCase() === tokenB.wrapped.address0.toLowerCase(),
        ), //whitelistId_1
      ),
      parseUnits(typedValue, tokenA.decimals),
      tokenB?.wrapped.address0,
      trade.swaps[0].route.pools[0].fee,
    ];

    console.log(args);

    await walletClient.writeContract({
      abi: MARGIN_MODULE_ABI,
      functionName: "marginSwap",
      address: MARGIN_TRADING_ADDRESS[chainId],
      args: args as any,
    });
  }, [chainId, marginSwapPosition, publicClient, tokenA, tokenB, trade, typedValue, walletClient]);

  return { handleMarginSwap };
}
