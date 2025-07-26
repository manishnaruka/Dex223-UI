"use client";
import ExternalTextLink from "@repo/ui/external-text-link";
import clsx from "clsx";
import { Formik } from "formik";
import Image from "next/image";
import React, { use, useEffect, useMemo, useState } from "react";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import * as Yup from "yup";

import { useOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import ReviewBorrowDialog from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/components/ReviewBorrowDialog";
import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderTokenSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokenSelect";
import { useConfirmBorrowPositionDialogStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { useBorrowRecentTransactionsStore } from "@/app/[locale]/margin-trading/stores/useBorrowRecentTransactionsStore";
import Collapse from "@/components/atoms/Collapse";
import { InputSize } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextField, { HelperText, InputLabel } from "@/components/atoms/TextField";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { ORACLE_ABI } from "@/config/abis/oracle";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { ORACLE_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

function getTokenOrAmountError({
  touchedAmount,
  touchedToken,
  amountError,
  tokenError,
}: {
  touchedAmount?: boolean;
  touchedToken?: boolean;
  amountError?: string;
  tokenError?: string;
}) {
  const errors = [];

  if (touchedToken && tokenError) {
    errors.push(tokenError);
  }

  if (touchedAmount && amountError) {
    errors.push(amountError);
  }

  return errors;
}

const schema = Yup.object({
  borrowAmount: Yup.number()
    .typeError("Loan amount must be a number")
    .required("Loan amount is required")
    .positive("Loan amount must be greater than zero"),
  collateralAmount: Yup.number()
    .typeError("Collateral amount must be a number")
    .required("Collateral amount is required")
    .positive("Collateral amount must be greater than zero"),
  // collateralToken: Yup.object().default(undefined).required("Please select a token"),
  // collateralTokenStandard: Yup.string()
  //   .oneOf([Standard.ERC20, Standard.ERC223])
  //   .required("Token standard is required"),
  collateralTokenId: Yup.number(),
  leverage: Yup.number()
    .typeError("Loan amount must be a number")
    .required("Loan amount is required")
    .positive("Loan amount must be greater than zero"),
});

type Marks = number[];

function getMarks(max: number): Marks {
  const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100];

  // 1. Визначаємо крок, щоб не більше 10 сегментів
  let step: number;
  if (max <= 10) {
    step = 1;
  } else {
    const rawStep = Math.ceil(max / 10);
    step = niceSteps.find((f) => f >= rawStep) ?? rawStep;
  }

  const marks: number[] = [];
  marks.push(1);
  for (let m = step; m < max; m += step) {
    if (m > 1) {
      marks.push(m);
    }
  }

  if (marks[marks.length - 1] !== max) {
    marks.push(max);
  }

  const threshold = Math.max(step - 4, 0);
  if (marks.length >= 2) {
    const penult = marks[marks.length - 2];
    if (max - penult < threshold) {
      marks.splice(marks.length - 2, 1);
    }
  }

  return marks;
}

function getPrice(inputAmount: bigint, outputAmount: bigint, scale: bigint = 10n ** 18n): number {
  return Number((outputAmount * scale) / inputAmount) / Number(scale);
}

function recalculateFromCollateral(collateral: number, leverage: number, price: number): number {
  return (collateral * (leverage - 1)) / price;
}

function recalculateFromBorrow(borrow: number, leverage: number, price: number): number {
  return (borrow * price) / (leverage - 1);
}

function recalculateLeverage(collateral: number, borrow: number, price: number): number {
  return (borrow * price) / collateral + 1;
}

export default function BorrowPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id: orderId } = use(params);
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useBorrowRecentTransactionsStore();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const { setIsOpen } = useConfirmBorrowPositionDialogStore();

  const { values: savedValues, setValues } = useCreateMarginPositionConfigStore();

  const { order, loading } = useOrder({ id: +orderId });

  const chainId = useCurrentChainId();

  const publicClient = usePublicClient();
  const [ratio, setRatio] = useState<number | undefined>();

  useEffect(() => {
    IIFE(async () => {
      console.log("Fired");

      if (!order?.baseAsset || !savedValues.collateralToken || !publicClient) {
        console.log("Returned");

        return;
      }

      if (order.baseAsset.equals(savedValues.collateralToken)) {
        setRatio(1);
        return;
      }

      console.log([
        order.baseAsset.wrapped.address0,
        savedValues.collateralToken.wrapped.address0,
        parseUnits("1", order.baseAsset.decimals),
      ]);
      try {
        const data = await publicClient.readContract({
          address: ORACLE_ADDRESS[chainId],
          abi: ORACLE_ABI,
          functionName: "getAmountOut",
          args: [
            order.baseAsset.wrapped.address0,
            savedValues.collateralToken.wrapped.address0,
            BigInt(100),
            // parseUnits("1", order.baseAsset.decimals),
          ],
        });
        console.log(data);
        const ratio = getPrice(data, BigInt(100));
        console.log(ratio);

        setRatio(ratio);
      } catch (e) {
        console.log(e);
      }
    });
  }, [chainId, order?.baseAsset, publicClient, savedValues.collateralToken]);

  console.log(ratio);

  if (loading || !order) {
    return "Loading...";
  }

  return (
    <div className="mx-auto w-[600px] my-10">
      <div className="card-spacing pt-2.5 bg-primary-bg rounded-5 grid gap-3">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="font-bold text-20">Borrow</h3>
          <div className="flex items-center relative left-3">
            <IconButton
              buttonSize={IconButtonSize.LARGE}
              active={showRecentTransactions}
              iconName="recent-transactions"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
          </div>
        </div>

        <Formik
          validationSchema={schema}
          initialValues={savedValues}
          onSubmit={(values) => {
            setValues(values);
            setIsOpen(true);
          }}
        >
          {({ values, touched, setFieldValue, errors, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="bg-tertiary-bg rounded-3 p-5 mb-4">
                <LendingOrderTokenSelect
                  label="Collateral amount"
                  token={values.collateralToken}
                  setToken={async (token: Currency) => {
                    setValues({ ...savedValues, collateralToken: token });
                    await setFieldValue("collateralToken", token);
                  }}
                  amount={values.collateralAmount}
                  setAmount={(collateralAmount: string) => {
                    const C = parseFloat(collateralAmount) || 0;
                    const L = parseFloat(values.leverage) || 1;

                    if (ratio) {
                      const B = recalculateFromCollateral(C, L, 1 / ratio);
                      setFieldValue("borrowAmount", B);
                    }

                    setFieldValue("collateralAmount", C);
                  }}
                  standard={values.collateralTokenStandard}
                  setStandard={async (standard: Standard) => {
                    await setFieldValue("collateralTokenStandard", standard);
                  }}
                  errors={getTokenOrAmountError({
                    touchedAmount: touched.collateralAmount,
                    touchedToken: touched.collateralToken,
                    tokenError: errors.collateralToken,
                    amountError: errors.collateralAmount,
                  })}
                  tokens={order.allowedCollateralAssets}
                  helperText={`Min collateral amount: ${+formatUnits(order.minLoan, order?.baseAsset.decimals ?? 18) * 1.01} ${values.collateralToken?.symbol}`}
                />
                <TextField
                  isNumeric
                  max={order.leverage}
                  min={1}
                  decimalScale={4}
                  label="Leverage"
                  helperText={`Max leverage: ${order.leverage}x`}
                  internalText="x"
                  tooltipText={"Tooltip text"}
                  value={values.leverage}
                  error={touched.leverage && errors.leverage}
                  onChange={(e) => {
                    const L = parseFloat(e.target.value) || 1;
                    const C = parseFloat(values.collateralAmount) || 0;

                    if (ratio) {
                      const B = recalculateFromCollateral(C, L, 1 / ratio);
                      setFieldValue("borrowAmount", B);
                    }
                    setFieldValue("leverage", L);
                  }}
                />
                <div className="mb-4 ">
                  <input
                    min={1}
                    max={order.leverage}
                    value={values.leverage}
                    onChange={(e) => {
                      const L = parseFloat(e.target.value) || 1;
                      const C = parseFloat(values.collateralAmount) || 0;

                      if (ratio) {
                        const B = recalculateFromCollateral(C, L, 1 / ratio);
                        setFieldValue("borrowAmount", B);
                      }
                      setFieldValue("leverage", L);
                    }}
                    step={1}
                    type="range"
                    className="mb-1.5 w-full"
                    style={{
                      backgroundImage: `linear-gradient(to right, #7DA491 0%, #7DA491 ${((+values.leverage - 1) / (order.leverage - 1)) * 100}%, #0F0F0F ${values?.leverage}%, #0F0F0F 100%)`,
                    }}
                  />

                  <div className="z-10 relative text-12 text-secondary-text px-[13px]">
                    <div className="relative">
                      {getMarks(order.leverage).map((_, i) => (
                        <span
                          key={_}
                          className={clsx(
                            "min-w-[28px] flex justify-center absolute before:h-3 before:w-0.5 before:absolute before:left-1/2 before:-top-[16px] before:-translate-x-1/2 before:pointer-events-none -translate-x-1/2",
                            +values.leverage <= _
                              ? "before:bg-quaternary-bg"
                              : "before:bg-green-hover",
                          )}
                          style={{ left: `${((_ - 1) / (order.leverage - 1)) * 100}%` }}
                        >
                          {_}x
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <TextField
                placeholder="Enter borrow amount"
                label="I want to borrow"
                helperText={
                  <span>
                    <span>Min / Max available:</span>{" "}
                    <span className="text-secondary-text">
                      {formatUnits(order.minLoan, order.baseAsset.decimals ?? 18)} /{" "}
                      {formatUnits(order.balance, order.baseAsset.decimals ?? 18)}{" "}
                      {order.baseAsset.symbol}
                    </span>
                  </span>
                }
                internalText={order.baseAsset.symbol}
                value={values.borrowAmount}
                onChange={(e) => {
                  const B = parseFloat(e.target.value) || 0;
                  const L = parseFloat(values.leverage) || 1;
                  if (ratio) {
                    const C = recalculateFromBorrow(B, L, 1 / ratio);
                    setFieldValue("collateralAmount", C);
                  }

                  setFieldValue("borrowAmount", B);
                }}
                error={touched.borrowAmount && errors.borrowAmount}
              />

              <div className="my-4">
                <InputLabel
                  label="Total liquidation fee"
                  inputSize={InputSize.LARGE}
                  tooltipText="Tooltip text"
                />
                <div className="flex justify-between items-center bg-tertiary-bg py-3 px-5 rounded-3">
                  <div className="flex items-center gap-2">
                    <Image src="/images/tokens/placeholder.svg" alt="" width={24} height={24} />
                    {order?.liquidationRewardAmount.formatted} {order.liquidationRewardAsset.symbol}
                  </div>

                  {order.liquidationRewardAsset?.isNative ? (
                    <Badge color="green" text={"Native"} />
                  ) : (
                    <Badge
                      variant={BadgeVariant.STANDARD}
                      standard={order.liquidationRewardAssetStandard}
                    />
                  )}
                </div>
                <HelperText helperText="Liquidation fee (Borrower + Lender)" />
              </div>

              <div className="rounded-3 bg-tertiary-bg justify-between flex px-5 py-3 mb-5">
                <span className="text-tertiary-text">
                  Lending order id: <span className="text-secondary-text">{orderId}</span>
                </span>
                <ExternalTextLink text="View details" href={"#"} />
              </div>

              <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
                <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas price:</span>
                    <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
                  </p>

                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas limit:</span>
                    <span>{100000}</span>
                  </p>
                  <p className="flex flex-col">
                    <span className="text-tertiary-text">Network fee:</span>
                    <span>{formatFloat(formatEther(BigInt(0) * BigInt(0), "wei"))} ETH</span>
                  </p>
                </div>
                <div className="grid grid-cols-[auto_1fr] xs:flex xs:items-center gap-2 w-full xs:w-auto mt-2 xs:mt-0">
                  <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border max-xs:h-8">
                    Cheaper
                  </span>
                  <Button
                    colorScheme={ButtonColor.LIGHT_GREEN}
                    size={false ? ButtonSize.SMALL : ButtonSize.EXTRA_SMALL}
                    onClick={() => null}
                    fullWidth={false}
                    className="rounded-5"
                  >
                    Edit
                  </Button>
                </div>
              </div>
              {/*<pre>{JSON.stringify(errors, null, 2)}</pre>*/}

              <Button type="submit" fullWidth>
                Start borrowing now
              </Button>

              <ReviewBorrowDialog orderId={orderId} order={order} />

              <div className="rounded-3 bg-tertiary-bg mt-4">
                <button
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="flex justify-between px-5 py-3 text-secondary-text w-full"
                >
                  Borrow details
                  <Svg
                    iconName="small-expand-arrow"
                    className={clsx("duration-200", isDetailsExpanded ? "-rotate-180" : "")}
                  />
                </button>
                <Collapse open={isDetailsExpanded}>
                  <div className="flex flex-col gap-2 mb-5 px-5 pb-5">
                    <LendingOrderDetailsRow
                      title="Interest rate per month"
                      value={order.interestRate / 100}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Interest rate for the entire period"
                      value={<span className="text-red">TODO</span>}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Max leverage"
                      value={`${order.leverage}x`}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Leverage"
                      value={`${values.leverage}x`}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="LTV"
                      value={<span className="text-red">TODO</span>}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Duration"
                      value={`${order.positionDuration} days`}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Deadline"
                      value={new Date(order.deadline)
                        .toLocaleDateString("en-GB")
                        .split("/")
                        .join(".")}
                      tooltipText="Tooltip text"
                    />

                    <LendingOrderDetailsRow
                      title="Order currency limit"
                      value={order.currencyLimit}
                      tooltipText="Tooltip text"
                    />

                    <LendingOrderDetailsRow
                      title="May initiate liquidation"
                      value={"Anyone"}
                      tooltipText="Tooltip text"
                    />

                    <LendingOrderDetailsRow
                      title="Tokens allowed for trading"
                      value={<span className="text-red">TODO</span>}
                      tooltipText="Tooltip text"
                    />
                    <LendingOrderDetailsRow
                      title="Liquidation price source"
                      value={
                        <ExternalTextLink
                          text="Dex223 Market"
                          href={getExplorerLink(
                            ExplorerLinkType.ADDRESS,
                            ORACLE_ADDRESS[chainId],
                            chainId,
                          )}
                        />
                      }
                      tooltipText="Tooltip text"
                    />
                  </div>
                </Collapse>
              </div>
            </form>
          )}
        </Formik>

        {/*<NetworkFeeConfigDialog*/}
        {/*  isAdvanced={isAdvanced}*/}
        {/*  setIsAdvanced={setIsAdvanced}*/}
        {/*  estimatedGas={estimatedGas}*/}
        {/*  setEstimatedGas={setEstimatedGas}*/}
        {/*  gasPriceSettings={gasPriceSettings}*/}
        {/*  gasPriceOption={gasPriceOption}*/}
        {/*  customGasLimit={customGasLimit}*/}
        {/*  setCustomGasLimit={setCustomGasLimit}*/}
        {/*  setGasPriceOption={setGasPriceOption}*/}
        {/*  setGasPriceSettings={setGasPriceSettings}*/}
        {/*  isOpen={isOpenedFee}*/}
        {/*  setIsOpen={setIsOpenedFee}*/}
        {/*/>*/}
      </div>
    </div>
  );
}
