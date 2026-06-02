import type { Address } from "viem";

import type { ReferralBadge } from "@/app/[locale]/referrals/data/referralData";
import { prisma } from "@/server/lib/prisma";

import { getCurrentEpoch } from "./epochStateService";

function badgeFromTier(tier: "BRONZE" | "SILVER" | "GOLD" | null | undefined): ReferralBadge {
  if (tier === "GOLD") return "gold";
  if (tier === "SILVER") return "silver";
  return "bronze";
}

export interface RefereeEpochRow {
  epochIndex: number;
  volumeUsd: number;
  decayStage: number | null;
  finalRewardUsd: number;
}

export interface RefereeDetail {
  address: Address;
  referrer: Address | null;
  joinedEpochIndex: number | null;
  byEpoch: RefereeEpochRow[];
  totalVolumeUsd: number;
  totalRewardUsd: number;
  contributorBadge: {
    address: Address;
    season: number;
    tier: ReferralBadge;
    topPercent: number;
    totalVolumeContributedUsd: number;
    awardedAt: number;
  } | null;
}

export async function buildRefereeDetail(addressRaw: string): Promise<RefereeDetail> {
  const address = addressRaw.toLowerCase();
  const { epoch } = await getCurrentEpoch();

  const relation = await prisma.referralRelation.findUnique({
    where: { refereeAddress: address },
    include: { joinedEpoch: true },
  });

  const snapshots = await prisma.refereeVolumeSnapshot.findMany({
    where: { refereeAddress: address, epoch: { seasonId: epoch.seasonId } },
    include: { epoch: true },
    orderBy: { epoch: { index: "asc" } },
  });

  const rewards = await prisma.referralReward.findMany({
    where: { refereeAddress: address, epoch: { seasonId: epoch.seasonId } },
    include: { epoch: true },
  });

  const rewardByEpoch = new Map<number, { decay: number; finalUsd: number }>();
  for (const r of rewards) {
    rewardByEpoch.set(r.epoch.index, { decay: r.decayStage, finalUsd: Number(r.finalUsd) });
  }

  const byEpoch: RefereeEpochRow[] = snapshots.map((s) => {
    const r = rewardByEpoch.get(s.epoch.index);
    return {
      epochIndex: s.epoch.index,
      volumeUsd: Number(s.volumeUsd),
      decayStage: r?.decay ?? null,
      finalRewardUsd: r?.finalUsd ?? 0,
    };
  });

  const totalVolumeUsd = byEpoch.reduce((acc, r) => acc + r.volumeUsd, 0);
  const totalRewardUsd = byEpoch.reduce((acc, r) => acc + r.finalRewardUsd, 0);

  const badge = await prisma.seasonBadge.findUnique({
    where: { address_seasonId: { address, seasonId: epoch.seasonId } },
    include: { season: { select: { index: true } } },
  });

  return {
    address: address as Address,
    referrer: (relation?.referrerAddress ?? null) as Address | null,
    joinedEpochIndex: relation?.joinedEpoch.index ?? null,
    byEpoch,
    totalVolumeUsd,
    totalRewardUsd,
    contributorBadge: badge
      ? {
          address: address as Address,
          season: badge.season.index,
          tier: badgeFromTier(badge.tier),
          topPercent: badge.topPercent,
          totalVolumeContributedUsd: Number(badge.totalVolumeContributedUsd),
          awardedAt: badge.awardedAt.getTime(),
        }
      : null,
  };
}

export async function buildPublicBadge(addressRaw: string) {
  const address = addressRaw.toLowerCase();
  // Spec 7.4: badges are permanent and shown to referees. Return the most recent one.
  const badges = await prisma.seasonBadge.findMany({
    where: { address },
    include: { season: true },
    orderBy: { seasonId: "desc" },
  });

  if (badges.length === 0) return { address, badges: [] };

  return {
    address,
    badges: badges.map((b) => ({
      season: b.season.index,
      tier: badgeFromTier(b.tier),
      topPercent: b.topPercent,
      totalVolumeContributedUsd: Number(b.totalVolumeContributedUsd),
      awardedAt: b.awardedAt.getTime(),
    })),
  };
}
