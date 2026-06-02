// Spec 7.3 cap constants.
export const PER_REFEREE_CAP_USD = 100;
export const PER_CLUSTER_CAP_USD = 10_000;

export function applyPerRefereeCap(grossUsd: number): number {
  return Math.min(grossUsd, PER_REFEREE_CAP_USD);
}

// If the sum of one referrer's per-referee rewards exceeds the cluster cap,
// scale every entry by the same factor so the sum equals the cap exactly
// and relative shares are preserved.
export function applyClusterCap(perRefereeUsd: number[]): number[] {
  const total = perRefereeUsd.reduce((a, b) => a + b, 0);
  if (total <= PER_CLUSTER_CAP_USD) return perRefereeUsd;
  const scale = PER_CLUSTER_CAP_USD / total;
  return perRefereeUsd.map((v) => v * scale);
}
