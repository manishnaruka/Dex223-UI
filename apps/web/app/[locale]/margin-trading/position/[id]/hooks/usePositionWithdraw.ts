import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import {
  PositionWithdrawStatus,
  useWithdrawPositionStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionWithdrawStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";

export default function usePositionWithdraw({
  position,
  amount,
  currency,
}: {
  position: MarginPosition;
  currency: Currency;
  amount: string;
}) {
  const { setStatus } = useWithdrawPositionStatusStore();
  const chainId = useCurrentChainId();
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient();

  const handlePositionWithdraw = useCallback(async () => {
    if (!walletClient || !publicClient) {
      return;
    }

    setStatus(PositionWithdrawStatus.PENDING_WITHDRAW);

    const withdrawPositionHash = await walletClient.writeContract({
      abi: MARGIN_MODULE_ABI,
      address: MARGIN_TRADING_ADDRESS[chainId],
      functionName: "positionWithdraw",
      args: [BigInt(position.id), currency.wrapped.address0],
      account: undefined,
    });
    setStatus(PositionWithdrawStatus.LOADING_WITHDRAW);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: withdrawPositionHash });

    if (receipt.status === "success") {
      setStatus(PositionWithdrawStatus.SUCCESS);
    } else {
      setStatus(PositionWithdrawStatus.ERROR_WITHDRAW);
    }
    console.log(receipt);

    return;
  }, [chainId, currency?.wrapped.address0, position?.id, publicClient, setStatus, walletClient]);

  return { handlePositionWithdraw };
}
