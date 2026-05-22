"use client";

import { useEffect, useState } from "react";

import ClaimReceiptsSection from "@/app/[locale]/trade-to-earn/history/components/ClaimReceiptsSection";
import DrillDownsSection from "@/app/[locale]/trade-to-earn/history/components/DrillDownsSection";
import HistoryHeader from "@/app/[locale]/trade-to-earn/history/components/HistoryHeader";
import HistoryLoadingSkeleton from "@/app/[locale]/trade-to-earn/history/components/HistoryLoadingSkeleton";
import HistoryTabs from "@/app/[locale]/trade-to-earn/history/components/HistoryTabs";
import OverviewSection from "@/app/[locale]/trade-to-earn/history/components/OverviewSection";
import StreakTimelineSection from "@/app/[locale]/trade-to-earn/history/components/StreakTimelineSection";
import {
  claimReceipts,
  claimRows,
  overviewRows,
  streakTimeline,
  tradeRows,
} from "@/app/[locale]/trade-to-earn/history/data/historyData";
import Container from "@/components/atoms/Container";

export function TradeToEarnHistory() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <HistoryLoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-3 md:gap-5">
          <HistoryHeader />
          <HistoryTabs />
          <OverviewSection rows={overviewRows} />
          <StreakTimelineSection days={streakTimeline} />
          <ClaimReceiptsSection receipts={claimReceipts} />
          <DrillDownsSection trades={tradeRows} claims={claimRows} />
        </div>
      )}
    </Container>
  );
}
