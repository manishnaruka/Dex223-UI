import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

import { MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import {
  PositionWithdrawStatus,
  useWithdrawPositionStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionWithdrawStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";

export default function usePositionClose({ position }: { position: MarginPosition }) {
  const { setStatus } = useWithdrawPositionStatusStore();
  const chainId = useCurrentChainId();
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient();

  const handlePositionClose = useCallback(async () => {
    if (!walletClient || !publicClient) {
      return;
    }

    setStatus(PositionWithdrawStatus.PENDING_WITHDRAW);

    const withdrawPositionHash = await walletClient.writeContract({
      abi: MARGIN_MODULE_ABI,
      address: MARGIN_TRADING_ADDRESS[chainId],
      functionName: "positionClose",
      args: [BigInt(position.id)],
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
  }, [chainId, position?.id, publicClient, setStatus, walletClient]);

  return { handlePositionClose };
}
