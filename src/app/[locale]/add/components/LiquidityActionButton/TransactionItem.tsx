import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useMediaQuery } from "react-responsive";
import { formatEther, formatUnits, parseUnits } from "viem";

import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import IconButton from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { Standard } from "@/sdk_hybrid/standard";

import { ApproveTransaction } from "../../hooks/useLiquidityApprove";
import { AddLiquidityApproveStatus } from "../../stores/useAddLiquidityStatusStore";
import { RemoveLiquidityStatus } from "@/app/[locale]/remove/[tokenId]/stores/useRemoveLiquidityStatusStore";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { useAccount } from "wagmi";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";
import { useTransactionSpeedUpDialogStore } from "@/components/dialogs/stores/useTransactionSpeedUpDialogStore";

export const TransactionItem = ({
  transaction,
  standard,
  gasPrice,
  chainSymbol,
  index,
  itemsCount,
  isError,
  setFieldError,
  setCustomAmount,
  disabled = false,
}: {
  transaction?: ApproveTransaction;
  gasPrice: any;
  chainSymbol: string;
  standard: Standard;
  index: number;
  itemsCount: number;
  isError: boolean;
  setFieldError: (isError: boolean) => void;
  setCustomAmount: (amount: bigint) => void;
  disabled?: boolean;
}) => {
  const tSwap = useTranslations("Swap");
  const t = useTranslations("Liquidity");
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  const chainId = useCurrentChainId();
  const [localValue, setLocalValue] = useState(
    formatUnits(transaction?.amount || BigInt(0), transaction?.token.decimals || 18),
  );
  const localValueBigInt = useMemo(() => {
    if (!transaction) return BigInt(0);
    return parseUnits(localValue, transaction.token.decimals);
  }, [localValue, transaction]);

  const { address: accountAddress } = useAccount();
  const { transactions } = useRecentTransactionsStore();
  const { handleSpeedUp, handleCancel, replacement } = useTransactionSpeedUpDialogStore();

  const recentTransaction = useMemo(() => {
    if (transaction?.hash && accountAddress) {
      const txs = transactions[accountAddress];
      for (let tx of txs) {
        if (tx.hash === transaction?.hash) {
          return tx;
        }
      }
    }
  }, [accountAddress, transaction?.hash, transactions]);

  const updateValue = (value: string) => {
    if (!transaction?.token) return;
    setLocalValue(value);
    const valueBigInt = parseUnits(value, transaction.token.decimals);
    setCustomAmount(valueBigInt);

    if (transaction.amount) {
      setFieldError(valueBigInt < transaction.amount);
    }
  };
  if (!transaction) return null;

  const { token, amount, estimatedGas, isAllowed, status, hash } = transaction;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center rounded-full min-h-10 min-w-10 w-10 h-10 bg-green-bg">
          {index + 1}
        </div>
        {index + 1 < itemsCount ? (
          <div className="w-[2px] bg-green-bg h-full my-2 rounded-3"></div>
        ) : null}
      </div>
      <div className="w-full">
        <div
          className={clsxMerge(
            "flex justify-between items-start",
            status === AddLiquidityApproveStatus.PENDING && "flex-col md:flex-row md:mb-0 pb-2",
          )}
        >
          <div className="flex gap-2 py-2 items-center flex-wrap">
            <span className="flex-wrap items-center gap-1 text-secondary-text">
              {`${standard === Standard.ERC20 ? "Approve" : "Deposit"} for ${token.symbol}`}
              <Badge
                color="green"
                text={standard}
                className="inline-block ml-2 relative -top-0.5"
              />
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Speed Up button */}
            {recentTransaction && status === AddLiquidityApproveStatus.LOADING && (
              <Button
                className="md:mt-2 relative hidden md:block"
                colorScheme={ButtonColor.LIGHT_GREEN}
                variant={ButtonVariant.CONTAINED}
                size={ButtonSize.EXTRA_SMALL}
                onClick={() => handleSpeedUp(recentTransaction)}
              >
                {recentTransaction.replacement === "repriced" && (
                  <span className="absolute -top-1.5 right-0.5 text-green">
                    <Svg size={16} iconName="speed-up" />
                  </span>
                )}
                <span className="text-12 font-medium pb-[3px] pt-[1px] flex items-center flex-row text-nowrap">
                  {t("speed_up")}
                </span>
              </Button>
            )}

            {localValueBigInt !== amount &&
              !disabled &&
              ![
                AddLiquidityApproveStatus.PENDING,
                AddLiquidityApproveStatus.LOADING,
                AddLiquidityApproveStatus.SUCCESS,
              ].includes(status) && (
                <div
                  className="flex gap-2 text-secondary-text text-12 mt-2.5 md:mt-2 md:text-16 font-medium cursor-pointer hocus:text-green-hover duration-200"
                  onClick={() => {
                    updateValue(formatUnits(amount, token.decimals));
                  }}
                >
                  <span className="mt-0.5 md:mt-0">{t("set_default")}</span>
                  <Svg iconName="reset" size={isMobile ? 20 : 24} />
                </div>
              )}

            {hash && (
              <div className="max-h-8 flex items-start">
                <a
                  target="_blank"
                  href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, chainId)}
                >
                  <IconButton iconName="forward" />
                </a>
              </div>
            )}

            {status === AddLiquidityApproveStatus.PENDING && (
              <span className="flex gap-2 mt-2 flex-nowrap">
                <Preloader type="linear" />
                <span className="text-secondary-text text-14 text-nowrap">
                  Proceed in your wallet
                </span>
              </span>
            )}
            {status === AddLiquidityApproveStatus.LOADING ? (
              <div className="flex mt-2 items-center">
                <Preloader size={20} />
              </div>
            ) : (
              (isAllowed || status === AddLiquidityApproveStatus.SUCCESS) && (
                <div className="flex mt-2 items-center">
                  <Svg className="text-green" iconName="done" size={20} />
                </div>
              )
            )}
          </div>
        </div>

        {/* Speed Up button - on Mobile */}
        {recentTransaction && status === AddLiquidityApproveStatus.LOADING && (
          <Button
            className="relative md:hidden rounded-5"
            fullWidth
            colorScheme={ButtonColor.LIGHT_GREEN}
            variant={ButtonVariant.CONTAINED}
            size={ButtonSize.SMALL}
            onClick={() => handleSpeedUp(recentTransaction)}
          >
            {recentTransaction.replacement === "repriced" && (
              <span className="absolute -top-2 right-4 text-green">
                <Svg size={20} iconName="speed-up" />
              </span>
            )}
            <span className="text-14 font-medium pb-[5px] pt-[5px] flex items-center flex-row text-nowrap">
              {t("speed_up")}
            </span>
          </Button>
        )}

        <div
          className={clsxMerge(
            "flex justify-between px-5 py-3 -mb-1 rounded-3 mt-2 border border-transparent",
            isError
              ? "border border-red-light hocus:border-red-light hocus:shadow hocus:shadow-red-light-shadow/60"
              : " ",
            disabled ? "border-secondary-border bg-primary-bg" : "bg-secondary-bg",
          )}
        >
          <NumericFormat
            allowedDecimalSeparators={[","]}
            decimalScale={token?.decimals}
            inputMode="decimal"
            placeholder="0.0"
            className={clsx("bg-transparent text-primary-text outline-0 border-0 w-full peer")}
            type="text"
            value={localValue}
            onValueChange={(values) => {
              updateValue(values.value);
            }}
            allowNegative={false}
            disabled={disabled}
          />
          <span className="text-secondary-text min-w-max">{`Amount ${token.symbol}`}</span>
        </div>
        {isError ? (
          <span className="text-12 text-red-light">
            {t("must_be_at_least", {
              val: `${formatUnits(amount, token.decimals)} ${token.symbol}`,
            })}
          </span>
        ) : (
          <div className="h-6"></div>
        )}

        <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-4 mt-1">
          <div className="flex gap-1">
            <span className="text-16 text-secondary-text">{tSwap("network_fee")}:</span>
            <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : ""} ${chainSymbol}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
