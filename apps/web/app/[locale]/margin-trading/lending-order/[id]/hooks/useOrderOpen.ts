import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  OpenOrderStatus,
  useOpenOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useOpenOrderStatusStore";
import { SwapError } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";

export default function useOrderOpen() {
  const { setOpenOrderHash, setStatus, setErrorType } = useOpenOrderStatusStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleOrderOpen = useCallback(
    async (orderId: number) => {
      if (!walletClient || !publicClient) {
        return;
      }

      setStatus(OpenOrderStatus.PENDING_OPEN_ORDER);

      const hash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[DexChainId.SEPOLIA],
        functionName: "setOrderStatus",
        args: [BigInt(orderId), true],
      });

      setOpenOrderHash(hash);

      setStatus(OpenOrderStatus.LOADING_OPEN_ORDER);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        setStatus(OpenOrderStatus.SUCCESS);
      }

      if (receipt.status === "reverted") {
        setErrorType(SwapError.UNKNOWN);
      }
    },
    [walletClient, publicClient, setStatus, setOpenOrderHash, setErrorType],
  );

  return { handleOrderOpen };
}
