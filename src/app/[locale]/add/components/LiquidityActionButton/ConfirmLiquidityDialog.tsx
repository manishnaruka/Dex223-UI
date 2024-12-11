import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { formatEther, formatGwei } from "viem";

import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Alert from "@/components/atoms/Alert";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { usePositionPrices, usePositionRangeStatus } from "@/hooks/usePositions";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Standard } from "@/sdk_hybrid/standard";
import { GasOption } from "@/stores/factories/createGasPriceStore";
import { EstimatedGasId, useEstimatedGasStoreById } from "@/stores/useEstimatedGasStore";

import { useAddLiquidity, useAddLiquidityEstimatedGas } from "../../hooks/useAddLiquidity";
import {
  ApproveTransaction,
  ApproveTransactionType,
  useLiquidityApprove,
} from "../../hooks/useLiquidityApprove";
import { usePriceRange } from "../../hooks/usePrice";
import { useSortedTokens } from "../../hooks/useSortedTokens";
import { useV3DerivedMintInfo } from "../../hooks/useV3DerivedMintInfo";
import { Field, useTokensStandards } from "../../stores/useAddLiquidityAmountsStore";
import {
  useAddLiquidityGasLimitStore,
  useAddLiquidityGasPrice,
  useAddLiquidityGasPriceStore,
} from "../../stores/useAddLiquidityGasSettings";
import {
  AddLiquidityApproveStatus,
  AddLiquidityStatus,
  useAddLiquidityStatusStore,
} from "../../stores/useAddLiquidityStatusStore";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useConfirmLiquidityDialogStore } from "../../stores/useConfirmLiquidityDialogOpened";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { TransactionItem } from "./TransactionItem";

const gasOptionTitle: Record<GasOption, any> = {
  [GasOption.CHEAP]: "cheap",
  [GasOption.FAST]: "fast",
  [GasOption.CUSTOM]: "custom",
};

export const APPROVE_BUTTON_TEXT = {
  [ApproveTransactionType.ERC20_AND_ERC223]: "button_approve_and_deposit",
  [ApproveTransactionType.ERC20]: "button_approve",
  [ApproveTransactionType.ERC223]: "button_deposit",
};

interface TransactionItem {
  transaction: ApproveTransaction;
  standard: Standard;
}

function isDefinedTransactionItem(item: {
  transaction?: ApproveTransaction;
  standard: Standard;
}): item is TransactionItem {
  return !!item.transaction;
}

