import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import { Address, encodeAbiParameters, Hash, keccak256, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import { useEditOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderConfigStore";
import {
  EditOrderStatus,
  useEditOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderStatusStore";
import { TradingTokensInputMode } from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import {
  CreateOrderStatus,
  useCreateOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStatusStore";
import {
  useCreateOrderGasLimitStore,
  useCreateOrderGasPriceStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useSwapGasSettingsStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { getGasSettings } from "@/functions/gasSettings";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useFees } from "@/hooks/useFees";
import addToast from "@/other/toast";
import { MARGIN_TRADING_ADDRESS, ORACLE_ADDRESS } from "@/sdk_bi/addresses";

export function useEditOrderParams() {
  const { firstStepValues, secondStepValues, thirdStepValues } = useEditOrderConfigStore();

  return {
    ...firstStepValues,
    ...secondStepValues,
    ...thirdStepValues,
  };
}

export function sortAddresses(addresses: string[]): string[] {
  return addresses.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
}

export function getWhitelistId(addresses: Address[], isContract: boolean): Hash {
  const encoded = encodeAbiParameters(
    [
      { type: "bool", name: "isContract" },
      { type: "address[]", name: "tokens" },
    ],
    [isContract, addresses],
  );

  return keccak256(encoded);
}

/**
 * Calculate the on‐chain interestRate parameter.
 *
 * The contract expects:
 *   – interestRate = (30-day rate × 100) prorated to position duration
 *   – e.g. 11.5% for 30 days ⇒ 1150, half that for 15 days ⇒ 575
 *
 * @param monthlyPct    30-day interest rate in percent (e.g. 11.5 for 11.5%)
 * @param durationDays  Actual position length in days
 * @returns             Integer interestRate for your contract
 */
export function calculateInterestRate(monthlyPct: number, durationDays: number): bigint {
  // Convert 30-day % to “percent × 100”
  return BigInt(monthlyPct * 100);
  // Prorate by (durationDays / 30)
  // const prorated = (baseRate * durationDays) / 30;
  // // Round down to an integer (solidity uint)
  // return BigInt(Math.floor(prorated));
}

export default function useEditOrder() {
  const t = useTranslations("Swap");
  const { data: walletClient } = useWalletClient();
  const params = useEditOrderParams();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();

  const { setStatus, setModifyOrderHash } = useEditOrderStatusStore();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    updateAllowance,
  } = useStoreAllowance({
    token: params.loanToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: parseUnits(params.loanAmount, params.loanToken?.decimals ?? 18),
  });

  const { customGasLimit } = useCreateOrderGasLimitStore();
  const { gasPriceOption, gasPriceSettings } = useCreateOrderGasPriceStore();
  const { baseFee, priorityFee, gasPrice } = useFees();
  const {
    tradingTokens,
    loanToken,
    loanTokenStandard,
    collateralTokens,
    loanAmount,
    includeERC223Collateral,
    liquidationFeeToken,
    liquidationFeeForLiquidator,
    liquidationFeeForLender,
    liquidationMode,
    minimumBorrowingAmount,
    orderCurrencyLimit,
    period,
    interestRatePerMonth,
    leverage,
    priceSource,
  } = useEditOrderParams();

  const gasSettings = useMemo(() => {
    return getGasSettings({
      baseFee,
      chainId,
      gasPrice,
      priorityFee,
      gasPriceOption,
      gasPriceSettings,
    });
  }, [baseFee, chainId, gasPrice, priorityFee, gasPriceOption, gasPriceSettings]);

  useEffect(() => {
    setStatus(EditOrderStatus.INITIAL);
  }, [setStatus]);

  const handleEditOrder = useCallback(
    async (amountToApprove: string, order: LendingOrder) => {
      setStatus(EditOrderStatus.PENDING_MODIFY);

      if (
        !params.loanToken ||
        !publicClient ||
        !walletClient ||
        !loanToken ||
        !liquidationFeeToken ||
        (tradingTokens.inputMode === TradingTokensInputMode.AUTOLISTING &&
          !tradingTokens.tradingTokensAutoListing)
      ) {
        return;
      }

      const sortedAddresses =
        tradingTokens.inputMode === TradingTokensInputMode.AUTOLISTING
          ? [tradingTokens.tradingTokensAutoListing!.id] // add ! here because we have check upper
          : (sortAddresses(
              tradingTokens.allowedTokens.flatMap((token) =>
                tradingTokens.includeERC223Trading
                  ? [token.wrapped.address0, token.wrapped.address1]
                  : [token.wrapped.address0],
              ),
            ) as Address[]);
      //
      // const addTokenListHash = await walletClient.writeContract({
      //   abi: MARGIN_MODULE_ABI,
      //   address: MARGIN_TRADING_ADDRESS[chainId],
      //   functionName: "addTokenlist",
      //   args: [sortedAddresses, tradingTokens.inputMode === TradingTokensInputMode.AUTOLISTING],
      //   account: undefined,
      // });
      //
      // setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);
      // await publicClient.waitForTransactionReceipt({ hash: addTokenListHash });
      // setStatus(CreateOrderStatus.PENDING_CONFIRM_ORDER);
      //
      const whitelistId = getWhitelistId(
        sortedAddresses,
        tradingTokens.inputMode === TradingTokensInputMode.AUTOLISTING,
      );

      const args = [
        BigInt(order.id), // _orderId
        whitelistId, // _whitelist
        calculateInterestRate(Number(interestRatePerMonth), Number(period.positionDuration)), // _interestRate
        BigInt(Number(period.positionDuration) * 24 * 60 * 60), // _duration
        parseUnits(minimumBorrowingAmount.toString(), loanToken.decimals), // _minLoan
        Number(orderCurrencyLimit), // _currencyLimit
        leverage, // _leverage
        ORACLE_ADDRESS[chainId], // _oracle
        parseUnits(liquidationFeeForLiquidator, liquidationFeeToken.decimals), // _liquidationRewardAmount
        liquidationFeeToken.wrapped.address0, // _liquidationRewardAsset
        Math.floor(new Date(period.lendingOrderDeadline).getTime() / 1000), // _deadline
      ];

      console.log(args);

      try {
        const modifyOrderHash = await walletClient.writeContract({
          abi: MARGIN_MODULE_ABI,
          address: MARGIN_TRADING_ADDRESS[chainId],
          functionName: "modifyOrder",
          args: args as any,
          account: undefined,
        });
        setStatus(EditOrderStatus.LOADING_MODIFY);
        setModifyOrderHash(modifyOrderHash);

        const createOrderReceipt = await publicClient.waitForTransactionReceipt({
          hash: modifyOrderHash,
        });

        setStatus(EditOrderStatus.SUCCESS);

        // console.log("Receipt", receipt);
      } catch (e) {
        console.log(e);
        addToast("Unexpected error", "error");
        setStatus(EditOrderStatus.INITIAL);
      }

      // await handleRunStep({
      //   params,
      //   gasSettings,
      //   customGasLimit,
      //   title: {
      //     symbol: params.loanToken.symbol!,
      //     template: RecentTransactionTitleTemplate.CONVERT,
      //     amount: params.loanAmount,
      //     logoURI: params.loanToken?.logoURI || "/images/tokens/placeholder.svg",
      //     standard: params.loanTokenStandard,
      //   },
      //   onReceiptReceive: (receipt, gas) => {
      //     updateAllowance();
      //
      //     if (receipt.status === "reverted") {
      //       setStatus(CreateOrderStatus.ERROR_CONFIRM_ORDER);
      //
      //       const ninetyEightPercent = (gas * BigInt(98)) / BigInt(100);
      //
      //       if (receipt.gasUsed >= ninetyEightPercent && receipt.gasUsed <= gas) {
      //         setErrorType(SwapError.OUT_OF_GAS);
      //       } else {
      //         setErrorType(SwapError.UNKNOWN);
      //       }
      //       return;
      //     }
      //   },
      //   gasPriceSettings,
      //   onHashReceive: (hash) => {
      //     if (!hash) {
      //       setStatus(CreateOrderStatus.INITIAL);
      //       throw new Error("Hash not found!");
      //     }
      //
      //     setConfirmOrderHash(hash);
      //     setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);
      //   },
      // });
      //
      // setStatus(CreateOrderStatus.PENDING_DEPOSIT);
      //
      // if (!isAllowedA && params.loanTokenStandard === Standard.ERC20 && params.loanToken.isToken) {
      //   openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));
      //
      //   setStatus(CreateOrderStatus.PENDING_APPROVE);
      //   const result = await approveA({
      //     customAmount: parseUnits(amountToApprove, params.loanToken.decimals ?? 18),
      //     customGasSettings: gasSettings,
      //   });
      //
      //   if (!result?.success) {
      //     setStatus(CreateOrderStatus.INITIAL);
      //     closeConfirmInWalletAlert();
      //     return;
      //   } else {
      //     setApproveHash(result.hash);
      //     setStatus(CreateOrderStatus.LOADING_APPROVE);
      //     closeConfirmInWalletAlert();
      //
      //     const approveReceipt = await publicClient.waitForTransactionReceipt({
      //       hash: result.hash,
      //     });
      //
      //     if (approveReceipt.status === "reverted") {
      //       setStatus(CreateOrderStatus.ERROR_APPROVE);
      //       return;
      //     }
      //   }
      // }
      //
      // await handleRunStep({
      //   params,
      //   gasSettings,
      //   customGasLimit,
      //   title: {
      //     symbol: params.loanToken.symbol!,
      //     template: RecentTransactionTitleTemplate.CONVERT,
      //     amount: params.loanAmount,
      //     logoURI: params.loanToken?.logoURI || "/images/tokens/placeholder.svg",
      //     standard: params.loanTokenStandard,
      //   },
      //   onReceiptReceive: (receipt, gas) => {
      //     updateAllowance();
      //
      //     if (receipt.status === "reverted") {
      //       setStatus(CreateOrderStatus.ERROR_CONFIRM_ORDER);
      //
      //       const ninetyEightPercent = (gas * BigInt(98)) / BigInt(100);
      //
      //       if (receipt.gasUsed >= ninetyEightPercent && receipt.gasUsed <= gas) {
      //         setErrorType(SwapError.OUT_OF_GAS);
      //       } else {
      //         setErrorType(SwapError.UNKNOWN);
      //       }
      //       return;
      //     }
      //   },
      //   gasPriceSettings,
      //   onHashReceive: (hash) => {
      //     if (!hash) {
      //       setStatus(CreateOrderStatus.INITIAL);
      //       throw new Error("Hash not found!");
      //     }
      //
      //     setConfirmOrderHash(hash);
      //     setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);
      //   },
      // });
    },
    [
      chainId,
      interestRatePerMonth,
      leverage,
      liquidationFeeForLiquidator,
      liquidationFeeToken,
      loanToken,
      minimumBorrowingAmount,
      orderCurrencyLimit,
      params.loanToken,
      period.lendingOrderDeadline,
      period.positionDuration,
      publicClient,
      setModifyOrderHash,
      setStatus,
      tradingTokens.allowedTokens,
      tradingTokens.includeERC223Trading,
      tradingTokens.inputMode,
      tradingTokens.tradingTokensAutoListing,
      walletClient,
    ],
  );

  return { handleEditOrder };
}
