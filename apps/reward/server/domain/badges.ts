import type { BadgeTier } from "@prisma/client";

// Spec 5.3 percentile cutoffs (reused for referee Contributor Badges per spec 7.4).
export function tierFromPercentile(topPercent: number): BadgeTier | null {
  if (topPercent <= 1) return "GOLD";
  if (topPercent <= 5) return "SILVER";
  if (topPercent <= 10) return "BRONZE";
  return null;
}

// Returns 1..100 where lower is better. Address must appear in the sorted list.
// Ties share the same percentile (the highest one in the tie group).
export function percentRank(sortedDescending: number[], value: number): number {
  if (sortedDescending.length === 0) return 100;
  const idx = sortedDescending.indexOf(value);
  if (idx === -1) return 100;
  // Position 0 → top 1 / N * 100 percentile. Use ceil so top entry is always ≥1%.
  return Math.max(1, Math.ceil(((idx + 1) / sortedDescending.length) * 100));
}

// "Never downgrade" rule (spec 7.4): given current + previous tier, return the best.
const TIER_RANK: Record<BadgeTier, number> = { BRONZE: 1, SILVER: 2, GOLD: 3 };
export function bestTier(a: BadgeTier | null, b: BadgeTier | null): BadgeTier | null {
  if (!a) return b;
  if (!b) return a;
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}
