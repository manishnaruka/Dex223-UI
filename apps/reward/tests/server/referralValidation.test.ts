import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { env } from "@/server/env";
import { getCurrentEpoch } from "@/server/services/epochStateService";
import { joinReferrer } from "@/server/services/referralJoinService";
import { finalizeEpoch } from "@/server/services/referralRewardService";
import { buildReferralData } from "@/server/services/referralViewService";
import { MockVolumeSource } from "@/server/services/volumeSource";

// End-to-end acceptance validation for the referral system. Each block maps to a
// requested condition and drives the real services: joinReferrer (signup) →
// finalizeEpoch (trade settlement) → buildReferralData (the referrer's list view).

const prisma = new PrismaClient();

const REFERRER = "0xaaaa000000000000000000000000000000000001";
const OTHER_REFERRER = "0xaaaa000000000000000000000000000000000009";
const NEW_USER = "0xbbbb000000000000000000000000000000000002";
const EXISTING = "0xcccc000000000000000000000000000000000003";
const THIRD = "0xdddd000000000000000000000000000000000004";

// Mirrors the gross→per-referee-cap math in referralRewardService for a single
// referee (cluster cap never binds with one referee). decay defaults to 100 in
// the epoch the referee joined.
function expectedReward(volumeUsd: number, decay = 100): number {
  const gross = ((volumeUsd * env.REWARD_RATE_BPS) / 10_000) * (decay / 100);
  return Math.round(Math.min(gross, 100));
}

async function clean() {
  await prisma.referralReward.deleteMany();
  await prisma.refereeVolumeSnapshot.deleteMany();
  await prisma.seasonBadge.deleteMany();
  await prisma.referralRelation.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.epoch.deleteMany();
  await prisma.season.deleteMany();
}

async function seedReferralLinks(...addresses: string[]) {
  for (const address of addresses) {
    const slug = address.toLowerCase();
    await prisma.referralLink.upsert({
      where: { address: slug },
      create: { address: slug, slug },
      update: {},
    });
  }
}

afterAll(async () => {
  await clean();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await clean();
  await seedReferralLinks(REFERRER, OTHER_REFERRER, NEW_USER, EXISTING);
});

describe("referral validation: new user → connect → trade", () => {
  it("referee appears in the referrer's list with details, volume, and reward after a completed trade", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });

    const { epoch } = await getCurrentEpoch();
    const vs = new MockVolumeSource();
    vs.setVolume(NEW_USER, epoch.id, { ethereum: 10_000 });
    await finalizeEpoch({ epochId: epoch.id, volumeSource: vs });

    const data = await buildReferralData({ viewer: REFERRER });

    expect(data.totalReferees).toBe(1);
    expect(data.referees).toHaveLength(1);

    const [row] = data.referees;
    expect(row.address).toBe(NEW_USER); // referee details
    expect(row.volume).toBe(10_000); // trading volume
    expect(row.reward).toBe(expectedReward(10_000)); // referral reward/amount
    expect(row.reward).toBeGreaterThan(0);

    expect(data.combinedVolume).toBe(10_000);
    expect(data.totalRewards).toBe(expectedReward(10_000));
  });
});

describe("referral validation: reward only after a successful trade", () => {
  it("a referred user with no completed trade is listed but earns zero reward", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });

    // No trade, no finalize.
    const data = await buildReferralData({ viewer: REFERRER });

    expect(data.referees).toHaveLength(1);
    expect(data.referees[0].address).toBe(NEW_USER);
    expect(data.referees[0].volume).toBe(0);
    expect(data.referees[0].reward).toBe(0);

    const rewards = await prisma.referralReward.findMany();
    expect(rewards).toHaveLength(0);
  });

  it("a trade below the $2,000 valid-volume gate records volume but triggers no reward", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });

    const { epoch } = await getCurrentEpoch();
    const vs = new MockVolumeSource();
    vs.setVolume(NEW_USER, epoch.id, { ethereum: 1_500 });
    await finalizeEpoch({ epochId: epoch.id, volumeSource: vs });

    const data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees[0].volume).toBe(1_500);
    expect(data.referees[0].reward).toBe(0);
    expect(await prisma.referralReward.count()).toBe(0);
  });
});

