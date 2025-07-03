import { useCallback, useMemo } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import { OperationStepStatus } from "@/components/common/OperationStepRow";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { IconName } from "@/config/types/IconName";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: CreateMarginPositionStatus;
  loading: CreateMarginPositionStatus;
  error: CreateMarginPositionStatus;
};

type ApproveStepConfig = OperationStepConfig & {
  amount: bigint;
  token: Currency;
};

function getApproveTextMap(tokenSymbol: string): Record<OperationStepStatus, string> {
  return {
    [OperationStepStatus.IDLE]: `Approve ${tokenSymbol}`,
    [OperationStepStatus.AWAITING_SIGNATURE]: `Approve ${tokenSymbol}`,
    [OperationStepStatus.LOADING]: `Approving ${tokenSymbol}`,
    [OperationStepStatus.STEP_COMPLETED]: `Approved ${tokenSymbol}`,
    [OperationStepStatus.STEP_FAILED]: `Approve ${tokenSymbol} failed`,
    [OperationStepStatus.OPERATION_COMPLETED]: `Approved ${tokenSymbol}`,
  };
}

export function useCreatePositionApproveSteps(order: LendingOrder): {
  approveSteps: ApproveStepConfig[];
  allSteps: (OperationStepConfig | ApproveStepConfig)[];
} {
  const { values } = useCreateMarginPositionConfigStore();

  const approveSteps: ApproveStepConfig[] = useMemo(() => {
    if (!values.collateralToken) {
      return [];
    }

    if (order.liquidationRewardAsset.equals(values.collateralToken)) {
      return [
        {
          iconName: "done" as IconName,
          pending: CreateMarginPositionStatus.PENDING_APPROVE_BORROW,
          loading: CreateMarginPositionStatus.LOADING_APPROVE_BORROW,
          error: CreateMarginPositionStatus.ERROR_APPROVE_BORROW,
          textMap: getApproveTextMap(order.liquidationRewardAsset.symbol!),
          amount:
            order.liquidationRewardAmount +
            parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18),
          token: values.collateralToken,
        },
      ];
    }

    return [
      {
        iconName: "done" as IconName,
        pending: CreateMarginPositionStatus.PENDING_APPROVE_BORROW,
        loading: CreateMarginPositionStatus.LOADING_APPROVE_BORROW,
        error: CreateMarginPositionStatus.ERROR_APPROVE_BORROW,
        textMap: getApproveTextMap(values.collateralToken.symbol!),
        amount: parseUnits(
          values.collateralAmount.toString(),
          values.collateralToken?.decimals ?? 18,
        ),
        token: values.collateralToken,
      },
      {
        iconName: "done" as IconName,
        pending: CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE,
        loading: CreateMarginPositionStatus.LOADING_APPROVE_LIQUIDATION_FEE,
        error: CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE,
        textMap: getApproveTextMap(order.liquidationRewardAsset.symbol!),
        amount: order.liquidationRewardAmount,
        token: order.liquidationRewardAsset,
      },
    ];
  }, [
    order.liquidationRewardAmount,
    order.liquidationRewardAsset,
    values.collateralAmount,
    values.collateralToken,
  ]);

  const borrowStep: OperationStepConfig = {
    iconName: "borrow",
    pending: CreateMarginPositionStatus.PENDING_BORROW,
    loading: CreateMarginPositionStatus.LOADING_BORROW,
    error: CreateMarginPositionStatus.ERROR_BORROW,
    textMap: {
      [OperationStepStatus.IDLE]: "Borrow",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Borrow",
      [OperationStepStatus.LOADING]: "Borrowing",
      [OperationStepStatus.STEP_COMPLETED]: "Successfully borrowed",
      [OperationStepStatus.STEP_FAILED]: "Borrow failed",
      [OperationStepStatus.OPERATION_COMPLETED]: "Successfully borrowed",
    },
  };

  return { allSteps: [...approveSteps, borrowStep], approveSteps };
}

export default function useCreateMarginPosition(order: LendingOrder) {
  const { setStatus } = useCreateMarginPositionStatusStore();

  const { values } = useCreateMarginPositionConfigStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();

  const isEqualFeeAndCollateralAssets = useMemo(() => {
    return values.collateralToken?.equals(order.liquidationRewardAsset);
  }, [order.liquidationRewardAsset, values.collateralToken]);
  // const { approveSteps } = useCreatePositionApproveSteps(order);

  const { isAllowed: isAllowedA, writeTokenApprove: approveA } = useStoreAllowance({
    token: values.collateralToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: isEqualFeeAndCollateralAssets // we check here if we will only need one approval for collateral and liquidation
      ? order.liquidationRewardAmount +
        parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18)
      : parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18),
  });

  const { isAllowed: isAllowedB, writeTokenApprove: approveB } = useStoreAllowance({
    token: isEqualFeeAndCollateralAssets ? undefined : order.liquidationRewardAsset, // set token to undefined so hook won't run when tokens are equal. Approval will be handled by upper hook
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: order.liquidationRewardAmount,
  });

  const handleCreateMarginPosition = useCallback(
    async (orderId: string) => {
      if (!values.collateralAmount || !walletClient || !publicClient) {
        return;
      }

      if (!values.collateralToken?.isNative && !isAllowedA) {
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

      if (
        !order.liquidationRewardAsset?.isNative &&
        !isAllowedB &&
        !values.collateralToken?.equals(order.liquidationRewardAsset)
      ) {
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

      setStatus(CreateMarginPositionStatus.PENDING_BORROW);

      console.log(values);
      const takeLoanHash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[chainId],
        functionName: "takeLoan",
        args: [
          BigInt(orderId),
          parseUnits(values.borrowAmount.toString(), 18),
          BigInt(
            order.collateralAddresses.findIndex(
              (address) =>
                values.collateralToken?.wrapped.address0.toLowerCase() === address.toLowerCase(), //TODO: ad check for erc223
            ),
          ),
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
      chainId,
      isAllowedA,
      isAllowedB,
      order.liquidationRewardAsset,
      publicClient,
      setStatus,
      values,
      walletClient,
    ],
  );

  return { handleCreateMarginPosition };
}
