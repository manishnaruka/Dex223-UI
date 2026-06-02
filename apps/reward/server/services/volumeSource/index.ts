// Spec 1: volume is summed across Ethereum + Base + BSC for the same address.
// Implementations must aggregate across chains before returning.
export interface VolumeSource {
  getEpochVolumeUsd(address: string, epochId: number): Promise<number>;
  getEpochFeesPaidUsd?(address: string, epochId: number): Promise<number | null>;
}

export { MockVolumeSource } from "./mockVolumeSource";
