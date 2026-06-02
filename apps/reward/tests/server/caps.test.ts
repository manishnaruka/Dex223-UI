import { describe, expect, it } from "vitest";

import {
  applyClusterCap,
  applyPerRefereeCap,
  PER_CLUSTER_CAP_USD,
  PER_REFEREE_CAP_USD,
} from "@/server/domain/caps";

describe("applyPerRefereeCap (spec 7.3)", () => {
  it("returns the value when below cap", () => {
    expect(applyPerRefereeCap(80)).toBe(80);
  });

  it("caps at $100", () => {
    expect(applyPerRefereeCap(150)).toBe(PER_REFEREE_CAP_USD);
  });
});

describe("applyClusterCap (spec 7.3)", () => {
  it("returns input unchanged when total is at or below cluster cap", () => {
    const input = [1000, 2000, 3000];
    expect(applyClusterCap(input)).toEqual(input);
  });

  it("scales proportionally when total exceeds $10,000", () => {
    const input = Array(200).fill(80); // total $16,000 → scale 10000/16000 = 0.625
    const out = applyClusterCap(input);
    const total = out.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(PER_CLUSTER_CAP_USD, 6);
    expect(out[0]).toBeCloseTo(50, 6);
  });

  it("preserves relative shares under scaling", () => {
    const input = [50, 100, 150]; // total 300, scaled down hypothetically
    const big = input.map((v) => v * 200); // total 60_000
    const out = applyClusterCap(big);
    // Ratios should still be 1:2:3
    expect(out[1] / out[0]).toBeCloseTo(2, 6);
    expect(out[2] / out[0]).toBeCloseTo(3, 6);
  });
});
