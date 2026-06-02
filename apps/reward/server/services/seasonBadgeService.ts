import type { BadgeTier } from "@prisma/client";

import { bestTier, percentRank, tierFromPercentile } from "@/server/domain/badges";
import { prisma } from "@/server/lib/prisma";

// Spec 7.4: after rewards are written, recompute each referee's seasonal contributor badge.
// Badges are permanent and never downgrade.
export async function recomputeSeasonBadges(seasonId: number): Promise<void> {
  // Use post-finalize ReferralReward rows to find badge-eligible referees, then read
  // raw snapshots for the displayed/ranked "total volume contributed" value.
  const rewards = await prisma.referralReward.findMany({
    where: { epoch: { seasonId } },
    select: { refereeAddress: true },
  });

  const perReferee = new Map<string, { volume: number }>();
  for (const r of rewards) {
    perReferee.set(r.refereeAddress, perReferee.get(r.refereeAddress) ?? { volume: 0 });
  }

  if (perReferee.size === 0) return;

  const snapshots = await prisma.refereeVolumeSnapshot.findMany({
    where: {
      refereeAddress: { in: Array.from(perReferee.keys()) },
      epoch: { seasonId },
    },
    select: { refereeAddress: true, volumeUsd: true },
  });
  for (const s of snapshots) {
    const agg = perReferee.get(s.refereeAddress);
    if (agg) agg.volume += Number(s.volumeUsd);
  }

  const sortedVolumes = Array.from(perReferee.values())
    .map((v) => v.volume)
    .sort((a, b) => b - a);

  for (const [address, agg] of perReferee.entries()) {
    const top = percentRank(sortedVolumes, agg.volume);
    const computed = tierFromPercentile(top);
    if (!computed) continue;

    const existing = await prisma.seasonBadge.findUnique({
      where: { address_seasonId: { address, seasonId } },
    });
    const finalTier: BadgeTier | null = bestTier(existing?.tier ?? null, computed);
    if (!finalTier) continue;

    await prisma.seasonBadge.upsert({
      where: { address_seasonId: { address, seasonId } },
      create: {
        address,
        seasonId,
        tier: finalTier,
        topPercent: top,
        totalVolumeContributedUsd: agg.volume,
      },
      update: {
        // never downgrade
        tier: finalTier,
        // refresh percent + volume to latest snapshot (informational; tier is what matters)
        topPercent: existing ? Math.min(existing.topPercent, top) : top,
        totalVolumeContributedUsd: agg.volume,
      },
    });
  }
}
