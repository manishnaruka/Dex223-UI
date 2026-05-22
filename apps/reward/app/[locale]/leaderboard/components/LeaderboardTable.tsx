import Tooltip from "@repo/ui/tooltip";

import PointsMeter from "@/app/[locale]/leaderboard/components/PointsMeter";
import TierBadge from "@/app/[locale]/leaderboard/components/TierBadge";
import {
  formatLeaderboardWallet,
  LeaderboardRow,
} from "@/app/[locale]/leaderboard/data/leaderboardData";
import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const maxPoints = Math.max(...rows.map((row) => row.points));

  return (
    <div className="hidden lg:block">
      <div className="grid h-10 min-w-0 grid-cols-4 items-center rounded-2 bg-quaternary-bg px-3.5 text-12 text-tertiary-text">
        <span className="flex items-center gap-1">
          <Svg iconName="small-expand-arrow" className="h-3 w-3 rotate-180 text-tertiary-text" />
          Rank
        </span>
        <span>Wallet</span>
        <span className="flex items-center gap-1">
          <Svg iconName="small-expand-arrow" className="h-3 w-3 rotate-180 text-tertiary-text" />
          Points
          <Tooltip iconSize={14} text="Leaderboard points earned during the current epoch." />
        </span>
        <span>NFT tier</span>
      </div>
      <div className="mt-1 flex flex-col">
        {rows.map((row) => (
          <div
            key={`${row.rank}-${row.wallet}`}
            className={clsxMerge(
              "grid h-10 min-w-0 grid-cols-4 items-center rounded-2 px-3.5 text-12 text-secondary-text",
              row.rank % 2 === 0 ? "bg-tertiary-bg" : "bg-transparent",
              row.highlighted && "border border-green shadow-[0_0_10px_rgba(125,164,145,0.45)]",
            )}
          >
            <span>{row.rank}</span>
            <button
              type="button"
              className="min-w-0 w-fit max-w-full truncate text-left text-green underline"
            >
              {formatLeaderboardWallet(row.wallet)}
            </button>
            <PointsMeter points={row.points} maxPoints={maxPoints} />
            <TierBadge tier={row.tier} />
          </div>
        ))}
      </div>
    </div>
  );
}
