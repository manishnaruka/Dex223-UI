import { NftTier } from "@/app/[locale]/leaderboard/data/leaderboardData";
import { clsxMerge } from "@/functions/clsxMerge";

const tierStyles: Record<NftTier, string> = {
  gold: "border-yellow-light/60 bg-yellow-bg text-primary-text",
  silver: "border-secondary-border bg-tertiary-bg text-primary-text",
  bronze: "border-orange/60 bg-orange-bg text-primary-text",
};

const tierEmoji: Record<NftTier, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

export default function TierBadge({ tier }: { tier: NftTier }) {
  return (
    <span
      className={clsxMerge(
        "inline-flex h-6 w-fit items-center gap-1 rounded-20 border px-2 text-12 capitalize leading-none",
        tierStyles[tier],
      )}
    >
      <span className="text-12">{tierEmoji[tier]}</span>
      {tier}
    </span>
  );
}
