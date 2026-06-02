import { describe, expect, it } from "vitest";

import { bestTier, percentRank, tierFromPercentile } from "@/server/domain/badges";

describe("tierFromPercentile (spec 5.3 / 7.4)", () => {
  it("maps top 1% to GOLD", () => {
    expect(tierFromPercentile(0.5)).toBe("GOLD");
    expect(tierFromPercentile(1)).toBe("GOLD");
  });

  it("maps top 5% to SILVER", () => {
    expect(tierFromPercentile(3)).toBe("SILVER");
    expect(tierFromPercentile(5)).toBe("SILVER");
  });

  it("maps top 10% to BRONZE", () => {
    expect(tierFromPercentile(8)).toBe("BRONZE");
    expect(tierFromPercentile(10)).toBe("BRONZE");
  });

  it("returns null outside top 10%", () => {
    expect(tierFromPercentile(12)).toBeNull();
    expect(tierFromPercentile(50)).toBeNull();
  });
});

describe("percentRank", () => {
  it("returns 100 for empty list", () => {
    expect(percentRank([], 5)).toBe(100);
  });

  it("returns at least 1% for top entry", () => {
    const sorted = [100, 80, 60, 40, 20];
    expect(percentRank(sorted, 100)).toBe(20);
  });

  it("places values in correct percentile buckets", () => {
    const sorted = Array.from({ length: 100 }, (_, i) => 100 - i);
    expect(percentRank(sorted, 100)).toBe(1);
    expect(percentRank(sorted, 96)).toBe(5);
    expect(percentRank(sorted, 91)).toBe(10);
  });
});

describe("bestTier (never-downgrade rule, spec 7.4)", () => {
  it("returns the higher tier when both present", () => {
    expect(bestTier("BRONZE", "GOLD")).toBe("GOLD");
    expect(bestTier("SILVER", "BRONZE")).toBe("SILVER");
  });

  it("returns the non-null one when one is null", () => {
    expect(bestTier(null, "SILVER")).toBe("SILVER");
    expect(bestTier("GOLD", null)).toBe("GOLD");
  });

  it("returns null when both null", () => {
    expect(bestTier(null, null)).toBeNull();
  });
});
