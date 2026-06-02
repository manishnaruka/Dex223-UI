import { Prisma } from "@prisma/client";

import {
  applyClusterCap,
  applyPerRefereeCap,
  PER_CLUSTER_CAP_USD,
  PER_REFEREE_CAP_USD,
} from "@/server/domain/caps";
import { decayPercent } from "@/server/domain/decay";
import { env } from "@/server/env";
import { prisma } from "@/server/lib/prisma";

import { recomputeSeasonBadges } from "./seasonBadgeService";
import type { VolumeSource } from "./volumeSource";

// Spec 7.1 valid-volume gate.
export const MIN_VALID_VOLUME_USD = 2_000;

interface FinalizeArgs {
  epochId: number;
  volumeSource: VolumeSource;
}

interface FinalizeResult {
  rewardsCreated: number;
  referrersProcessed: number;
}

// Spec 7 finalize orchestrator:
//   1. For each relation joined ≤ this epoch, pull the referee's epoch volume (cross-chain).
//   2. Snapshot the volume.
//   3. If volume ≥ $2,000, compute gross, apply per-referee, fee-clamp, and cluster caps.
//   4. Upsert ReferralReward row.
//   5. Recompute seasonal Contributor Badges (never downgrade).
//   6. Mark epoch CLOSED.
//
// Idempotent: re-running on a CLOSED epoch updates the same rows (no duplicates due
// to the @@unique([referrerAddress, refereeAddress, epochId]) constraint).
export async function finalizeEpoch({ epochId, volumeSource }: FinalizeArgs): Promise<FinalizeResult> {
  const epoch = await prisma.epoch.findUniqueOrThrow({
    where: { id: epochId },
    include: { season: true },
  });

  await prisma.epoch.update({ where: { id: epochId }, data: { status: "FINALIZING" } });

  // Relations active this epoch = joined in this or any prior epoch within the same season.
  const relations = await prisma.referralRelation.findMany({
    where: {
      joinedEpoch: {
        seasonId: epoch.seasonId,
        index: { lte: epoch.index },
      },
    },
    include: { joinedEpoch: true },
  });

  // 1+2. Pull volumes and snapshot them.
  const refereeVolumes = new Map<string, number>();
  const refereeFeesPaid = new Map<string, number | null>();
  for (const rel of relations) {
    if (refereeVolumes.has(rel.refereeAddress)) continue;
    const v = await volumeSource.getEpochVolumeUsd(rel.refereeAddress, epochId);
    refereeVolumes.set(rel.refereeAddress, v);
    const fees =
      volumeSource.getEpochFeesPaidUsd
        ? await volumeSource.getEpochFeesPaidUsd(rel.refereeAddress, epochId)
        : null;
    refereeFeesPaid.set(rel.refereeAddress, fees);
    await prisma.refereeVolumeSnapshot.upsert({
      where: { refereeAddress_epochId: { refereeAddress: rel.refereeAddress, epochId } },
      create: { refereeAddress: rel.refereeAddress, epochId, volumeUsd: v },
      update: { volumeUsd: v },
    });
  }

  // 3a. Compute gross + per-referee cap for each qualifying relation.
  interface Row {
    referrerAddress: string;
    refereeAddress: string;
    volumeUsd: number;
    decayStage: number;
    grossUsd: number;
    perRefereeCapUsd: number;
    feeClampUsd: number;
  }

  const rows: Row[] = [];
  for (const rel of relations) {
    const volumeUsd = refereeVolumes.get(rel.refereeAddress) ?? 0;
    if (volumeUsd < MIN_VALID_VOLUME_USD) continue;
    const decay = decayPercent(rel.joinedEpoch.index, epoch.index);
    const gross = (volumeUsd * env.REWARD_RATE_BPS) / 10_000 * (decay / 100);
    const perRefereeCapped = applyPerRefereeCap(gross);
    const feesPaid = refereeFeesPaid.get(rel.refereeAddress);
    const feeClamped =
      feesPaid == null
        ? perRefereeCapped
        : Math.min(perRefereeCapped, feesPaid * env.REWARD_FEE_CLAMP_MULTIPLIER);
    rows.push({
      referrerAddress: rel.referrerAddress,
      refereeAddress: rel.refereeAddress,
      volumeUsd,
      decayStage: decay,
      grossUsd: gross,
      perRefereeCapUsd: perRefereeCapped,
      feeClampUsd: feeClamped,
    });
  }

  // 3b. Apply cluster cap per referrer.
  const byReferrer = new Map<string, Row[]>();
  for (const r of rows) {
    const list = byReferrer.get(r.referrerAddress) ?? [];
    list.push(r);
    byReferrer.set(r.referrerAddress, list);
  }

  const finalRows: Array<Row & { clusterCapUsd: number; finalUsd: number }> = [];
  for (const [, list] of byReferrer) {
    const capped = applyClusterCap(list.map((r) => r.feeClampUsd));
    list.forEach((r, i) => {
      finalRows.push({
        ...r,
        clusterCapUsd: PER_CLUSTER_CAP_USD,
        finalUsd: capped[i],
      });
    });
  }

  for (const r of finalRows) {
    await prisma.referralReward.upsert({
      where: {
        referrerAddress_refereeAddress_epochId: {
          referrerAddress: r.referrerAddress,
          refereeAddress: r.refereeAddress,
          epochId,
        },
      },
      create: {
        referrerAddress: r.referrerAddress,
        refereeAddress: r.refereeAddress,
        epochId,
        decayStage: r.decayStage,
        grossUsd: new Prisma.Decimal(r.grossUsd.toFixed(4)),
        perRefereeCapUsd: new Prisma.Decimal(Math.min(r.grossUsd, PER_REFEREE_CAP_USD).toFixed(4)),
        clusterCapUsd: new Prisma.Decimal(r.clusterCapUsd.toFixed(4)),
        finalUsd: new Prisma.Decimal(r.finalUsd.toFixed(4)),
      },
      update: {
        decayStage: r.decayStage,
        grossUsd: new Prisma.Decimal(r.grossUsd.toFixed(4)),
        perRefereeCapUsd: new Prisma.Decimal(Math.min(r.grossUsd, PER_REFEREE_CAP_USD).toFixed(4)),
        clusterCapUsd: new Prisma.Decimal(r.clusterCapUsd.toFixed(4)),
        finalUsd: new Prisma.Decimal(r.finalUsd.toFixed(4)),
      },
    });
  }

  // 5. Seasonal badges.
  await recomputeSeasonBadges(epoch.seasonId);

  // 6. Close the epoch.
  await prisma.epoch.update({ where: { id: epochId }, data: { status: "CLOSED" } });

  return { rewardsCreated: finalRows.length, referrersProcessed: byReferrer.size };
}
