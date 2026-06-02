import type { Address } from "viem";

import type {
  RefereeRow,
  ReferralBadge,
  ReferralData,
  SeasonNftTierEntry,
} from "@/app/[locale]/referrals/data/referralData";
import { EPOCHS_PER_SEASON } from "@/server/lib/epoch";
import { prisma } from "@/server/lib/prisma";

import { getCurrentEpoch } from "./epochStateService";
import { getOrCreateReferralLink } from "./referralLinkService";

function badgeFromTier(tier: "BRONZE" | "SILVER" | "GOLD" | null | undefined): ReferralBadge {
  if (tier === "GOLD") return "gold";
  if (tier === "SILVER") return "silver";
  return "bronze";
}

interface BuildArgs {
  viewer: string;
}

// Returns the ReferralData shape consumed by the existing UI.
// Aggregates per-referee data across the current season's closed epochs.
export async function buildReferralData({ viewer }: BuildArgs): Promise<ReferralData> {
  const viewerLower = viewer.toLowerCase();

  const { coords, epoch } = await getCurrentEpoch();
  const link = await getOrCreateReferralLink(viewerLower);

  // All referees of this viewer
  const relations = await prisma.referralRelation.findMany({
    where: { referrerAddress: viewerLower },
  });

  // Volumes (this season, all snapshotted epochs) per referee
  const refereeAddrs = relations.map((r) => r.refereeAddress);
  const volumeRows = refereeAddrs.length
    ? await prisma.refereeVolumeSnapshot.findMany({
        where: {
          refereeAddress: { in: refereeAddrs },
          epoch: { seasonId: epoch.seasonId },
        },
        select: { refereeAddress: true, volumeUsd: true },
      })
    : [];
  const volumeByReferee = new Map<string, number>();
  for (const v of volumeRows) {
    volumeByReferee.set(
      v.refereeAddress,
      (volumeByReferee.get(v.refereeAddress) ?? 0) + Number(v.volumeUsd),
    );
  }

  // Rewards (this season) per referee + decay from the most recent epoch
  const rewardRows = refereeAddrs.length
    ? await prisma.referralReward.findMany({
        where: {
          referrerAddress: viewerLower,
          epoch: { seasonId: epoch.seasonId },
        },
        include: { epoch: { select: { index: true } } },
      })
    : [];
  const rewardByReferee = new Map<string, number>();
  const latestDecayByReferee = new Map<string, { idx: number; decay: number }>();
  for (const r of rewardRows) {
    rewardByReferee.set(
      r.refereeAddress,
      (rewardByReferee.get(r.refereeAddress) ?? 0) + Number(r.finalUsd),
    );
    const latest = latestDecayByReferee.get(r.refereeAddress);
    if (!latest || r.epoch.index > latest.idx) {
      latestDecayByReferee.set(r.refereeAddress, { idx: r.epoch.index, decay: r.decayStage });
    }
  }

  // Badges held by each referee (any season, best tier)
  const badgeRows = refereeAddrs.length
    ? await prisma.seasonBadge.findMany({
        where: { address: { in: refereeAddrs }, seasonId: epoch.seasonId },
        select: { address: true, tier: true },
      })
    : [];
  const badgeByReferee = new Map<string, ReferralBadge>();
  for (const b of badgeRows) {
    badgeByReferee.set(b.address, badgeFromTier(b.tier));
  }

  const referees: RefereeRow[] = relations.map((r) => ({
    address: r.refereeAddress as Address,
    volume: Math.round(volumeByReferee.get(r.refereeAddress) ?? 0),
    decayStage: latestDecayByReferee.get(r.refereeAddress)?.decay ?? 100,
    reward: Math.round(rewardByReferee.get(r.refereeAddress) ?? 0),
    badge: badgeByReferee.get(r.refereeAddress) ?? "bronze",
  }));

  const combinedVolume = referees.reduce((acc, r) => acc + r.volume, 0);
  const totalRewards = referees.reduce((acc, r) => acc + r.reward, 0);

  // Viewer's own seasonal badge timeline (every season they've ever earned a badge in).
  const viewerBadges = await prisma.seasonBadge.findMany({
    where: { address: viewerLower },
    include: { season: { select: { index: true, startsAt: true } } },
    orderBy: { seasonId: "asc" },
  });
  const currentBadge = viewerBadges.find((b) => b.seasonId === epoch.seasonId) ?? null;
  const seasonNftTimeline: SeasonNftTierEntry[] = viewerBadges.map((b) => ({
    date: b.awardedAt.getTime(),
    tier: badgeFromTier(b.tier),
  }));

  const progressPercent = Math.round((coords.epochIndex / EPOCHS_PER_SEASON) * 100);

  return {
    totalReferees: referees.length,
    combinedVolume,
    totalRewards,
    referees,
    referralLink: link.url,
    season: coords.seasonIndex,
    epochCurrent: coords.epochIndex,
    epochTotal: EPOCHS_PER_SEASON,
    progressPercent,
    epochEndsAt: coords.epochEndsAt.getTime(),
    seasonNftTier: badgeFromTier(currentBadge?.tier),
    seasonNftTopPercent: currentBadge?.topPercent ?? 100,
    seasonNftTimeline,
  };
}
