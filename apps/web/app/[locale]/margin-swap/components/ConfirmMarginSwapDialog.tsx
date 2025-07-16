import Alert from "@repo/ui/alert";
import Preloader from "@repo/ui/preloader";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Address, formatGwei, parseUnits } from "viem";
import { useGasPrice } from "wagmi";

import useMarginSwap from "@/app/[locale]/margin-swap/hooks/useMarginSwap";
import { useConfirmMarginSwapDialogStore } from "@/app/[locale]/margin-swap/stores/useConfirmMarginSwapDialogOpened";
import { useMarginSwapAmountsStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapAmountsStore";
import { useMarginSwapTokensStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapTokensStore";
import SwapDetailsRow from "@/app/[locale]/swap/components/SwapDetailsRow";
import { useSwapStatus } from "@/app/[locale]/swap/hooks/useSwap";
import {
  useSwapGasLimitStore,
  useSwapGasPriceStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import {
  SwapError,
  SwapStatus,
  useSwapStatusStore,
} from "@/app/[locale]/swap/stores/useSwapStatusStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { networks } from "@/config/networks";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useUSDPrice } from "@/hooks/useUSDPrice";
import { ROUTER_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_bi/entities/fractions/percent";
import { Trade } from "@/sdk_bi/entities/trade";
import { wrappedTokens } from "@/sdk_bi/entities/weth9";
import { Standard } from "@/sdk_bi/standard";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

//TODO: refactor approve rows
function ApproveRow({
  logoURI = "",
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isSuccessSwap = false,
  isReverted = false,
  hash,
}: {
  logoURI: string | undefined;
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isSuccessSwap?: boolean;
  isReverted?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");
  const chainId = useCurrentChainId();

  return (
    <div
      className={clsx(
        "grid grid-cols-[32px_auto_1fr] gap-2 h-10 before:absolute relative before:left-[15px] before:-bottom-4 before:w-0.5 before:h-3 before:rounded-1",
        isSuccess ? "before:bg-green" : "before:bg-green-bg",
      )}
    >
      <div className="flex items-center">
        <Image
          className={clsx(isSuccess && "", "rounded-full")}
          src={logoURI}
          alt=""
          width={32}
          height={32}
        />
      </div>

      <div className="flex flex-col justify-center">
        <span
          className={clsx(
            isSuccess ? "text-secondary-text text-14" : "text-14",
            isSuccessSwap && "text-primary-text",
          )}
        >
          {(isSuccess || isSuccessSwap) && t("approved")}
          {isPending && "Confirm in your wallet"}
          {isLoading && "Approving"}
          {!isSuccess && !isPending && !isReverted && !isLoading && !isSuccessSwap && "Approve"}
          {isReverted && "Approve failed"}
        </span>
        {!isSuccess && <span className="text-green text-12">{t("why_do_i_have_to_approve")}</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a target="_blank" href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, chainId)}>
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {(isSuccess || isSuccessSwap) && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-light" iconName="warning" size={20} />}
      </div>
    </div>
  );
}

function SwapRow({
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isSettled = false,
  isReverted = false,
  isDisabled = false,
  hash,
}: {
  isLoading?: boolean;
  isPending?: boolean;
  isSettled?: boolean;
  isSuccess?: boolean;
  isReverted?: boolean;
  isDisabled?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");
  const chainId = useCurrentChainId();

  return (
    <div className="grid grid-cols-[32px_auto_1fr] gap-2 h-10">
      <div className="flex items-center h-full">
        <div
          className={clsxMerge(
            "p-1 rounded-full h-8 w-8",
            isDisabled ? "bg-tertiary-bg" : "bg-green-bg",
            isReverted && "bg-red-bg",
          )}
        >
          <Svg
            className={clsxMerge(
              "rotate-90",
              isDisabled ? "text-tertiary-text" : "text-green",
              isReverted && "text-red-light",
            )}
            iconName="swap"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={clsx("text-14", isDisabled ? "text-tertiary-text" : "text-primary-text")}>
          {(isPending || (!isLoading && !isReverted && !isSuccess)) && t("confirm_swap")}
          {isLoading && t("executing_swap")}
          {isReverted && "Failed to confirm a swap"}
          {isSuccess && "Executed swap"}
        </span>
        {(isPending || isLoading) && (
          <span className="text-green text-12">{t("learn_more_about_swap")}</span>
        )}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a target="_blank" href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, chainId)}>
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-light" iconName="warning" size={20} />}
      </div>
    </div>
  );
}
function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function SwapActionButton({
  amountToApprove,
  isEditApproveActive,
}: {
  amountToApprove: string;
  isEditApproveActive: boolean;
}) {
  const t = useTranslations("Swap");
  const { tokenA, tokenB, tokenAStandard } = useMarginSwapTokensStore();
  const { typedValue } = useMarginSwapAmountsStore();
  const { setIsOpen } = useConfirmMarginSwapDialogStore();

  const { handleMarginSwap } = useMarginSwap();

  const {
    isPendingApprove,
    isLoadingApprove,
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
    isSettledSwap,
    isRevertedSwap,
    isRevertedApprove,
  } = useSwapStatus();

  const { swapHash, approveHash, errorType } = useSwapStatusStore();

  if (!tokenA || !tokenB) {
    return (
      <Button fullWidth disabled>
        {t("select_tokens")}
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button fullWidth disabled>
        {t("enter_amount")}
      </Button>
    );
  }

  if (tokenA.isToken && tokenAStandard === Standard.ERC20) {
    if (isPendingApprove) {
      return (
        <Rows>
          <ApproveRow isPending logoURI={tokenA.logoURI} />
          <SwapRow isDisabled />
        </Rows>
      );
    }

    if (isLoadingApprove) {
      return (
        <Rows>
          <ApproveRow hash={approveHash} isLoading logoURI={tokenA.logoURI} />
          <SwapRow isDisabled />
        </Rows>
      );
    }

    if (isRevertedApprove) {
      return (
        <>
          <Rows>
            <ApproveRow hash={approveHash} isReverted logoURI={tokenA.logoURI} />
            <SwapRow isDisabled />
          </Rows>
          <div className="flex flex-col gap-5 mt-4">
            <Alert
              withIcon={false}
              type="error"
              text={
                <span>
                  Transaction failed due to lack of gas or an internal contract error. Try using
                  higher slippage or gas to ensure your transaction is completed. If you still have
                  issues, click{" "}
                  <a href="#" className="text-green hocus:underline">
                    common errors
                  </a>
                  .
                </span>
              }
            />
            <Button
              fullWidth
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Try again
            </Button>
          </div>
        </>
      );
    }
  }

  if (isPendingSwap) {
    return (
      <Rows>
        {tokenA.isToken && tokenAStandard === Standard.ERC20 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow isPending />
      </Rows>
    );
  }

  if (isLoadingSwap) {
    return (
      <Rows>
        {tokenA.isToken && tokenAStandard === Standard.ERC20 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow hash={swapHash} isLoading />
      </Rows>
    );
  }

  if (isSuccessSwap) {
    return (
      <Rows>
        {tokenA.isToken && tokenAStandard === Standard.ERC20 && (
          <ApproveRow hash={approveHash} isSuccessSwap logoURI={tokenA.logoURI} />
        )}
        <SwapRow hash={swapHash} isSettled isSuccess />
      </Rows>
    );
  }

  if (isRevertedSwap) {
    return (
      <>
        <Rows>
          {tokenA.isToken && tokenAStandard === Standard.ERC20 && (
            <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
          )}
          <SwapRow hash={swapHash} isSettled isReverted />
        </Rows>
        <div className="flex flex-col gap-5 mt-4">
          <Alert
            withIcon={false}
            type="error"
            text={
              errorType === SwapError.UNKNOWN ? (
                <span>
                  Transaction failed due to lack of gas or an internal contract error. Try using
                  higher slippage or gas to ensure your transaction is completed. If you still have
                  issues, click{" "}
                  <a href="#" className="text-green hocus:underline">
                    common errors
                  </a>
                  .
                </span>
              ) : (
                <span>
                  Transaction failed due to lack of gas. Try increasing gas limit to ensure your
                  transaction is completed. If you still have issues, contact support.
                </span>
              )
            }
          />
          <Button
            fullWidth
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );
  }

  return (
    <Button
      colorScheme={ButtonColor.PURPLE}
      disabled={isEditApproveActive}
      onClick={() => handleMarginSwap()}
      fullWidth
    >
      Confirm margin swap
    </Button>
  );
}
function ReadonlyTokenAmountCard({
  token,
  amount,
  amountUSD,
  standard,
  title,
}: {
  token: Currency | undefined;
  amount: string;
  amountUSD: string | undefined;
  standard: Standard;
  title: string;
}) {
  return (
    <div className="rounded-3 bg-tertiary-bg py-4 px-5 flex flex-col gap-1">
      <p className="text-secondary-text text-14">{title}</p>
      <div className="flex justify-between items-center text-20">
        <span>{amount}</span>
        <div className="flex items-center gap-2">
          <Image
            src={token?.logoURI || "/images/tokens/placeholder.svg"}
            alt=""
            width={32}
            height={32}
          />
          {token?.symbol}
          {token?.isNative ? (
            <Badge color="purple" text={"Native"} />
          ) : (
            <Badge color="purple" variant={BadgeVariant.STANDARD} standard={standard} />
          )}
        </div>
      </div>
      <p className="text-secondary-text text-14">${amountUSD}</p>
    </div>
  );
}

export default function ConfirmMarginSwapDialog({ trade }: { trade: Trade<any, any, any> | null }) {
  const t = useTranslations("Swap");
  const {
    tokenA,
    tokenB,
    tokenAStandard,
    tokenBStandard,
    reset: resetTokens,
  } = useMarginSwapTokensStore();
  const { typedValue, reset: resetAmounts } = useMarginSwapAmountsStore();
  const chainId = useCurrentChainId();

  const { isOpen, setIsOpen } = useConfirmMarginSwapDialogStore();

  console.log("Trade", trade);

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return trade.outputAmount.toSignificant();
  }, [trade]);

  const { slippage, deadline: _deadline } = useSwapSettingsStore();
  const {
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
    isLoadingApprove,
    isPendingApprove,
    isRevertedSwap,
    isSettledSwap,
    isRevertedApprove,
  } = useSwapStatus();

  const { status: swapStatus, setStatus: setSwapStatus } = useSwapStatusStore();

  const { estimatedGas, customGasLimit } = useSwapGasLimitStore();

  const isProcessing = useMemo(() => {
    return (
      isPendingSwap ||
      isLoadingSwap ||
      isSettledSwap ||
      isLoadingApprove ||
      isPendingApprove ||
      isRevertedApprove
    );
  }, [
    isLoadingApprove,
    isLoadingSwap,
    isPendingApprove,
    isPendingSwap,
    isRevertedApprove,
    isSettledSwap,
  ]);

  const [amountToApprove, setAmountToApprove] = useState(typedValue);
  // const { gasOption, gasPrice, gasLimit } = useSwapGasSettingsStore();

  useEffect(() => {
    if (typedValue) {
      setAmountToApprove(typedValue);
    }
  }, [typedValue]);

  const { gasPriceSettings } = useSwapGasPriceStore();
  const { data: baseFee } = useGasPrice();

  const computedGasSpending = useMemo(() => {
    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPriceSettings.gasPrice) {
      return formatFloat(formatGwei(gasPriceSettings.gasPrice));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      gasPriceSettings.maxFeePerGas &&
      gasPriceSettings.maxPriorityFeePerGas &&
      baseFee
    ) {
      const lowerFeePerGas =
        gasPriceSettings.maxFeePerGas > baseFee ? baseFee : gasPriceSettings.maxFeePerGas;

      return formatFloat(formatGwei(lowerFeePerGas + gasPriceSettings.maxPriorityFeePerGas));
    }

    return "0";
  }, [baseFee, gasPriceSettings]);
  const isConversion = useMemo(() => tokenB && tokenA?.equals(tokenB), [tokenA, tokenB]);

  useEffect(() => {
    if (isSuccessSwap && !isOpen && !isConversion) {
      resetAmounts();
    }
  }, [isSuccessSwap, resetAmounts, isOpen, isConversion]);

  useEffect(() => {
    if ((isSuccessSwap || isRevertedSwap || isRevertedApprove) && !isOpen && !isConversion) {
      setTimeout(() => {
        setSwapStatus(SwapStatus.INITIAL);
      }, 400);
    }
  }, [
    isConversion,
    isOpen,
    isRevertedApprove,
    isRevertedSwap,
    isSuccessSwap,
    setSwapStatus,
    swapStatus,
  ]);

  const [isEditApproveActive, setEditApproveActive] = useState(false);

  const { isAllowed: isAllowedA } = useStoreAllowance({
    token: tokenA,
    contractAddress: ROUTER_ADDRESS[chainId],
    amountToCheck: parseUnits(typedValue, tokenA?.decimals ?? 18),
  });

  const { price: priceA } = useUSDPrice(tokenA?.wrapped.address0);
  const { price: priceB } = useUSDPrice(tokenB?.wrapped.address0);

  const { price: priceNative } = useUSDPrice(wrappedTokens[chainId]?.address0);

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={(isOpen) => {
        setIsOpen(isOpen);
      }}
    >
      <div className="bg-primary-bg rounded-5 w-full sm:w-[600px]">
        <DialogHeader
          onClose={() => {
            setIsOpen(false);
          }}
          title={"Review margin swap"}
        />
        <div className="card-spacing">
          {/*{!isSettledSwap && !isRevertedApprove && (*/}
          <div className="flex flex-col gap-3">
            <ReadonlyTokenAmountCard
              token={tokenA}
              amount={typedValue}
              amountUSD={priceA ? formatFloat(priceA * +typedValue) : ""}
              standard={tokenAStandard}
              title={t("you_pay")}
            />
            <ReadonlyTokenAmountCard
              token={tokenB}
              amount={output}
              amountUSD={priceB ? formatFloat(priceB * +output) : ""}
              standard={tokenBStandard}
              title={t("you_receive")}
            />
          </div>
          {/*)}*/}
          {/*{(isSettledSwap || isRevertedApprove) && (*/}
          {/*  <div>*/}
          {/*    <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">*/}
          {/*      {(isRevertedSwap || isRevertedApprove) && <EmptyStateIcon iconName="warning" />}*/}

          {/*      {isSuccessSwap && (*/}
          {/*        <>*/}
          {/*          <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />*/}
          {/*          <Svg*/}
          {/*            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"*/}
          {/*            iconName={"success"}*/}
          {/*            size={65}*/}
          {/*          />*/}
          {/*        </>*/}
          {/*      )}*/}
          {/*    </div>*/}

          {/*    <div className="flex justify-center">*/}
          {/*      <span className="text-20 font-bold text-primary-text mb-1">*/}
          {/*        {isRevertedSwap && t("swap_failed")}*/}
          {/*        {isSuccessSwap && t("successful_swap")}*/}
          {/*        {isRevertedApprove && "Approve failed"}*/}
          {/*      </span>*/}
          {/*    </div>*/}

          {/*    <div className="flex justify-center gap-2 items-center">*/}
          {/*      <Image*/}
          {/*        src={tokenA?.logoURI || "/images/tokens/placeholder.svg"}*/}
          {/*        alt=""*/}
          {/*        width={24}*/}
          {/*        height={24}*/}
          {/*      />*/}
          {/*      <span>*/}
          {/*        {typedValue} {tokenA?.symbol}*/}
          {/*      </span>*/}
          {/*      <Svg className="text-tertiary-text" iconName="next" />*/}
          {/*      <Image*/}
          {/*        src={tokenB?.logoURI || "/images/tokens/placeholder.svg"}*/}
          {/*        alt=""*/}
          {/*        width={24}*/}
          {/*        height={24}*/}
          {/*      />*/}
          {/*      <span>*/}
          {/*        {output} {tokenB?.symbol}*/}
          {/*      </span>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}
          <div className="pb-4 flex flex-col gap-2 rounded-b-3 text-14 mt-4">
            <SwapDetailsRow
              title={t("network_fee")}
              value={
                <div>
                  <span className="text-secondary-text mr-1 text-14">
                    {computedGasSpending} GWEI
                  </span>{" "}
                  <span className="mr-1 text-14">
                    {priceNative && `~$${formatFloat(priceNative * +computedGasSpending)}`}
                  </span>
                </div>
              }
              tooltipText={t("network_fee_tooltip", {
                networkName: networks.find((n) => n.chainId === chainId)?.name,
              })}
            />
            <SwapDetailsRow
              title={t("minimum_received")}
              value={
                trade
                  ?.minimumAmountOut(new Percent(slippage * 100, 10000), dependentAmount)
                  .toSignificant() || "Loading..."
              }
              tooltipText={t("minimum_received_tooltip")}
            />
            <SwapDetailsRow
              title={t("price_impact")}
              value={trade ? `${formatFloat(trade.priceImpact.toSignificant())}%` : "Loading..."}
              tooltipText={t("price_impact_tooltip")}
            />
            <SwapDetailsRow
              title={t("trading_fee")}
              value={
                typedValue && Boolean(+typedValue) && tokenA
                  ? `${(+typedValue * 0.3) / 100} ${tokenA.symbol}`
                  : "Loading..."
              }
              tooltipText={t("trading_fee_tooltip")}
            />
            <SwapDetailsRow
              title={t("order_routing")}
              value={t("direct_swap")}
              tooltipText={t("route_tooltip")}
            />
            <SwapDetailsRow
              title={t("maximum_slippage")}
              value={`${slippage}%`}
              tooltipText={t("maximum_slippage_tooltip")}
            />
            <SwapDetailsRow
              title={t("gas_limit")}
              value={
                customGasLimit
                  ? customGasLimit.toString()
                  : (estimatedGas + BigInt(30000)).toString() || "Loading..."
              }
              tooltipText={t("gas_limit_tooltip")}
            />
          </div>
          {/*{isProcessing && <div className="h-px w-full bg-secondary-border mb-4 mt-5" />}*/}
          <SwapActionButton
            isEditApproveActive={isEditApproveActive}
            amountToApprove={amountToApprove}
          />
        </div>
      </div>
    </DrawerDialog>
  );
}