const ApproveDialog = () => {
  const t = useTranslations("Liquidity");
  const tSwap = useTranslations("Swap");

  const { setIsOpen } = useConfirmLiquidityDialogStore();
  const { setStatus } = useAddLiquidityStatusStore();

  const chainId = useCurrentChainId();
  const chainSymbol = getChainSymbol(chainId);
  const gasPrice = useAddLiquidityGasPrice();

  const { gasPriceOption } = useAddLiquidityGasPriceStore();

  const {
    handleApprove,
    approveTransactionsType,
    approveTransactions,
    approveTotalGasLimit,
    currentDepositA,
    currentDepositB,
  } = useLiquidityApprove();

  const isLoadingA20 = approveTransactions.approveA
    ? [AddLiquidityApproveStatus.LOADING].includes(approveTransactions.approveA?.status)
    : false;
  const isLoadingB20 = approveTransactions.approveB
    ? [AddLiquidityApproveStatus.LOADING].includes(approveTransactions.approveB?.status)
    : false;
  const isLoadingA223 = approveTransactions.depositA
    ? [AddLiquidityApproveStatus.LOADING].includes(approveTransactions.depositA?.status)
    : false;
  const isLoadingB223 = approveTransactions.depositB
    ? [AddLiquidityApproveStatus.LOADING].includes(approveTransactions.depositB?.status)
    : false;

  const isPendingA20 = approveTransactions.approveA
    ? [AddLiquidityApproveStatus.PENDING].includes(approveTransactions.approveA?.status)
    : false;
  const isPendingB20 = approveTransactions.approveB
    ? [AddLiquidityApproveStatus.PENDING].includes(approveTransactions.approveB?.status)
    : false;
  const isPendingA223 = approveTransactions.depositA
    ? [AddLiquidityApproveStatus.PENDING].includes(approveTransactions.depositA?.status)
    : false;
  const isPendingB223 = approveTransactions.depositB
    ? [AddLiquidityApproveStatus.PENDING].includes(approveTransactions.depositB?.status)
    : false;
  const isLoading = isLoadingA20 || isLoadingB20 || isLoadingA223 || isLoadingB223;
  const isPending = isPendingA20 || isPendingB20 || isPendingA223 || isPendingB223;

  // TODO change name of "token" field
  type TokenType = "tokenA" | "tokenB";
  const transactionItems = [
    {
      transaction: approveTransactions.approveA!,
      standard: Standard.ERC20,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.depositA
        ? {
            ...approveTransactions.depositA,
            amount: approveTransactions.depositA.amount - (currentDepositA || BigInt(0)),
          }
        : undefined,
      standard: Standard.ERC223,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.approveB,
      standard: Standard.ERC20,
      token: "tokenB" as TokenType,
    },
    {
      transaction: approveTransactions.depositB
        ? {
            ...approveTransactions.depositB,
            amount: approveTransactions.depositB.amount - (currentDepositB || BigInt(0)),
          }
        : undefined,
      standard: Standard.ERC223,
      token: "tokenB" as TokenType,
    },
  ].filter(isDefinedTransactionItem);

  const isAllowed = transactionItems
    .map(({ transaction }) => !!transaction?.isAllowed)
    .every(Boolean);

  const [customAmounts, setCustomAmounts] = useState(
    {} as { customAmountA?: bigint; customAmountB?: bigint },
  );

  const [fieldsErrors, setFieldsErrors] = useState(
    {} as {
      [key: string]: boolean;
    },
  );
  const setFieldError = (key: string, isError: boolean) => {
    setFieldsErrors({ ...fieldsErrors, [key]: isError });
  };
  const isFormInvalid = Object.values(fieldsErrors).includes(true);

  return (
    <>
      <DialogHeader
        onClose={() => {
          setIsOpen(false);
        }}
        title={`${t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)} ${t("approve_transaction_modal_title")}`}
      />
      <div className="w-full md:w-[570px] px-4 md:px-10 md:pb-10 pb-4 mx-auto">
        {transactionItems.map(({ transaction, standard, token }, index) => (
          <TransactionItem
            key={`${transaction?.token.symbol}_${standard}`}
            transaction={transaction}
            standard={standard}
            gasPrice={gasPrice}
            chainSymbol={chainSymbol}
            index={index}
            itemsCount={transactionItems.length}
            isError={fieldsErrors[token]}
            disabled={isLoading || isPending || isAllowed}
            setFieldError={(isError: boolean) => setFieldError(token, isError)}
            setCustomAmount={(amount: bigint) => {
              if (token === "tokenA") {
                setCustomAmounts({
                  ...customAmounts,
                  customAmountA: amount,
                });
              } else if (token === "tokenB") {
                setCustomAmounts({
                  ...customAmounts,
                  customAmountB: amount,
                });
              }
            }}
          />
        ))}
        <div className="w-full h-[2px] bg-tertiary-bg mb-5" /> {/* Line above */}
        {approveTotalGasLimit > 0 ? (
          <div className="flex items-center gap-2 px-5 py-2 bg-tertiary-bg rounded-3 mb-5 flex-nowrap">
            <div className="flex flex-grow gap-8 md:justify-start w-full">
              <div className="flex flex-col min-w-0">
                <div className="text-secondary-text flex items-center gap-1 text-14">
                  {t("gas_price")}
                </div>
                <span className="text-secondary-text text-16 truncate">
                  {gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-secondary-text text-14">{t("total_network_fee")}</div>
                <span className="truncate">
                  {`${gasPrice && approveTotalGasLimit ? formatFloat(formatEther(gasPrice * approveTotalGasLimit)) : ""} ${chainSymbol}`}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 w-auto">
              <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border">
                {tSwap(gasOptionTitle[gasPriceOption])}
              </span>
            </div>
          </div>
        ) : null}
        {isFormInvalid ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">{t("enter_correct_values")}</span>
          </Button>
        ) : isPending ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">
              <Preloader size={20} color="green" type="linear" />
            </span>
          </Button>
        ) : isLoading ? (
          <Button fullWidth isLoading>
            {t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)}
            <span className="flex items-center gap-2">
              <Preloader size={20} color="black" type="circular" />
            </span>
          </Button>
        ) : isAllowed ? (
          <Button
            onClick={() => {
              setStatus(AddLiquidityStatus.MINT);
            }}
            fullWidth
          >
            Preview liquidity
          </Button>
        ) : (
          <Button
            onClick={() =>
              handleApprove({
                customAmountA: customAmounts?.customAmountA,
                customAmountB: customAmounts?.customAmountB,
              })
            }
            fullWidth
          >
            {t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)}
          </Button>
        )}
      </div>
    </>
  );
};

