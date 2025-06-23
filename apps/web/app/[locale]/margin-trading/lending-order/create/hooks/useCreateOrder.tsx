import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import { Address, decodeEventLog, encodeAbiParameters, Hash, keccak256, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { TradingTokensInputMode } from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
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
import useRunStep from "@/hooks/useRunStep";
import addToast from "@/other/toast";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Standard } from "@/sdk_bi/standard";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";

function useCreateOrderParams() {
  const { firstStepValues, secondStepValues, thirdStepValues } = useCreateOrderConfigStore();

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
  const baseRate = monthlyPct * 100;
  // Prorate by (durationDays / 30)
  const prorated = (baseRate * durationDays) / 30;
  // Round down to an integer (solidity uint)
  return BigInt(Math.floor(prorated));
}

export default function useCreateOrder() {
  const t = useTranslations("Swap");
  const { data: walletClient } = useWalletClient();
  const params = useCreateOrderParams();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { address } = useAccount();

  const { openConfirmInWalletAlert, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();
  const { setStatus, setApproveHash, setDepositHash, setConfirmOrderHash, setErrorType } =
    useCreateOrderStatusStore();

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
  } = useCreateOrderParams();

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

  const { handleRunStep } = useRunStep();

  useEffect(() => {
    setStatus(CreateOrderStatus.INITIAL);
  }, [setStatus]);

  const handleCreateOrder = useCallback(
    async (amountToApprove: string) => {
      setStatus(CreateOrderStatus.PENDING_CONFIRM_ORDER);

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

      const addTokenListHash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[chainId],
        functionName: "addTokenlist",
        args: [sortedAddresses, false],
        account: undefined,
      });

      setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);
      await publicClient.waitForTransactionReceipt({ hash: addTokenListHash });
      setStatus(CreateOrderStatus.PENDING_CONFIRM_ORDER);

      const whitelistId = getWhitelistId(
        sortedAddresses,
        tradingTokens.inputMode === TradingTokensInputMode.AUTOLISTING,
      );

      try {
        const createOrderHash = await walletClient.writeContract({
          abi: MARGIN_MODULE_ABI,
          address: MARGIN_TRADING_ADDRESS[chainId],
          functionName: "createOrder",
          args: [
            {
              whitelistId: whitelistId,
              // interest rate for 30 days mutliplied by 100
              interestRate: calculateInterestRate(
                Number(interestRatePerMonth),
                Number(period.positionDuration),
              ),
              duration: BigInt(Number(period.positionDuration) * 24 * 60 * 60), // positionDuration in seconds
              minLoan: parseUnits(minimumBorrowingAmount.toString(), loanToken.decimals),
              liquidationRewardAmount: parseUnits(
                liquidationFeeForLiquidator,
                liquidationFeeToken.decimals,
              ),
              liquidationRewardAsset: liquidationFeeToken.wrapped.address0,
              asset:
                loanTokenStandard === Standard.ERC20
                  ? loanToken.wrapped.address0
                  : loanToken.wrapped.address1,
              deadline: Math.floor(new Date(period.lendingOrderDeadline).getTime() / 1000),
              currencyLimit: Number(orderCurrencyLimit),
              leverage,
              oracle: "0xa8fa9e2c64a45ba5bc64089104c332be056c4c83",
              collateral: collateralTokens.flatMap((token) => {
                if (includeERC223Collateral) {
                  return [token.wrapped.address0, token.wrapped.address1];
                }
                return [token.wrapped.address0];
              }),
            },
            // whitelist id from tokens that are allowed for trading
          ],
          account: undefined,
        });
        setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);

        const createOrderReceipt = await publicClient.waitForTransactionReceipt({
          hash: createOrderHash,
        });

        const decodedLog = decodeEventLog({
          abi: MARGIN_MODULE_ABI,
          eventName: "OrderCreated",
          data: createOrderReceipt.logs[0].data,
          topics: createOrderReceipt.logs[0].topics,
        });

        console.log("Decoded log", decodedLog);

        if (params.loanToken.isNative) {
          setStatus(CreateOrderStatus.PENDING_DEPOSIT);

          const depositOrderHash = await walletClient.writeContract({
            abi: MARGIN_MODULE_ABI,
            address: MARGIN_TRADING_ADDRESS[chainId],
            functionName: "orderDepositWETH9",
            args: [decodedLog.args.orderId, params.loanToken.wrapped.address0],
            value: parseUnits(loanAmount, params.loanToken.decimals ?? 18),
            account: undefined,
          });
          setStatus(CreateOrderStatus.LOADING_DEPOSIT);

          const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });

          if (receipt.status === "success") {
            setStatus(CreateOrderStatus.SUCCESS);
          } else {
            setStatus(CreateOrderStatus.ERROR_DEPOSIT);
          }
        } else {
          setStatus(CreateOrderStatus.PENDING_APPROVE);
          const approveResult = await approveA({
            customAmount: parseUnits(loanAmount, params.loanToken.decimals ?? 18),
            customGasSettings: gasSettings,
          });

          if (!approveResult?.success) {
            setStatus(CreateOrderStatus.ERROR_APPROVE);
            return;
          }

          setStatus(CreateOrderStatus.LOADING_APPROVE);

          const approveReceipt = await publicClient.waitForTransactionReceipt({
            hash: approveResult.hash,
          });

          if (approveReceipt.status !== "success") {
            setStatus(CreateOrderStatus.ERROR_APPROVE);
            return;
          }

          setStatus(CreateOrderStatus.PENDING_DEPOSIT);

          const depositOrderHash = await walletClient.writeContract({
            abi: MARGIN_MODULE_ABI,
            address: MARGIN_TRADING_ADDRESS[chainId],
            functionName: "orderDepositToken",
            args: [
              decodedLog.args.orderId,
              parseUnits(loanAmount, params.loanToken.decimals ?? 18),
            ],
            account: undefined,
          });
          setStatus(CreateOrderStatus.LOADING_DEPOSIT);

          const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });

          if (receipt.status === "success") {
            setStatus(CreateOrderStatus.SUCCESS);
          } else {
            setStatus(CreateOrderStatus.ERROR_DEPOSIT);
          }
          console.log(receipt);
        }

        // console.log("Receipt", receipt);
      } catch (e) {
        console.log(e);
        addToast("Unexpected error", "error");
        setStatus(CreateOrderStatus.INITIAL);
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
      loanTokenStandard,
      minimumBorrowingAmount,
      orderCurrencyLimit,
      params.loanToken,
      period.lendingOrderDeadline,
      period.positionDuration,
      publicClient,
      setStatus,
      tradingTokens.allowedTokens,
      walletClient,
    ],
  );

  return { handleCreateOrder };
}
