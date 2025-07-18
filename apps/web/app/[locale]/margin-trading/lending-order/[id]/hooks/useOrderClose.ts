import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  OrderCloseStatus,
  useCloseOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useCloseOrderStatusStore";
import { SwapError } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";

export default function useOrderClose() {
  const { setCloseOrderHash, setStatus, setErrorType } = useCloseOrderStatusStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleOrderClose = useCallback(
    async (orderId: number) => {
      if (!walletClient || !publicClient) {
        return;
      }

      setStatus(OrderCloseStatus.PENDING_CLOSE_ORDER);

      const hash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[DexChainId.SEPOLIA],
        functionName: "setOrderStatus",
        args: [BigInt(orderId), false],
      });

      setCloseOrderHash(hash);

      setStatus(OrderCloseStatus.LOADING_CLOSE_ORDER);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        setStatus(OrderCloseStatus.SUCCESS);
      }

      if (receipt.status === "reverted") {
        setErrorType(SwapError.UNKNOWN);
      }
    },
    [publicClient, setCloseOrderHash, setErrorType, setStatus, walletClient],
  );

  return { handleOrderClose };
}
