import type { VolumeSource } from "./index";

interface MultiChainVolume {
  ethereum?: number;
  base?: number;
  bsc?: number;
}

type Fixture = Record<string, Record<number, MultiChainVolume>>;
type FeeFixture = Record<string, Record<number, number>>;

// In-memory fixture-backed implementation. Keys are lowercased addresses; values are
// per-epoch multi-chain volumes (USD). getEpochVolumeUsd sums them per spec 1.
export class MockVolumeSource implements VolumeSource {
  private fixture: Fixture = {};
  private feeFixture: FeeFixture = {};

  setVolume(address: string, epochId: number, volume: MultiChainVolume): void {
    const key = address.toLowerCase();
    this.fixture[key] ??= {};
    this.fixture[key][epochId] = volume;
  }

  setFeesPaid(address: string, epochId: number, feesUsd: number): void {
    const key = address.toLowerCase();
    this.feeFixture[key] ??= {};
    this.feeFixture[key][epochId] = feesUsd;
  }

  async getEpochVolumeUsd(address: string, epochId: number): Promise<number> {
    const v = this.fixture[address.toLowerCase()]?.[epochId];
    if (!v) return 0;
    return (v.ethereum ?? 0) + (v.base ?? 0) + (v.bsc ?? 0);
  }

  async getEpochFeesPaidUsd(address: string, epochId: number): Promise<number | null> {
    return this.feeFixture[address.toLowerCase()]?.[epochId] ?? null;
  }
}
