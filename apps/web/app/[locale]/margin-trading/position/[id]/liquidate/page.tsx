"use client";
import clsx from "clsx";
import React, { use, useEffect, useState } from "react";

import useMarginPositionById from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import ConfirmLiquidatePositionDialog from "@/app/[locale]/margin-trading/position/[id]/liquidate/components/ConfirmLiquidatePositionDialog";
import LiquidateForm from "@/app/[locale]/margin-trading/position/[id]/liquidate/components/LiquidateForm";
import ConfirmConvertDialog from "@/app/[locale]/swap/components/ConfirmConvertDialog";
import TradeForm from "@/app/[locale]/swap/components/TradeForm";
import TwoVersionsInfo from "@/app/[locale]/swap/components/TwoVersionsInfo";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Container from "@/components/atoms/Container";
import Button from "@/components/buttons/Button";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useSwapSearchParams } from "@/hooks/useSwapSearchParams";

export default function LiquidatePositionPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  useRecentTransactionTracking();

  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();

  const { id: positionId } = use(params);

  const { position, loading } = useMarginPositionById({ id: positionId });

  if (loading || !position) {
    return "Loading";
  }

  return (
    <>
      <Container>
        <div
          className={clsx(
            "grid py-4 lg:py-[40px] grid-cols-1 mx-auto",
            showRecentTransactions
              ? "xl:grid-cols-[580px_600px] xl:max-w-[1200px] gap-4 xl:grid-areas-[left_right] grid-areas-[right,left]"
              : "xl:grid-cols-[600px] xl:max-w-[600px] grid-areas-[right]",
          )}
        >
          <div className="grid-in-[left] flex justify-center">
            <div className="w-full sm:max-w-[600px] xl:max-w-full">
              <RecentTransactions
                showRecentTransactions={showRecentTransactions}
                handleClose={() => setShowRecentTransactions(false)}
                store={useSwapRecentTransactionsStore}
              />
            </div>
          </div>

          <div className="flex justify-center grid-in-[right]">
            <LiquidateForm position={position} />
          </div>
        </div>
      </Container>
    </>
  );
}