describe("referral validation: links apply to new users only", () => {
  it("a wallet with prior trade volume cannot apply a referral and is not added to any list", async () => {
    const { epoch } = await getCurrentEpoch();
    await prisma.refereeVolumeSnapshot.create({
      data: { refereeAddress: EXISTING, epochId: epoch.id, volumeUsd: 5_000 },
    });

    await expect(
      joinReferrer({ referee: EXISTING, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "NOT_NEW_WALLET" });

    const data = await buildReferralData({ viewer: REFERRER });
    expect(data.totalReferees).toBe(0);
    expect(data.referees).toHaveLength(0);
  });

  it("a wallet that already operates as a referrer cannot become a referee", async () => {
    // EXISTING is an established account: it already referred THIRD.
    await joinReferrer({ referee: THIRD, referrerSlug: EXISTING });

    await expect(
      joinReferrer({ referee: EXISTING, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "NOT_NEW_WALLET" });

    const data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees.some((r) => r.address === EXISTING)).toBe(false);
  });

  it("rejects self-referral", async () => {
    await expect(
      joinReferrer({ referee: NEW_USER, referrerSlug: NEW_USER }),
    ).rejects.toMatchObject({ status: 400, code: "SELF_REFERRAL" });
  });
});

describe("referral validation: edge cases", () => {
  it("duplicate referral attempts are rejected and never create a second list entry", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });

    // Same link again, and a different link — both must fail.
    await expect(
      joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "ALREADY_LINKED" });
    await expect(
      joinReferrer({ referee: NEW_USER, referrerSlug: OTHER_REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "ALREADY_LINKED" });

    const { epoch } = await getCurrentEpoch();
    const vs = new MockVolumeSource();
    vs.setVolume(NEW_USER, epoch.id, { ethereum: 5_000 });
    await finalizeEpoch({ epochId: epoch.id, volumeSource: vs });

    const data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees).toHaveLength(1);
    expect(await prisma.referralRelation.count()).toBe(1);
  });

  it("multiple trades by the same referee aggregate into one capped entry (no duplicate rows)", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });

    const { epoch } = await getCurrentEpoch();
    const vs = new MockVolumeSource();
    // Many trades across chains within the epoch settle to one aggregated volume.
    vs.setVolume(NEW_USER, epoch.id, { ethereum: 40_000, base: 30_000, bsc: 30_000 });
    await finalizeEpoch({ epochId: epoch.id, volumeSource: vs });

    const data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees).toHaveLength(1);
    expect(data.referees[0].volume).toBe(100_000);
    expect(data.referees[0].reward).toBe(100); // per-referee cap binds
    expect(await prisma.referralReward.count()).toBe(1);
    expect(await prisma.refereeVolumeSnapshot.count()).toBe(1);
  });

  it("referral link reuse by an existing account is rejected", async () => {
    // An account that already completed a referral cannot reuse another link.
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });
    await expect(
      joinReferrer({ referee: NEW_USER, referrerSlug: OTHER_REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "ALREADY_LINKED" });

    // An established referrer cannot reuse a link to enroll itself as a referee.
    await expect(
      joinReferrer({ referee: REFERRER, referrerSlug: OTHER_REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "NOT_NEW_WALLET" });
  });

  it("delayed trade completion updates are reflected after re-finalization (idempotent)", async () => {
    await joinReferrer({ referee: NEW_USER, referrerSlug: REFERRER });
    const { epoch } = await getCurrentEpoch();

    // First settlement: the trade has not landed yet → no reward.
    const empty = new MockVolumeSource();
    await finalizeEpoch({ epochId: epoch.id, volumeSource: empty });

    let data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees[0].volume).toBe(0);
    expect(data.referees[0].reward).toBe(0);

    // The trade completes later; the same epoch is re-finalized.
    const vs = new MockVolumeSource();
    vs.setVolume(NEW_USER, epoch.id, { ethereum: 8_000 });
    await finalizeEpoch({ epochId: epoch.id, volumeSource: vs });

    data = await buildReferralData({ viewer: REFERRER });
    expect(data.referees[0].volume).toBe(8_000);
    expect(data.referees[0].reward).toBe(expectedReward(8_000));
    // No duplicate rows from the second finalize.
    expect(await prisma.referralReward.count()).toBe(1);
    expect(await prisma.refereeVolumeSnapshot.count()).toBe(1);
  });
});
