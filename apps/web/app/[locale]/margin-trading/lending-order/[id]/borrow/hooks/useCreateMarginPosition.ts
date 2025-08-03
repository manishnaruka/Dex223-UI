import { useCallback, useMemo } from "react";
import { getAbiItem, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import { LendingOrder } from "@/app/[locale]/margin-trading/types";
import { OperationStepStatus } from "@/components/common/OperationStepRow";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { IconName } from "@/config/types/IconName";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

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
            order.liquidationRewardAmount.value +
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
        amount: order.liquidationRewardAmount.value,
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
  const { setStatus, setBorrowHash, setApproveBorrowHash, setConfirmOrderLiquidationFeeHash } =
    useCreateMarginPositionStatusStore();

  const { addRecentTransaction } = useRecentTransactionsStore();
  const { values } = useCreateMarginPositionConfigStore();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { address } = useAccount();

  const isEqualFeeAndCollateralAssets = useMemo(() => {
    return values.collateralToken?.equals(order.liquidationRewardAsset);
  }, [order.liquidationRewardAsset, values.collateralToken]);
  // const { approveSteps } = useCreatePositionApproveSteps(order);

  const { isAllowed: isAllowedA, writeTokenApprove: approveA } = useStoreAllowance({
    token: values.collateralToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: isEqualFeeAndCollateralAssets // we check here if we will only need one approval for collateral and liquidation
      ? order.liquidationRewardAmount.value +
        parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18)
      : parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18),
  });

  const { isAllowed: isAllowedB, writeTokenApprove: approveB } = useStoreAllowance({
    token: isEqualFeeAndCollateralAssets ? undefined : order.liquidationRewardAsset, // set token to undefined so hook won't run when tokens are equal. Approval will be handled by upper hook
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: order.liquidationRewardAmount.value,
  });

  const handleCreateMarginPosition = useCallback(
    async (orderId: string, amountToApprove: string, feeAmountToApprove: string) => {
      if (!values.collateralAmount || !walletClient || !publicClient || !address) {
        return;
      }

      if (!values.collateralToken?.isNative && !isAllowedA) {
        // TODO: Check why allowance won't work
        setStatus(CreateMarginPositionStatus.PENDING_APPROVE_BORROW);

        const approveResult = await approveA({
          customAmount: parseUnits(amountToApprove, values.collateralToken?.decimals ?? 18),
          // customGasSettings: gasSettings,
        });

        if (!approveResult?.success) {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_BORROW);
          return;
        }
        setApproveBorrowHash(approveResult.hash);

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
          customAmount: parseUnits(feeAmountToApprove, order.liquidationRewardAsset.decimals),
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

        setConfirmOrderLiquidationFeeHash(approveResult.hash);

        if (approveReceipt.status !== "success") {
          setStatus(CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE);
          return;
        }
      }

      setStatus(CreateMarginPositionStatus.PENDING_BORROW);

      const params = {
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[chainId],
        functionName: "takeLoan" as const,
        args: [
          BigInt(orderId),
          parseUnits(values.borrowAmount.toString(), order.baseAsset.decimals),
          BigInt(
            order.collateralAddresses.findIndex(
              (address) =>
                values.collateralToken?.wrapped.address0.toLowerCase() === address.toLowerCase(), //TODO: ad check for erc223
            ),
          ),
          parseUnits(values.collateralAmount.toString(), values.collateralToken?.decimals ?? 18),
        ] as const,
      };
      console.log(values);
      const takeLoanHash = await walletClient.writeContract({
        ...params,
        account: undefined,
      });

      setBorrowHash(takeLoanHash);

      const transaction = await getTransactionWithRetries({
        hash: takeLoanHash,
        publicClient,
      });

      const nonce = transaction.nonce;

      addRecentTransaction(
        {
          hash: takeLoanHash,
          nonce,
          chainId,
          gas: {
            model: GasFeeModel.EIP1559,
            gas: "0",
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          },
          params: {
            ...stringifyObject(params),
            abi: [getAbiItem({ name: "takeLoan", abi: MARGIN_MODULE_ABI })],
          },
          title: {
            symbolBorrowed: order.baseAsset.symbol!,
            symbolFee: order.liquidationRewardAsset.symbol!,
            symbolCollateral: values.collateralToken!.symbol!,
            amountBorrowed: values.borrowAmount,
            amountFee: order.liquidationRewardAmount.formatted,
            amountCollateral: values.collateralAmount,
            template: RecentTransactionTitleTemplate.CREATE_MARGIN_POSITION,
            logoURI: order.baseAsset?.logoURI || "/images/tokens/placeholder.svg",
          },
        },
        address,
      );

      setStatus(CreateMarginPositionStatus.LOADING_BORROW);
      await publicClient.waitForTransactionReceipt({ hash: takeLoanHash });

      setStatus(CreateMarginPositionStatus.SUCCESS);
    },
    [
      addRecentTransaction,
      address,
      approveA,
      approveB,
      chainId,
      isAllowedA,
      isAllowedB,
      order.baseAsset.decimals,
      order.baseAsset?.logoURI,
      order.baseAsset.symbol,
      order.collateralAddresses,
      order.liquidationRewardAmount.formatted,
      order.liquidationRewardAsset,
      publicClient,
      setApproveBorrowHash,
      setBorrowHash,
      setConfirmOrderLiquidationFeeHash,
      setStatus,
      values,
      walletClient,
    ],
  );

  return { handleCreateMarginPosition };
}
