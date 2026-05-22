"use client";

import { useMemo } from "react";

import ClusterRangeLabel from "@/app/[locale]/leaderboard/components/ClusterRangeLabel";
import EmptyCluster from "@/app/[locale]/leaderboard/components/EmptyCluster";
import LeaderboardCards from "@/app/[locale]/leaderboard/components/LeaderboardCards";
import LeaderboardSelect from "@/app/[locale]/leaderboard/components/LeaderboardSelect";
import LeaderboardTable from "@/app/[locale]/leaderboard/components/LeaderboardTable";
import RankNotice from "@/app/[locale]/leaderboard/components/RankNotice";
import {
  clusterLeaderboardRows,
  LeaderboardView,
  topLeaderboardRows,
} from "@/app/[locale]/leaderboard/data/leaderboardData";

interface Props {
  isConnected: boolean;
  view: LeaderboardView;
  onViewChange: (value: LeaderboardView) => void;
}

export default function LeaderboardSection({ isConnected, view, onViewChange }: Props) {
  const rows = useMemo(
    () => (view === "cluster" ? clusterLeaderboardRows : topLeaderboardRows),
    [view],
  );
  const showClusterEmpty = view === "cluster" && !isConnected;

  return (
    <section className="min-w-0 overflow-hidden rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
            Leaderboard
          </h1>
          <p className="text-12 leading-5 text-secondary-text lg:text-14">
            Streaks and loot boost your climb. NFT tiers evolve
          </p>
        </div>
        <LeaderboardSelect value={view} onChange={onViewChange} isConnected={isConnected} />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {view === "top10" ? <RankNotice isConnected={isConnected} hasRank={isConnected} /> : null}
        {view === "cluster" ? <ClusterRangeLabel /> : null}
        {showClusterEmpty ? (
          <EmptyCluster />
        ) : (
          <>
            <LeaderboardTable rows={rows} />
            <LeaderboardCards rows={rows} />
          </>
        )}
      </div>
    </section>
  );
}
