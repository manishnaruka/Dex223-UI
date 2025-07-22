"use client";

import React, { use, useEffect } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import OrderConfigurationPage from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderConfigurationPage";
import ReviewEditOrderDialog from "@/app/[locale]/margin-trading/lending-order/[id]/edit/components/ReviewEditOrderDialog";
import { useEditOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderConfigStore";
import { useEditOrderStepStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderStepStore";
import {
  LendingOrderPeriodType,
  LiquidationType,
  PerpetualPeriodType,
  TradingTokensInputMode,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useConfirmEditOrderDialogStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { OrderActionMode } from "@/app/[locale]/margin-trading/types";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { ORACLE_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";
import { Standard } from "@/sdk_bi/standard";

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

  const { step, setStep } = useEditOrderStepStore();

  const { isOpen, setIsOpen } = useConfirmEditOrderDialogStore();

  const { setIsInitialized, isInitialized, ...config } = useEditOrderConfigStore();

  const { setFirstStepValues, setSecondStepValues, setThirdStepValues } = config;

  useEffect(() => {
    if (!order || isInitialized) {
      console.log("No order, returning");
      return;
    }

    console.log("Starting re-initializing...");
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
      <OrderConfigurationPage
        {...config}
        openPreviewDialog={() => setIsOpen(true)}
        mode={OrderActionMode.EDIT}
        step={step}
        setStep={setStep}
      />

      <ReviewEditOrderDialog isOpen={isOpen} setIsOpen={setIsOpen} order={order} />
    </>
  );
}
