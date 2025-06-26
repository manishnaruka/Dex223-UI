import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
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
import { DexChainId } from "@/sdk_bi/chains";
import { Token } from "@/sdk_bi/entities/token";

export default function useCreateMarginPosition(order: LendingOrder) {
  const { setStatus } = useCreateMarginPositionStatusStore();

  const { values } = useCreateMarginPositionConfigStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();

  const { isAllowed: isAllowedA, writeTokenApprove: approveA } = useStoreAllowance({
    token: values.collateralToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: parseUnits(
      values.collateralAmount.toString(),
      values.collateralToken?.decimals ?? 18,
    ),
  });

  const { isAllowed: isAllowedB, writeTokenApprove: approveB } = useStoreAllowance({
    token: order.liquidationRewardAsset,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: order.liquidationRewardAmount,
  });

  const { isAllowed: isAllowedBoth, writeTokenApprove: approveBoth } = useStoreAllowance({
    token: values.collateralToken?.equals(order.liquidationRewardAsset)
      ? values.collateralToken
      : undefined,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck:
      order.liquidationRewardAmount +
      parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18),
  });

  const handleCreateMarginPosition = useCallback(
    async (orderId: string) => {
      if (!values.collateralAmount || !walletClient || !publicClient) {
        return;
      }

      if (!isAllowedA && !values.collateralToken?.equals(order.liquidationRewardAsset)) {
        setStatus(CreateMarginPositionStatus.PENDING_APPROVE_BORROW);

        const approveResult = await approveA({
          // customAmount: parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
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

      if (!isAllowedB && !values.collateralToken?.equals(order.liquidationRewardAsset)) {
        setStatus(CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE);

        const approveResult = await approveB({
          // customAmount: parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
          // customGasSettings: gasSettings,
        });

        if (!approveResult?.success) {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE);
          return;
        }

        setStatus(CreateMarginPositionStatus.LOADING_APPROVE_LIQUIDATION_FEE);

        const approveReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveResult.hash,
        });

        if (approveReceipt.status !== "success") {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE);
          return;
        }
      }

      if (!isAllowedBoth) {
        setStatus(CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE);

        const approveResult = await approveBoth({
          // customAmount: parseUnits(values.collateralAmount, values.collateralToken?.decimals ?? 18),
          // customGasSettings: gasSettings,
        });

        if (!approveResult?.success) {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE);
          return;
        }

        setStatus(CreateMarginPositionStatus.LOADING_APPROVE_LIQUIDATION_FEE);

        const approveReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveResult.hash,
        });

        if (approveReceipt.status !== "success") {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE);
          return;
        }
      }

      setStatus(CreateMarginPositionStatus.PENDING_BORROW);

      console.log(values);
      const takeLoanHash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[chainId],
        functionName: "takeLoan",
        args: [
          BigInt(orderId),
          parseUnits(values.borrowAmount.toString(), 18),
          BigInt(values.collateralAssetId),
          parseUnits(values.collateralAmount.toString(), 18),
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
    },
    [
      approveA,
      approveB,
      approveBoth,
      chainId,
      isAllowedA,
      isAllowedB,
      isAllowedBoth,
      order.liquidationRewardAsset,
      publicClient,
      setStatus,
      values,
      walletClient,
    ],
  );

  return { handleCreateMarginPosition };
}
