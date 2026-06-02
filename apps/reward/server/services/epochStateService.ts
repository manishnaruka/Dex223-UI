import { buildCoords, currentEpoch, EpochCoords } from "@/server/lib/epoch";
import { prisma } from "@/server/lib/prisma";

// Ensures a Season + Epoch row exists for the given coordinates and returns the Epoch row.
export async function getOrCreateEpoch(coords: EpochCoords) {
  const season = await prisma.season.upsert({
    where: { index: coords.seasonIndex },
    create: {
      index: coords.seasonIndex,
      startsAt: coords.seasonStartsAt,
      endsAt: coords.seasonEndsAt,
    },
    update: {},
  });

  return prisma.epoch.upsert({
    where: { seasonId_index: { seasonId: season.id, index: coords.epochIndex } },
    create: {
      seasonId: season.id,
      index: coords.epochIndex,
      startsAt: coords.epochStartsAt,
      endsAt: coords.epochEndsAt,
    },
    update: {},
  });
}

export async function getCurrentEpoch() {
  const coords = currentEpoch();
  const epoch = await getOrCreateEpoch(coords);
  return { coords, epoch };
}

export async function getEpochBySeasonIndex(seasonIndex: number, epochIndex: number) {
  return getOrCreateEpoch(buildCoords(seasonIndex, epochIndex));
}
