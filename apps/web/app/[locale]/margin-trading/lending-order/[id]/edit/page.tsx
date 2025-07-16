"use client";

import clsx from "clsx";
import React, { use, useCallback, useEffect } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import ReviewLendingOrderDialog from "@/app/[locale]/margin-trading/lending-order/[id]/edit/components/ReviewLendingOrderDialog";
import FirstStep from "@/app/[locale]/margin-trading/lending-order/[id]/edit/steps/FirstStep";
import SecondStep from "@/app/[locale]/margin-trading/lending-order/[id]/edit/steps/SecondStep";
import ThirdStep from "@/app/[locale]/margin-trading/lending-order/[id]/edit/steps/ThirdStep";
import { useConfirmEditOrderDialogStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useConfirmEditOrderDialogOpened";
import { useEditOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderConfigStore";
import {
  LendingOrderPeriodType,
  LiquidationType,
  PerpetualPeriodType,
  TradingTokensInputMode,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useConfirmCreateOrderDialogStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useConfirmCreateOrderDialogOpened";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { ORACLE_ADDRESS, ZERO_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";
import { Standard } from "@/sdk_bi/standard";

const stepsLabels: Record<CreateOrderStep, string> = {
  [CreateOrderStep.FIRST]: "Loan",
  [CreateOrderStep.SECOND]: "Parameters",
  [CreateOrderStep.THIRD]: "Liquidation",
};

export default function EditLendingOrderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id: orderId } = use(params);
  const { order, loading } = useOrder({ id: +orderId });

  const { address } = useAccount();
  useRecentTransactionTracking();

  const { step } = useCreateOrderStepStore((state) => ({ step: state.step }));

  const { isOpen, setIsOpen } = useConfirmEditOrderDialogStore();

  const {
    setIsInitialized,
    isInitialized,
    setFirstStepValues,
    setSecondStepValues,
    setThirdStepValues,
  } = useEditOrderConfigStore();

  const renderSteps = useCallback(() => {
    switch (step) {
      case CreateOrderStep.FIRST:
        return <FirstStep />;
      case CreateOrderStep.SECOND:
        return <SecondStep />;
      case CreateOrderStep.THIRD:
        return <ThirdStep />;
    }
  }, [step]);

  useEffect(() => {
    console.log(order);
    console.log(isInitialized);
    if (!order || isInitialized) {
      return;
    }

    const date = new Date(order.deadline * 1000);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formattedDatetime = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    console.log(formattedDatetime);
    setFirstStepValues({
      interestRatePerMonth: (order.interestRate / 100).toString(),
      loanAmount: formatUnits(order.balance, order.baseAsset.decimals),
      loanToken: order.baseAsset,
      loanTokenStandard: Standard.ERC20,
      period: {
        type: LendingOrderPeriodType.FIXED,
        lendingOrderDeadline: formattedDatetime,
        positionDuration: (order.positionDuration / 60 / 60 / 24).toString(),
        borrowingPeriod: {
          type: PerpetualPeriodType.DAYS,
          borrowingPeriodInDays: "0",
          borrowingPeriodInMinutes: "0",
        },
      },
    });

    setSecondStepValues({
      minimumBorrowingAmount: formatUnits(order.minLoan, order.baseAsset.decimals),
      collateralTokens: order.allowedCollateralAssets,
      leverage: order.leverage,
      tradingTokens: {
        inputMode: TradingTokensInputMode.MANUAL,
        allowedTokens: order.allowedTradingAssets,
        includeERC223Trading: false,
        tradingTokensAutoListing: undefined,
      },
      includeERC223Collateral: false,
    });

    setThirdStepValues({
      liquidationFeeToken: order.liquidationRewardAsset,
      orderCurrencyLimit: order.currencyLimit.toString(),
      liquidationMode: { type: LiquidationType.ANYONE, whitelistedLiquidators: [] },
      liquidationFeeForLender: formatUnits(
        order.liquidationRewardAmount,
        order.liquidationRewardAsset.decimals,
      ),
      liquidationFeeForLiquidator: formatUnits(
        order.liquidationRewardAmount,
        order.liquidationRewardAsset.decimals,
      ),
      priceSource: ORACLE_ADDRESS[DexChainId.SEPOLIA],
    });

    setIsInitialized(true);
  }, [
    isInitialized,
    order,
    setFirstStepValues,
    setIsInitialized,
    setSecondStepValues,
    setThirdStepValues,
  ]);

  if (!order || loading) {
    return "Loading...";
  }

  if (!address || order.owner.toLowerCase() !== address.toLowerCase()) {
    return "Seems like you are not the owner of this order, you can't edit this one";
  }

  return (
    <>
      <div className="rounded-3 bg-primary-bg max-w-[600px] mx-auto my-10">
        <div className="py-1.5 px-6 flex justify-between items-center">
          <IconButton iconName="back" />
          <h1 className="text-20 font-bold">Edit lending order</h1>
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            active={false}
            iconName="recent-transactions"
            onClick={() => {}}
          />
        </div>
        <div className="pb-10 px-10">
          <div className="flex justify-between mb-5 items-center gap-5">
            {[CreateOrderStep.FIRST, CreateOrderStep.SECOND, CreateOrderStep.THIRD].map((_step) => {
              return (
                <React.Fragment key={_step}>
                  <div className="flex items-center gap-2" key={_step}>
                    <span
                      className={clsx(
                        "w-8 h-8  rounded-full text-18 flex items-center justify-center border  ",
                        _step === step
                          ? "border-green bg-green-bg"
                          : "border-quaternary-bg bg-quaternary-bg text-tertiary-text",
                      )}
                    >
                      {_step + 1}
                    </span>
                    <span
                      className={clsx(
                        "text-18",
                        _step === step ? "text-primary-text" : "text-tertiary-text",
                      )}
                    >
                      {stepsLabels[_step]}
                    </span>
                  </div>
                  {_step !== CreateOrderStep.THIRD && (
                    <div className="h-1 flex-grow bg-quaternary-bg" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {renderSteps()}
        </div>
      </div>

      <ReviewLendingOrderDialog isOpen={isOpen} setIsOpen={setIsOpen} order={order} />
    </>
  );
}
