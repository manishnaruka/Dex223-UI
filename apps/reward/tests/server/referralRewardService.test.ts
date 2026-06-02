import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { env } from "@/server/env";
import { MIN_VALID_VOLUME_USD, finalizeEpoch } from "@/server/services/referralRewardService";
import { MockVolumeSource } from "@/server/services/volumeSource";

const prisma = new PrismaClient();

const REFERRER = "0xaaaa000000000000000000000000000000000001";
const A = "0xbbbb000000000000000000000000000000000002";
const B = "0xbbbb000000000000000000000000000000000003";
const C = "0xbbbb000000000000000000000000000000000004";

async function clean() {
  await prisma.referralReward.deleteMany();
  await prisma.refereeVolumeSnapshot.deleteMany();
  await prisma.seasonBadge.deleteMany();
  await prisma.referralRelation.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.epoch.deleteMany();
  await prisma.season.deleteMany();
}

async function seedSeasonWithEpochs() {
  const season = await prisma.season.create({
    data: {
      index: 99,
      startsAt: new Date("2026-01-01T00:00:00Z"),
      endsAt: new Date("2026-04-02T00:00:00Z"),
    },
  });
  const epochs = [];
  for (let i = 1; i <= 4; i += 1) {
    const startsAt = new Date(2026, 0, 1 + (i - 1) * 7);
    const e = await prisma.epoch.create({
      data: {
        seasonId: season.id,
        index: i,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    epochs.push(e);
  }
  return { season, epochs };
}

afterAll(async () => {
  await clean();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await clean();
});

describe("finalizeEpoch (spec §7)", () => {
  it("skips referees below the $2,000 valid-volume gate (spec §7.1)", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 1500 });

    const res = await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });
    expect(res.rewardsCreated).toBe(0);

    const rewards = await prisma.referralReward.findMany();
    expect(rewards).toHaveLength(0);
  });

  it("aggregates cross-chain volume per spec §1 multi-chain rule", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 800, base: 800, bsc: 800 });

    const res = await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });
    expect(res.rewardsCreated).toBe(1);

    const snap = await prisma.refereeVolumeSnapshot.findFirstOrThrow();
    expect(Number(snap.volumeUsd)).toBe(2400);
  });

  it("halves the reward each epoch beyond join (spec §7.2)", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    // $10,000 cross-chain in epoch 1 (decay=100) and epoch 3 (decay=25).
    vs.setVolume(A, epochs[0].id, { ethereum: 10_000 });
    vs.setVolume(A, epochs[2].id, { ethereum: 10_000 });

    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });
    await finalizeEpoch({ epochId: epochs[2].id, volumeSource: vs });

    const r1 = await prisma.referralReward.findFirstOrThrow({
      where: { epochId: epochs[0].id },
    });
    const r3 = await prisma.referralReward.findFirstOrThrow({
      where: { epochId: epochs[2].id },
    });
    expect(r1.decayStage).toBe(100);
    expect(r3.decayStage).toBe(25);
    expect(Number(r3.grossUsd)).toBeCloseTo(Number(r1.grossUsd) / 4, 4);
  });

  it("caps per referee at $100 and per cluster at $10,000 (spec §7.3)", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });

    // 200 referees × $100k volume each → gross = $250/referee → per-referee cap $100
    // → cluster total $20k → cluster cap scales to $10k → $50/referee.
    const vs = new MockVolumeSource();
    for (let i = 0; i < 200; i += 1) {
      const addr = `0xcccc${i.toString().padStart(36, "0")}`;
      await prisma.referralRelation.create({
        data: { referrerAddress: REFERRER, refereeAddress: addr, joinedEpochId: epochs[0].id },
      });
      vs.setVolume(addr, epochs[0].id, { ethereum: 100_000 });
    }

    const res = await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });
    expect(res.rewardsCreated).toBe(200);

    const rewards = await prisma.referralReward.findMany({ where: { epochId: epochs[0].id } });
    const totalFinal = rewards.reduce((acc, r) => acc + Number(r.finalUsd), 0);
    expect(totalFinal).toBeCloseTo(10_000, 4);
    rewards.forEach((r) => expect(Number(r.finalUsd)).toBeCloseTo(50, 4));
  });

  it("clamps referral rewards to the referee's paid fees when fee data is available", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 100_000 });
    vs.setFeesPaid(A, epochs[0].id, 10);

    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });

    const reward = await prisma.referralReward.findFirstOrThrow({
      where: { epochId: epochs[0].id },
    });
    expect(Number(reward.finalUsd)).toBeCloseTo(
      Math.min(100, 10 * env.REWARD_FEE_CLAMP_MULTIPLIER),
      4,
    );
  });

  it("is idempotent: re-finalize updates the same row, no duplicates", async () => {
    const { epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 5000 });

    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });
    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });

    const rows = await prisma.referralReward.findMany();
    expect(rows).toHaveLength(1);
  });

  it("never downgrades a contributor badge (spec §7.4 permanent)", async () => {
    const { season, epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: B, joinedEpochId: epochs[0].id },
    });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: C, joinedEpochId: epochs[0].id },
    });

    // Pre-seed a GOLD badge for A; later finalize should NOT downgrade.
    await prisma.seasonBadge.create({
      data: {
        address: A,
        seasonId: season.id,
        tier: "GOLD",
        topPercent: 1,
        totalVolumeContributedUsd: 100_000,
      },
    });

    // Now run finalize where A has the LOWEST volume (would compute BRONZE).
    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 2000 });
    vs.setVolume(B, epochs[0].id, { ethereum: 50_000 });
    vs.setVolume(C, epochs[0].id, { ethereum: 100_000 });

    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });

    const badgeA = await prisma.seasonBadge.findUnique({
      where: { address_seasonId: { address: A, seasonId: season.id } },
    });
    expect(badgeA?.tier).toBe("GOLD");
  });

  it("stores raw trading volume on contributor badges, not reward gross", async () => {
    const { season, epochs } = await seedSeasonWithEpochs();
    await prisma.referralLink.create({ data: { address: REFERRER, slug: REFERRER } });
    await prisma.referralRelation.create({
      data: { referrerAddress: REFERRER, refereeAddress: A, joinedEpochId: epochs[0].id },
    });

    const vs = new MockVolumeSource();
    vs.setVolume(A, epochs[0].id, { ethereum: 10_000 });

    await finalizeEpoch({ epochId: epochs[0].id, volumeSource: vs });

    const badge = await prisma.seasonBadge.findUniqueOrThrow({
      where: { address_seasonId: { address: A, seasonId: season.id } },
    });
    expect(Number(badge.totalVolumeContributedUsd)).toBe(10_000);
  });

  it("exports the spec §7.1 minimum volume constant", () => {
    expect(MIN_VALID_VOLUME_USD).toBe(2000);
  });
});
