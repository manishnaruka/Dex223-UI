import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  OrderWithdrawStatus,
  useWithdrawOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useWithdrawOrderStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";

export default function useOrderWithdraw({
  orderId,
  currency,
  amountToWithdraw,
}: {
  orderId: number;
  currency: Currency;
  amountToWithdraw: string;
}) {
  const { setStatus, setWithdrawHash } = useWithdrawOrderStatusStore();
  const chainId = useCurrentChainId();
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient();

  const handleOrderWithdraw = useCallback(async () => {
    if (!walletClient || !publicClient) {
      return;
    }

    setStatus(OrderWithdrawStatus.PENDING_WITHDRAW);

    const withdrawHash = await walletClient.writeContract({
      abi: MARGIN_MODULE_ABI,
      address: MARGIN_TRADING_ADDRESS[chainId],
      functionName: "orderWithdraw",
      args: [BigInt(orderId), parseUnits(amountToWithdraw, currency.decimals ?? 18)],
      account: undefined,
    });
    setStatus(OrderWithdrawStatus.LOADING_WITHDRAW);

    setWithdrawHash(withdrawHash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

    if (receipt.status === "success") {
      setStatus(OrderWithdrawStatus.SUCCESS);
    } else {
      setStatus(OrderWithdrawStatus.ERROR_WITHDRAW);
    }

    return;
  }, [
    amountToWithdraw,
    chainId,
    currency.decimals,
    orderId,
    publicClient,
    setStatus,
    setWithdrawHash,
    walletClient,
  ]);

  return { handleOrderWithdraw };
}
