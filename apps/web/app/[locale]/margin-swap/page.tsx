"use client";
import clsx from "clsx";
import React from "react";
import { useAccount } from "wagmi";

import SelectPositionDialog, {
  SelectedPositionInfo,
} from "@/app/[locale]/margin-swap/components/SelectPositionDialog";
import TradeForm from "@/app/[locale]/margin-swap/components/TradeForm";
import { useMarginSwapTokensStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapTokensStore";
import { usePositionsByOwner } from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import Container from "@/components/atoms/Container";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import { ThemeColors } from "@/config/theme/colors";
import { ColorSchemeProvider } from "@/lib/color-scheme";

export default function MarginSwapPage() {
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();
  const { tokenA, tokenB, reset: resetTokens } = useMarginSwapTokensStore();
  const { address } = useAccount();
  const { loading, positions } = usePositionsByOwner({ owner: address });

  return (
    <ColorSchemeProvider value={ThemeColors.PURPLE}>
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
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-5 w-full sm:max-w-[600px] xl:max-w-full">
              <div className="flex flex-col gap-2 lg:gap-3">
                <div className="flex justify-between items-center pl-4 pr-5 py-2 text-secondary-text border-l-4 bg-primary-bg rounded-2 border-purple">
                  You have {positions?.length} positions
                  <SelectPositionDialog />
                </div>
              </div>

              <SelectedPositionInfo />

              <TradeForm />
              <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
            </div>
          </div>
        </div>
      </Container>
    </ColorSchemeProvider>
  );
}
