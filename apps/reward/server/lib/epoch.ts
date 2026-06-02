import { env } from "@/server/env";

export const EPOCH_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;
export const EPOCHS_PER_SEASON = 12;
export const SEASON_LENGTH_MS = EPOCH_LENGTH_MS * EPOCHS_PER_SEASON;

export interface EpochCoords {
  seasonIndex: number; // 1-based
  epochIndex: number; // 1..12 within season
  epochStartsAt: Date;
  epochEndsAt: Date;
  seasonStartsAt: Date;
  seasonEndsAt: Date;
}

export function currentEpoch(now: Date = new Date()): EpochCoords {
  const elapsed = now.getTime() - env.GENESIS_TS.getTime();
  if (elapsed < 0) {
    // Pre-genesis: snap to season 1 epoch 1.
    return buildCoords(1, 1);
  }
  const seasonIndex = Math.floor(elapsed / SEASON_LENGTH_MS) + 1;
  const intoSeasonMs = elapsed % SEASON_LENGTH_MS;
  const epochIndex = Math.floor(intoSeasonMs / EPOCH_LENGTH_MS) + 1;
  return buildCoords(seasonIndex, epochIndex);
}

export function buildCoords(seasonIndex: number, epochIndex: number): EpochCoords {
  const seasonStart = env.GENESIS_TS.getTime() + (seasonIndex - 1) * SEASON_LENGTH_MS;
  const epochStart = seasonStart + (epochIndex - 1) * EPOCH_LENGTH_MS;
  return {
    seasonIndex,
    epochIndex,
    epochStartsAt: new Date(epochStart),
    epochEndsAt: new Date(epochStart + EPOCH_LENGTH_MS),
    seasonStartsAt: new Date(seasonStart),
    seasonEndsAt: new Date(seasonStart + SEASON_LENGTH_MS),
  };
}