const MintDialog = ({ increase = false, tokenId }: { increase?: boolean; tokenId?: string }) => {
  const tSwap = useTranslations("Swap");
  const t = useTranslations("Liquidity");
  const { setIsOpen } = useConfirmLiquidityDialogStore();
  const chainId = useCurrentChainId();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { token0, token1 } = useSortedTokens({
    tokenA,
    tokenB,
  });
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const [showFirst, setShowFirst] = useState(true);
  const { liquidityHash, status } = useAddLiquidityStatusStore();
  const { updateAllowance } = useLiquidityApprove();
  const { gasPriceOption } = useAddLiquidityGasPriceStore();

  const { parsedAmounts, position, noLiquidity } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  // Gas price
  const gasPrice = useAddLiquidityGasPrice();

  const buttonText = increase
    ? "Add liquidity"
    : noLiquidity
      ? "Create Pool & Mint liquidity"
      : "Mint liquidity";
  const { inRange } = usePositionRangeStatus({ position });

  const { minPriceString, maxPriceString, currentPriceString } = usePositionPrices({
    position,
    showFirst,
  });

  const { handleAddLiquidity } = useAddLiquidity({
    position,
    increase,
    createPool: noLiquidity,
    tokenId,
  });

  useAddLiquidityEstimatedGas({
    position,
    increase,
    createPool: noLiquidity,
    tokenId,
  });

  const { customGasLimit } = useAddLiquidityGasLimitStore();
  const estimatedMintGas = useEstimatedGasStoreById(EstimatedGasId.mint);
  const gasToUse = customGasLimit ? customGasLimit : estimatedMintGas + BigInt(30000); // set custom gas here if user changed it

  if (!tokenA || !tokenB) {
    return null;
  }

  return (
    <>
      <DialogHeader onClose={() => setIsOpen(false)} title="Add liquidity" />
      <div className="px-4 md:px-10 pb-4 md:pb-10 h-[80dvh] md:h-auto flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center relative w-12 h-[34px]">
                <div className="absolute left-0 top-0 w-[34px] h-[34px] items-center justify-center">
                  <Image width={32} height={32} src={tokenA.logoURI as any} alt="" />
                </div>
                <div className="w-[34px] h-[34px] flex absolute right-0 top-0 bg-tertiary-bg rounded-full items-center justify-center">
                  <Image width={32} height={32} src={tokenB.logoURI as any} alt="" />
                </div>
              </div>
              <span className="text-18 font-bold">{`${tokenA.symbol} / ${tokenB.symbol}`}</span>
              <RangeBadge
                status={inRange ? PositionRangeStatus.IN_RANGE : PositionRangeStatus.OUT_OF_RANGE}
              />
            </div>
            <div className="flex items-center gap-2 justify-end mr-1">
              {liquidityHash && (
                <a
                  target="_blank"
                  href={getExplorerLink(ExplorerLinkType.TRANSACTION, liquidityHash, chainId)}
                >
                  <IconButton iconName="forward" />
                </a>
              )}
              {status === AddLiquidityStatus.MINT_PENDING && (
                <>
                  <Preloader type="linear" />
                  <span className="text-secondary-text text-14">Proceed in your wallet</span>
                </>
              )}
              {status === AddLiquidityStatus.MINT_LOADING && <Preloader size={20} />}
              {status === AddLiquidityStatus.SUCCESS && (
                <Svg className="text-green" iconName="done" size={20} />
              )}
            </div>
          </div>
          {/* Amounts */}
          <div className="flex flex-col rounded-3 bg-tertiary-bg p-5 mt-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
                <div className="flex items-center gap-2">
                  <Image width={24} height={24} src={tokenA.logoURI as any} alt="" />
                  <span>{tokenA.symbol}</span>
                  <Badge color="green" text={tokenAStandard} />
                </div>
                <span className="text-16 font-medium">
                  {formatFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "")}
                </span>
              </div>
              <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
                <div className="flex items-center gap-2">
                  <Image width={24} height={24} src={tokenB.logoURI as any} alt="" />
                  <span>{tokenB.symbol}</span>
                  <Badge color="green" text={tokenBStandard} />
                </div>
                <span className="text-16 font-medium">
                  {formatFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "")}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold">Fee Tier</span>
              <span>{`${FEE_AMOUNT_DETAIL[tier].label}%`}</span>
            </div>
          </div>
          {/* Price range */}
          <div>
            <div className="flex justify-between items-center mb-3 mt-5">
              <span className="font-bold text-secondary-text">Selected range</span>
              <div className="flex gap-0.5 bg-secondary-bg rounded-2 p-0.5">
                <button
                  onClick={() => setShowFirst(true)}
                  className={clsx(
                    "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                    showFirst
                      ? "bg-green-bg border-green text-primary-text"
                      : "hocus:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                  )}
                >
                  {tokenA?.symbol}
                </button>
                <button
                  onClick={() => setShowFirst(false)}
                  className={clsx(
                    "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                    !showFirst
                      ? "bg-green-bg border-green text-primary-text"
                      : "hocus:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                  )}
                >
                  {tokenB?.symbol}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_20px_1fr] mb-3">
              <PositionPriceRangeCard
                showFirst={showFirst}
                token0={token0}
                token1={token1}
                price={minPriceString}
              />
              <div className="relative">
                <div className="bg-primary-bg w-12 h-12 rounded-full text-tertiary-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Svg iconName="double-arrow" />
                </div>
              </div>
              <PositionPriceRangeCard
                showFirst={showFirst}
                token0={token0}
                token1={token1}
                price={maxPriceString}
                isMax
              />
            </div>
            <div className="rounded-3 overflow-hidden">
              <div className="bg-tertiary-bg flex items-center justify-center flex-col py-3">
                <div className="text-14 text-secondary-text">Current price</div>
                <div className="text-18">{currentPriceString}</div>
                <div className="text-14 text-secondary-text">
                  {showFirst
                    ? `${token0?.symbol} per ${token1?.symbol}`
                    : `${token1?.symbol} per ${token0?.symbol}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*<div className="overflow-hidden md:h-auto flex-shrink-0">*/}
        {/* GAS */}
        <div className="flex flex-col md:flex-row items-center gap-2 px-5 py-2 bg-tertiary-bg rounded-3 mb-5 mt-5">
          {/* First row container with custom 66.67% width */}
          <div className="flex w-full md:w-5/6 gap-8 justify-between md:justify-start">
            <div className="flex flex-col">
              <div className="text-secondary-text flex items-center gap-1 text-14">
                {t("gas_price")}
              </div>
              <span className="text-secondary-text text-16">
                {gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI
              </span>
            </div>
            <div className="flex flex-col">
              <div className="text-secondary-text text-14">{t("gas_limit")}</div>
              <span className="text-secondary-text text-16">{gasToUse.toString()}</span>
            </div>
            <div className="flex flex-col">
              <div className="text-secondary-text text-14">{tSwap("network_fee")}</div>
              <span>{`${gasPrice ? formatFloat(formatEther(gasPrice * gasToUse)) : ""} ${getChainSymbol(chainId)}`}</span>
            </div>
          </div>

          {/* Second row container with custom 33.33% width */}
          <div className="flex w-full md:w-1/6 items-center gap-2 mt-2 md:mt-0">
            <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border">
              {tSwap(gasOptionTitle[gasPriceOption])}
            </span>
          </div>
        </div>

        {AddLiquidityStatus.MINT_LOADING === status ? (
          <Button fullWidth isLoading={true}>
            <span className="flex items-center gap-2">
              {buttonText}
              <Preloader size={20} color="black" type="circular" />
            </span>
          </Button>
        ) : AddLiquidityStatus.MINT_PENDING === status ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">
              <Preloader size={20} color="green" type="linear" />
            </span>
          </Button>
        ) : (
          <Button
            onClick={() => {
              handleAddLiquidity({ updateAllowance }).then();
            }}
            fullWidth
          >
            {buttonText}
          </Button>
        )}
      </div>
    </>
  );
};

const SuccessfulDialog = ({ isError = false }: { isError?: boolean }) => {
  const { setIsOpen } = useConfirmLiquidityDialogStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { liquidityHash } = useAddLiquidityStatusStore();
  const { parsedAmounts } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });
  const t = useTranslations("Liquidity");

  return (
    <>
      <DialogHeader onClose={() => setIsOpen(false)} title="Add liquidity" />
      <div className="px-4 md:px-10 pb-4 md:pb-10 h-[80dvh] md:h-auto overflow-y-auto">
        <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
          {isError ? (
            <EmptyStateIcon iconName="warning" />
          ) : (
            <>
              <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />
              <Svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                iconName={"success"}
                size={65}
              />
            </>
          )}
        </div>

        <div className="flex justify-center">
          <span
            className={clsx(
              "text-20 font-bold mb-1",
              isError ? "text-red-light" : "text-primary-text",
            )}
          >
            {isError ? "Failed to add liquidity" : "Liquidity added successfully"}
          </span>
        </div>

        <div className="flex justify-center gap-2 items-center mb-3">
          <Image
            src={tokenA?.logoURI || "/images/tokens/placeholder.svg"}
            alt=""
            width={24}
            height={24}
          />
          <span>
            {formatFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "")} {tokenA?.symbol}
          </span>
          <Svg iconName="add" />
          <Image
            src={tokenB?.logoURI || "/images/tokens/placeholder.svg"}
            alt=""
            width={24}
            height={24}
          />
          <span>
            {formatFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "")} {tokenB?.symbol}
          </span>
        </div>
        {isError ? null : (
          <Link href="/pools/positions">
            <div className="flex gap-2 text-green justify-center" onClick={() => setIsOpen(false)}>
              View my liquidity positions
              <Svg iconName="forward" />
            </div>
          </Link>
        )}
        <div className="h-px w-full bg-secondary-border mb-4 mt-5" />
        {/* <ApproveRow /> */}
        {/* LIQUIDITY ROW */}
        <div className="grid grid-cols-[32px_1fr_1fr] gap-2 h-10">
          <div className="flex items-center h-full">
            <div
              className={clsx(
                "p-1 rounded-full h-8 w-8",
                isError ? "bg-red-bg text-red-light" : "bg-green text-secondary-bg",
              )}
            >
              <Svg className="" iconName="add" />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-14 font-medium text-primary-text">
              {isError ? "Failed to add liquidity" : "Liquidity added "}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {liquidityHash && (
              <a
                target="_blank"
                href={getExplorerLink(
                  ExplorerLinkType.TRANSACTION,
                  liquidityHash,
                  DexChainId.SEPOLIA,
                )}
              >
                <IconButton iconName="forward" />
              </a>
            )}
            {isError ? (
              <Svg className="text-red-light" iconName="warning" size={24} />
            ) : (
              <Svg className="text-green" iconName="done" size={24} />
            )}
          </div>
        </div>
        {isError ? (
          <div className="flex flex-col gap-5 mt-4">
            <Alert
              withIcon={false}
              type="error"
              text={
                <span>
                  {t("failed_transaction_error_message")}{" "}
                  <a href="#" className="text-green hocus:text-green-hover underline">
                    {t("common_errors")}
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
        ) : null}
      </div>
    </>
  );
};

export default function ConfirmLiquidityDialog({
  increase = false,
  tokenId,
}: {
  increase?: boolean;
  tokenId?: string;
}) {
  const { isOpen, setIsOpen } = useConfirmLiquidityDialogStore();

  const { status } = useAddLiquidityStatusStore();
  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={(isOpen) => {
        setIsOpen(isOpen);
      }}
    >
      <div className="bg-primary-bg rounded-5 w-full md:w-[600px]">
        {[
          AddLiquidityStatus.INITIAL,
          AddLiquidityStatus.APPROVE_LOADING,
          AddLiquidityStatus.APPROVE_ERROR,
        ].includes(status) ? (
          <ApproveDialog />
        ) : null}
        {[
          AddLiquidityStatus.MINT,
          AddLiquidityStatus.MINT_PENDING,
          AddLiquidityStatus.MINT_LOADING,
        ].includes(status) ? (
          <MintDialog increase={increase} tokenId={tokenId} />
        ) : null}
        {[AddLiquidityStatus.SUCCESS].includes(status) ? <SuccessfulDialog /> : null}
        {[AddLiquidityStatus.MINT_ERROR].includes(status) ? <SuccessfulDialog isError /> : null}
      </div>
    </DrawerDialog>
  );
}
