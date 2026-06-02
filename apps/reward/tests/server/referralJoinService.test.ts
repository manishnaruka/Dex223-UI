import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getCurrentEpoch } from "@/server/services/epochStateService";
import { joinReferrer } from "@/server/services/referralJoinService";

const prisma = new PrismaClient();

const REFERRER = "0xaaaa000000000000000000000000000000000001";
const NEW_WALLET = "0xbbbb000000000000000000000000000000000002";
const OTHER = "0xcccc000000000000000000000000000000000003";

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
  await seedReferralLinks(REFERRER, NEW_WALLET, OTHER);
});

describe("joinReferrer (new users only)", () => {
  it("links a new wallet to its referrer and lowercases addresses", async () => {
    const relation = await joinReferrer({
      referee: NEW_WALLET.toUpperCase(),
      referrerSlug: REFERRER.toUpperCase(),
    });

    expect(relation.referrerAddress).toBe(REFERRER);
    expect(relation.refereeAddress).toBe(NEW_WALLET);

    const stored = await prisma.referralRelation.findUnique({
      where: { refereeAddress: NEW_WALLET },
    });
    expect(stored?.referrerAddress).toBe(REFERRER);
  });

  it("rejects self-referral", async () => {
    await expect(
      joinReferrer({ referee: NEW_WALLET, referrerSlug: NEW_WALLET }),
    ).rejects.toMatchObject({ status: 400, code: "SELF_REFERRAL" });
  });

  it("rejects an address-shaped slug that was never minted as a referral link", async () => {
    await prisma.referralLink.delete({ where: { address: REFERRER } });

    await expect(
      joinReferrer({ referee: NEW_WALLET, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 404, code: "BAD_SLUG" });
  });

  it("rejects a referee that already has a referrer", async () => {
    await joinReferrer({ referee: NEW_WALLET, referrerSlug: REFERRER });

    await expect(
      joinReferrer({ referee: NEW_WALLET, referrerSlug: OTHER }),
    ).rejects.toMatchObject({ status: 409, code: "ALREADY_LINKED" });
  });

  it("rejects an existing user who already operates as a referrer", async () => {
    // NEW_WALLET has its own referee → it is an established account, not a new signup.
    await joinReferrer({ referee: OTHER, referrerSlug: NEW_WALLET });

    await expect(
      joinReferrer({ referee: NEW_WALLET, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "NOT_NEW_WALLET" });
  });

  it("rejects a wallet with prior trade volume", async () => {
    const { epoch } = await getCurrentEpoch();
    await prisma.refereeVolumeSnapshot.create({
      data: { refereeAddress: NEW_WALLET, epochId: epoch.id, volumeUsd: 5000 },
    });

    await expect(
      joinReferrer({ referee: NEW_WALLET, referrerSlug: REFERRER }),
    ).rejects.toMatchObject({ status: 409, code: "NOT_NEW_WALLET" });
  });
});
