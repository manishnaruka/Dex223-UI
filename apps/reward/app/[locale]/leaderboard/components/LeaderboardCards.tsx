import Tooltip from "@repo/ui/tooltip";

import PointsMeter from "@/app/[locale]/leaderboard/components/PointsMeter";
import TierBadge from "@/app/[locale]/leaderboard/components/TierBadge";
import {
  formatLeaderboardWallet,
  LeaderboardRow,
} from "@/app/[locale]/leaderboard/data/leaderboardData";
import { clsxMerge } from "@/functions/clsxMerge";

export default function LeaderboardCards({ rows }: { rows: LeaderboardRow[] }) {
  const maxPoints = Math.max(...rows.map((row) => row.points));

  return (
    <div className="grid min-w-0 gap-2.5 md:grid-cols-2 md:gap-3 lg:hidden">
      {rows.map((row) => (
        <article
          key={`${row.rank}-${row.wallet}`}
          className={clsxMerge(
            "min-w-0 rounded-3 bg-tertiary-bg/50 p-3 text-12 text-secondary-text md:p-4",
            row.highlighted && "border border-green/70 shadow shadow-green/30",
          )}
        >
          <div className="grid min-w-0 grid-cols-[minmax(68px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 md:grid-cols-[minmax(78px,auto)_minmax(0,1fr)]">
            <span>Rank</span>
            <span className="text-right text-primary-text">{row.rank}</span>
            <span>Wallet</span>
            <button type="button" className="min-w-0 truncate text-right text-green underline">
              {formatLeaderboardWallet(row.wallet)}
            </button>
            <span className="flex items-center gap-1">
              Points
              <Tooltip iconSize={14} text="Leaderboard points earned during the current epoch." />
            </span>
            <span className="flex min-w-0 justify-end text-primary-text">
              <PointsMeter points={row.points} maxPoints={maxPoints} />
            </span>
            <span>NFT tier</span>
            <span className="flex justify-end">
              <TierBadge tier={row.tier} />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
