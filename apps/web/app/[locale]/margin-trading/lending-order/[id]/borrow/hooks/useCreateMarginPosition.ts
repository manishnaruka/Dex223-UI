import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import { CreateOrderStatus } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import sleep from "@/functions/sleep";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";

export default function useCreateMarginPosition() {
  const { setStatus } = useCreateMarginPositionStatusStore();

  const { values } = useCreateMarginPositionConfigStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    updateAllowance,
  } = useStoreAllowance({
    token: values.collateralToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
  });

  const handleCreateMarginPosition = useCallback(async () => {
    setStatus(CreateMarginPositionStatus.PENDING_APPROVE_BORROW);

    if (!values.collateralToken || !values.collateralAmount || !walletClient || !publicClient) {
      return;
    }

    if (!isAllowedA) {
      const approveResult = await approveA({
        customAmount: parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
        // customGasSettings: gasSettings,
      });

      if (!approveResult?.success) {
        setStatus(CreateMarginPositionStatus.ERROR_APPROVE_BORROW);
        return;
      }

      setStatus(CreateMarginPositionStatus.LOADING_APPROVE_BORROW);

      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveResult.hash,
      });

      if (approveReceipt.status !== "success") {
        setStatus(CreateMarginPositionStatus.ERROR_APPROVE_BORROW);
        return;
      }
    }

    setStatus(CreateMarginPositionStatus.PENDING_BORROW);

    const takeLoanHash = await walletClient.writeContract({
      abi: MARGIN_MODULE_ABI,
      address: MARGIN_TRADING_ADDRESS[chainId],
      functionName: "takeLoan",
      args: [
        BigInt(0),
        parseUnits(values.borrowAmount, 18),
        BigInt(0),
        parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
      ],
      account: undefined,
    });

    setStatus(CreateMarginPositionStatus.LOADING_BORROW);
    await publicClient.waitForTransactionReceipt({ hash: takeLoanHash });
    // await sleep(5000);
    // setStatus(CreateMarginPositionStatus.LOADING_APPROVE_BORROW);
    // await sleep(5000);
    // setStatus(CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE);
    // await sleep(5000);
    // setStatus(CreateMarginPositionStatus.LOADING_APPROVE_LIQUIDATION_FEE);
    // await sleep(6000);
    // setStatus(CreateMarginPositionStatus.PENDING_BORROW);
    // await sleep(5000);
    // setStatus(CreateMarginPositionStatus.LOADING_BORROW);
    // await sleep(5000);
    // setStatus(CreateMarginPositionStatus.ERROR_BORROW);
    // return;
    setStatus(CreateMarginPositionStatus.SUCCESS);
  }, [
    approveA,
    chainId,
    publicClient,
    setStatus,
    values.borrowAmount,
    values.collateralAmount,
    values.collateralToken,
    walletClient,
  ]);

  return { handleCreateMarginPosition };
}
