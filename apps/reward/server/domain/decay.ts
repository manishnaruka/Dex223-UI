// Spec 7.2: Epoch in which referee joined pays at 100%; each subsequent epoch halves.
// Both arguments are season-local 1..N indices.
export function decayPercent(joinedEpochIdx: number, currentEpochIdx: number): number {
  const stagesElapsed = Math.max(0, currentEpochIdx - joinedEpochIdx);
  return 100 / Math.pow(2, stagesElapsed);
}
