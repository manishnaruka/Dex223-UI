"use client";
import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import SelectPositionDialog, {
  SelectedPositionInfo,
} from "@/app/[locale]/margin-swap/components/SelectPositionDialog";
import TradeForm from "@/app/[locale]/margin-swap/components/TradeForm";
import { useMarginSwapTokensStore } from "@/app/[locale]/margin-swap/stores/useMarginSwapTokensStore";
import { usePositionsByOwner } from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import { ThemeColors } from "@/config/theme/colors";
import { ColorSchemeProvider } from "@/lib/color-scheme";
import TradingViewWidget from "@/components/common/TradingViewWidget";

export default function MarginSwapPage() {
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();
  const { tokenA, tokenB, reset: resetTokens } = useMarginSwapTokensStore();
  const { address } = useAccount();
  const { loading, positions } = usePositionsByOwner({ owner: address });

  const openedPositions = useMemo(() => {
    return positions?.filter((position) => !position.isLiquidated && !position.isClosed);
  }, [positions]);

  const [matchingPositions, otherPositions] = useMemo(() => {
    if (!tokenA && !tokenB) {
      return [openedPositions, openedPositions];
    }

    const matching: MarginPosition[] = [];
    const other: MarginPosition[] = [];

    for (const position of openedPositions) {
      const hasA = tokenA && position.assets.some((asset) => asset.equals(tokenA));

      const hasB =
        tokenB && position.order.allowedTradingAssets.some((asset) => asset.equals(tokenB));

      // If tokenA is provided → must match assets
      // If tokenB is provided → must match allowedTradingAssets
      // If both are provided → both must match
      const matches = (!tokenA || hasA) && (!tokenB || hasB);

      if (matches) {
        matching.push(position);
      } else {
        other.push(position);
      }
    }

    return [matching, other];
  }, [openedPositions, tokenA, tokenB]);

  return (
    <ColorSchemeProvider value={ThemeColors.PURPLE}>
      <div className="grid py-3 sm:py-4 lg:py-[40px] grid-cols-1 lg:grid-cols-[2fr_1fr] mx-auto gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 min-w-0 order-1">
          <div className="w-full h-[300px] xs:h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-secondary-bg rounded-2 border border-secondary-border overflow-hidden flex-shrink-0">
            <TradingViewWidget tokenA={tokenA} tokenB={tokenB} />
          </div>

          <div className="w-full min-w-0 hidden lg:block">
            <RecentTransactions
              showRecentTransactions={showRecentTransactions}
              handleClose={() => setShowRecentTransactions(false)}
              store={useSwapRecentTransactionsStore}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 min-w-0 order-2">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex justify-between items-center pl-4 pr-5 py-2 text-secondary-text border-l-4 bg-primary-bg rounded-2 border-purple">
              {!openedPositions?.length ? (
                "You don't have any active positions"
              ) : (
                <>
                  {!!(tokenA && !tokenB && matchingPositions?.length) &&
                    `${matchingPositions?.length} positions with ${tokenA.symbol}`}
                  {!!(tokenB && !tokenA && matchingPositions?.length) &&
                    `${matchingPositions?.length} positions allowed for ${tokenB.symbol} trade`}
                  {!!(tokenA && tokenB && matchingPositions?.length) &&
                    `${matchingPositions?.length} positions with ${tokenA.symbol} allowed for ${tokenB.symbol} trade`}
                  {(!!tokenA || !!tokenB) &&
                    matchingPositions?.length === 0 &&
                    "No positions for selected tokens"}
                  {!tokenA && !tokenB && `You have ${openedPositions?.length} position(s)`}
                </>
              )}
              <SelectPositionDialog />
            </div>
          </div>

          <SelectedPositionInfo />

          <TradeForm />
          <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        </div>

        <div className="w-full min-w-0 order-3 lg:hidden">
          <RecentTransactions
            showRecentTransactions={showRecentTransactions}
            handleClose={() => setShowRecentTransactions(false)}
            store={useSwapRecentTransactionsStore}
          />
        </div>
      </div>
    </ColorSchemeProvider>
  );
}
