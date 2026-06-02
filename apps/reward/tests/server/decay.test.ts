import { describe, expect, it } from "vitest";

import { decayPercent } from "@/server/domain/decay";

describe("decayPercent", () => {
  it("returns 100 when joined and current epoch match (spec 7.2)", () => {
    expect(decayPercent(1, 1)).toBe(100);
    expect(decayPercent(5, 5)).toBe(100);
  });

  it("halves each epoch after join", () => {
    expect(decayPercent(1, 2)).toBe(50);
    expect(decayPercent(1, 3)).toBe(25);
    expect(decayPercent(1, 4)).toBe(12.5);
    expect(decayPercent(1, 5)).toBe(6.25);
  });

  it("clamps to 100 if currentEpochIdx is before join (defensive)", () => {
    expect(decayPercent(3, 1)).toBe(100);
  });
});
