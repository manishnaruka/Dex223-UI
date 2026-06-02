import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

// Lightweight .env loader — avoids adding a dotenv dependency.
function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (process.env[k] === undefined) process.env[k] = v;
  }
}
loadEnv(path.resolve(__dirname, "..", ".env"));

const prisma = new PrismaClient();

// Referrer address: SEED_REFERRER env var if set, otherwise a stable demo address.
// Lets you re-run the seed against any connected wallet to populate its dashboard.
const REFERRER = (
  process.env.SEED_REFERRER ?? "0x1234567890abcdef1234567890abcdef12345678"
).toLowerCase();

interface RefereeSeed {
  address: string;
  // 0-based index into the closed-epoch window when this referee joined.
  // 0 = oldest of the 3 closed epochs, 2 = most recent.
  joinedOffsetInWindow: number;
  // Cross-chain volume (USD) per epoch in the window. Index aligns with the window
  // (entries before joinedOffsetInWindow should be 0).
  volumesByWindowEpoch: number[];
}

const REFEREES: RefereeSeed[] = [
  // Joined at the oldest closed epoch in the window → 25% decay by the latest closed.
  {
    address: "0x9e30000000000000000000000000000000000110".toLowerCase(),
    joinedOffsetInWindow: 0,
    volumesByWindowEpoch: [3200, 3200, 3400],
  },
  // Joined one epoch later → 50% decay by the latest closed.
  {
    address: "0xa3f000000000000000000000000000000000093c".toLowerCase(),
    joinedOffsetInWindow: 1,
    volumesByWindowEpoch: [0, 2100, 2100],
  },
  // Joined in the most recent closed epoch → 100% decay.
  {
    address: "0x7be000000000000000000000000000000000011a".toLowerCase(),
    joinedOffsetInWindow: 2,
    volumesByWindowEpoch: [0, 0, 2500],
  },
];

async function main() {
  // Dynamic imports so loadEnv runs before server/env.ts validates process.env.
  const { currentEpoch, EPOCH_LENGTH_MS } = await import("../server/lib/epoch");
  const { finalizeEpoch } = await import("../server/services/referralRewardService");
  const { MockVolumeSource } = await import("../server/services/volumeSource");

  const coords = currentEpoch();
  const seasonIdx = coords.seasonIndex;
  const currentEpochIdx = coords.epochIndex;

  // Window of closed epochs to seed: the most recent 3 before the open epoch.
  // Shrinks early in a season when fewer than 3 epochs have elapsed.
  const windowSize = Math.min(3, Math.max(0, currentEpochIdx - 1));
  const firstWindowEpochIdx = currentEpochIdx - windowSize;

  const season = await prisma.season.upsert({
    where: { index: seasonIdx },
    create: {
      index: seasonIdx,
      startsAt: coords.seasonStartsAt,
      endsAt: coords.seasonEndsAt,
    },
    update: {},
  });

  const epochIds: number[] = [];
  for (let i = 1; i <= 12; i += 1) {
    const startsAt = new Date(
      coords.seasonStartsAt.getTime() + (i - 1) * EPOCH_LENGTH_MS,
    );
    const e = await prisma.epoch.upsert({
      where: { seasonId_index: { seasonId: season.id, index: i } },
      create: {
        seasonId: season.id,
        index: i,
        startsAt,
        endsAt: new Date(startsAt.getTime() + EPOCH_LENGTH_MS),
        status: "OPEN",
      },
      // Reset to OPEN so finalizeEpoch can re-run cleanly on every reseed.
      update: { status: "OPEN" },
    });
    epochIds.push(e.id);
  }

  await prisma.referralLink.upsert({
    where: { address: REFERRER },
    create: { address: REFERRER, slug: REFERRER },
    update: {},
  });

  for (const seed of REFEREES) {
    if (seed.joinedOffsetInWindow >= windowSize) continue;
    const joinedAbsIdx = firstWindowEpochIdx + seed.joinedOffsetInWindow;
    const joinedEpochId = epochIds[joinedAbsIdx - 1];
    await prisma.referralRelation.upsert({
      where: { refereeAddress: seed.address },
      create: {
        referrerAddress: REFERRER,
        refereeAddress: seed.address,
        joinedEpochId,
      },
      // Re-point an existing relation at the current season's epoch / referrer
      // so reseeding against a new SEED_REFERRER or after time has advanced works.
      update: { referrerAddress: REFERRER, joinedEpochId },
    });
  }

  const volumeSource = new MockVolumeSource();
  for (const seed of REFEREES) {
    for (let i = 0; i < windowSize; i += 1) {
      const volumeUsd = seed.volumesByWindowEpoch[i] ?? 0;
      if (volumeUsd === 0) continue;
      const absIdx = firstWindowEpochIdx + i;
      const epochId = epochIds[absIdx - 1];
      volumeSource.setVolume(seed.address, epochId, { ethereum: volumeUsd });
    }
  }

  // Run the real finalize engine so RefereeVolumeSnapshot, ReferralReward,
  // and SeasonBadge populate exactly as production would.
  for (let i = 0; i < windowSize; i += 1) {
    const absIdx = firstWindowEpochIdx + i;
    await finalizeEpoch({ epochId: epochIds[absIdx - 1], volumeSource });
  }

  console.log("Seed complete:");
  console.log(`  season: ${seasonIdx} (current epoch ${currentEpochIdx} OPEN)`);
  console.log(`  closed epochs seeded: ${windowSize}`);
  console.log(`  referrer: ${REFERRER} (slug=${REFERRER})`);
  console.log(`  referees: ${REFEREES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
