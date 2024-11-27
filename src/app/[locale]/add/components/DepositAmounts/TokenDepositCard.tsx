import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { formatUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import truncateMiddle from "@/functions/truncateMiddle";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useRevoke, { useRevokeEstimatedGas } from "@/hooks/useRevoke";
import useWithdraw, { useWithdrawEstimatedGas } from "@/hooks/useWithdraw";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { getTokenAddressForStandard, Standard } from "@/sdk_hybrid/standard";

import { RevokeDialog } from "./RevokeDialog";

export const InputRange = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [locValue, setValue] = useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value));
  };

  const handleMouseUp = () => {
    let newValue = locValue >= 50 ? 100 : 0;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative h-6">
      <input
        value={locValue}
        max={100}
        step={5}
        min={0}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className={clsx(
          "w-full accent-green absolute top-2 left-0 right-0 duration-200 !bg-purple",
          locValue < 50 && "variant-purple",
        )}
        type="range"
      />
      <div
        className="pointer-events-none absolute bg-green h-2 rounded-l-1 left-0 top-2"
        style={{ width: value === 1 ? 0 : `calc(${locValue}% - ${(locValue / 100) * 20}px)` }}
      />
    </div>
  );
};

function InputTotalAmount({
  currency,
  value,
  onChange,
  isDisabled,
  tokenStandardRatio = 0,
}: {
  currency?: Currency;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  tokenStandardRatio: number;
}) {
  const { address } = useAccount();

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: token0Balance, refetch: refetchBalance0 } = useBalance({
    address: currency ? address : undefined,
    token: currency && !currency.isNative ? currency.address0 : undefined,
    query: {
      enabled: Boolean(currency),
    },
  });
  const { data: token1Balance, refetch: refetchBalance1 } = useBalance({
    address: currency ? address : undefined,
    token: currency && !currency.isNative ? currency.address1 : undefined,
    query: {
      enabled: Boolean(currency),
    },
  });

  useEffect(() => {
    refetchBalance0();
    refetchBalance1();
  }, [blockNumber, refetchBalance0, refetchBalance1]);

  const totalBalance = currency?.isNative
    ? token0Balance?.value || BigInt(0)
    : (token0Balance?.value || BigInt(0)) + (token1Balance?.value || BigInt(0));

  const maxBalance = currency?.isNative
    ? token0Balance?.value || BigInt(0)
    : (token0Balance?.value || BigInt(0)) * BigInt(100 - tokenStandardRatio) +
      (token1Balance?.value || BigInt(0)) * BigInt(tokenStandardRatio / 100);

  const maxHandler = () => {
    if (currency) {
      onChange(formatFloat(formatUnits(maxBalance, currency.decimals)));
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  const t = useTranslations("Liquidity");

  const currencySymbolShort = truncateMiddle(currency?.symbol || "", {
    charsFromStart: 20,
    charsFromEnd: 0,
  });
  const currencySymbolShortX2 = truncateMiddle(currency?.symbol || "", {
    charsFromStart: 14,
    charsFromEnd: 0,
  });

  return (
    <div
      className={clsx(
        "bg-secondary-bg p-4 lg:p-5 pb-3 lg:pb-4 rounded-3 border hocus:shadow hocus:shadow-green/60",
        isFocused ? "border border-green shadow shadow-green/60" : "border-transparent",
      )}
    >
      <div className="mb-1 flex justify-between items-center">
        <NumericFormat
          allowedDecimalSeparators={[","]}
          decimalScale={currency?.decimals}
          inputMode="decimal"
          placeholder="0.0"
          className={clsx("bg-transparent outline-0 border-0 text-20 w-full peer")}
          type="text"
          value={value}
          onValueChange={(values) => {
            onChange(values.value);
          }}
          allowNegative={false}
          disabled={isDisabled}
          onFocus={() => setIsFocused(true)} // Set focus state when NumericFormat is focused
          onBlur={() => setIsFocused(false)} // Remove focus state when NumericFormat loses focus
        />
        <div className="justify-end bg-secondary-bg rounded-5 py-1 pl-1 flex items-center gap-2 min-w-[88px]">
          {currency ? (
            <div
              className={`rounded-3 gap-2 p-1 flex flex-row items-center flex-nowrap ${isDisabled ? "bg-tertiary-bg" : ""}`}
            >
              <Image
                src={currency?.logoURI || "/images/tokens/placeholder.svg"}
                alt=""
                width={24}
                height={24}
              />
              <span className="text-nowrap pr-8">{currencySymbolShortX2}</span>
            </div>
          ) : (
            <div
              className={`rounded-3 gap-2 p-1 flex flex-row items-center flex-nowrap ${isDisabled ? "bg-tertiary-bg" : ""}`}
            >
              <Image src={"/images/tokens/placeholder.svg"} alt="" width={24} height={24} />
              <span className="text-nowrap pr-8">{t("select_token")}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-secondary-text text-12 lg:text-14">—</span>
        <div className="flex gap-1">
          <span className="text-12 text-tertiary-text md:text-tertiary-text md:text-14">
            {currency
              ? t("balance", {
                  balance: formatFloat(formatUnits(totalBalance, currency.decimals)),
                  symbol: currencySymbolShort,
                })
              : "—"}
          </span>
          {currency && (
            <Button
              variant={ButtonVariant.CONTAINED}
              size={ButtonSize.EXTRA_SMALL}
              className="bg-tertiary-bg text-green md:px-2 lg:px-2 xl:px-2 px-2 hocus:bg-green-bg"
              onClick={maxHandler}
            >
              {t("max_title")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// TODO: change standard inputs for native currency, 16.09.2024
function InputStandardAmount({
  standard,
  value,
  currency,
  status,
  currentAllowance,
  revokeHandler,
  // estimatedGas,
  // gasPrice,
}: {
  standard: Standard;
  value?: number | string;
  currency?: Currency;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  status: AllowanceStatus;
  revokeHandler: (customAmount?: bigint) => void; // onWithdraw or onWithdraw
  // gasPrice?: bigint;
  // estimatedGas: bigint | null;
}) {
  const t = useTranslations("Liquidity");
  const tSwap = useTranslations("Swap");
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: currency ? address : undefined,
    token: currency ? getTokenAddressForStandard(currency, standard) : undefined,
  });

  useEffect(() => {
    refetchBalance();
  }, [blockNumber, refetchBalance]);

  const chainId = useCurrentChainId();
  useRevokeEstimatedGas({
    token: currency,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  useWithdrawEstimatedGas({
    token: currency,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const currencySymbolShort = truncateMiddle(currency?.symbol || "", {
    charsFromStart: 15,
    charsFromEnd: 0,
  });

  const [isOpenedRevokeDialog, setIsOpenedRevokeDialog] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-1 lg:gap-2">
        <span className="text-secondary-text">{t("standard")}</span>
        <Badge color={standard === Standard.ERC20 ? "purple" : "green"} text={standard} />
        <Tooltip
          iconSize={20}
          text={standard === Standard.ERC20 ? tSwap("erc20_tooltip") : tSwap("erc223_tooltip")}
        />
      </div>
      <div className="bg-secondary-bg px-4 lg:px-5 pt-2 lg:pt-3 pb-3 lg:pb-4 w-full rounded-2">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="bg-transparent outline-0 text-16 w-full"
            placeholder="0"
            type="text"
            value={value || ""}
            disabled
            // onChange={(e) => onChange(e.target.value)}
            onChange={() => {}}
          />
        </div>
        <div className="flex justify-end items-center text-10 lg:text-12 text-tertiary-text">
          <span>
            {currency
              ? t("balance", {
                  balance: formatFloat(
                    formatUnits(tokenBalance?.value || BigInt(0), currency.decimals),
                  ),
                  symbol: currencySymbolShort,
                })
              : "—"}
          </span>
        </div>
      </div>
      <div className={clsx("flex justify-between items-center h-4")}>
        {currentAllowance > 0 ? (
          <>
            {currency && (
              <div className="flex items-center gap-1">
                <Tooltip
                  iconSize={16}
                  text={
                    standard === Standard.ERC20 ? t("approved_tooltip") : t("deposited_tooltip")
                  }
                />
                <span className="text-12 text-tertiary-text">
                  {standard === Standard.ERC20
                    ? t("approved", {
                        approved: formatFloat(
                          formatUnits(currentAllowance || BigInt(0), currency.decimals),
                        ),
                        symbol: currencySymbolShort,
                      })
                    : t("deposited", {
                        deposited: formatFloat(
                          formatUnits(currentAllowance || BigInt(0), currency.decimals),
                        ),
                        symbol: currencySymbolShort,
                      })}
                </span>
              </div>
            )}
            {!!currentAllowance ? (
              <span
                className="text-12 px-2 pt-[2px] pb-[2px] pl-4 pr-4 bg-green-bg text-secondary-text rounded-3 h-min cursor-pointer border-transparent border hocus:border-green hocus:bg-green-bg-hover hocus:text-primary-text duration-200"
                onClick={() => setIsOpenedRevokeDialog(true)}
              >
                {standard === Standard.ERC20 ? t("revoke") : t("withdraw")}
              </span>
            ) : null}
          </>
        ) : null}
      </div>
      {currency && currency.isToken && (
        <RevokeDialog
          isOpen={isOpenedRevokeDialog}
          setIsOpen={setIsOpenedRevokeDialog}
          standard={standard}
          token={currency}
          status={status}
          currentAllowance={currentAllowance}
          revokeHandler={revokeHandler}
          // estimatedGas={estimatedGas}
          // gasPrice={gasPrice}
        />
      )}
    </div>
  );
}

export default function TokenDepositCard({
  currency,
  value,
  formattedValue,
  onChange,
  isDisabled,
  isOutOfRange,
  tokenStandardRatio,
  setTokenStandardRatio,
  // gasPrice,
}: {
  currency?: Currency;
  value: CurrencyAmount<Currency> | undefined;
  formattedValue: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isOutOfRange: boolean;
  // tokenStandardRatio: 0 | 100;
  tokenStandardRatio: number;
  // setTokenStandardRatio: (ratio: 0 | 100) => void;
  setTokenStandardRatio: (ratio: number) => void;
  // gasPrice?: bigint;
}) {
  const t = useTranslations("Liquidity");

  const currencySymbolShort = truncateMiddle(currency?.symbol || "", {
    charsFromStart: 25,
    charsFromEnd: 0,
  });

  const chainId = useCurrentChainId();
  const valueBigInt = value ? BigInt(value.quotient.toString()) : BigInt(0);

  const ERC223Value = (valueBigInt * BigInt(tokenStandardRatio)) / BigInt(100);
  const ERC20Value = valueBigInt - ERC223Value;

  const {
    revokeHandler,
    currentAllowance: currentAllowance,
    revokeStatus,
  } = useRevoke({
    token: currency,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const {
    withdrawHandler,
    currentDeposit: currentDeposit,
    withdrawStatus,
  } = useWithdraw({
    token: currency,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  if (isOutOfRange) {
    return (
      <div className="flex justify-center items-center rounded-3 bg-tertiary-bg p-5 min-h-[320px]">
        <span className="text-center text-secondary-text">{t("out_of_range")}</span>
      </div>
    );
  }
  // if (!currency) return;

  return (
    <div
      className={`rounded-3 bg-tertiary-bg px-4 py-3 lg:p-5 ${
        isDisabled ? "pointer-events-none " : ""
      }`}
    >
      <div className={`flex items-center gap-2 mb-3`}>
        <Image
          width={24}
          height={24}
          src={currency?.logoURI || "/images/tokens/placeholder.svg"}
          alt=""
        />
        <h3 className={`text-16 font-bold text-secondary-text text-nowrap`}>
          {currency
            ? t("token_deposit_amounts", { symbol: currencySymbolShort })
            : t("select_token")}
        </h3>
      </div>
      <div className="flex flex-col gap-4 lg:gap-5">
        <InputTotalAmount
          currency={currency}
          value={formattedValue}
          onChange={onChange}
          isDisabled={isDisabled}
          tokenStandardRatio={tokenStandardRatio}
        />
        {currency?.isNative && currency ? null : (
          <>
            <InputRange value={tokenStandardRatio} onChange={setTokenStandardRatio} />
            <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
              <InputStandardAmount
                standard={Standard.ERC20}
                value={formatUnits(ERC20Value, currency?.decimals || 18)}
                currentAllowance={currentAllowance || BigInt(0)}
                currency={currency}
                revokeHandler={revokeHandler}
                status={revokeStatus}
                // estimatedGas={revokeEstimatedGas}
                // gasPrice={gasPrice}
              />
              <InputStandardAmount
                standard={Standard.ERC223}
                value={formatUnits(ERC223Value, currency?.decimals || 18)}
                currency={currency}
                currentAllowance={currentDeposit || BigInt(0)}
                revokeHandler={withdrawHandler}
                // estimatedGas={depositEstimatedGas}
                status={withdrawStatus}
                // gasPrice={gasPrice}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
