import { Address } from "viem";

export type ReferralBadge = "gold" | "silver" | "bronze";

export interface RefereeRow {
  address: Address;
  volume: number;
  decayStage: number;
  reward: number;
  badge: ReferralBadge;
}

export interface SeasonNftTierEntry {
  date: number;
  tier: ReferralBadge;
}

export interface ReferralData {
  totalReferees: number;
  combinedVolume: number;
  totalRewards: number;
  referees: RefereeRow[];
  referralLink: string;
  season: number;
  epochCurrent: number;
  epochTotal: number;
  progressPercent: number;
  epochEndsAt: number;
  seasonNftTier: "silver" | "gold" | "bronze";
  seasonNftTopPercent: number;
  seasonNftTimeline: SeasonNftTierEntry[];
}

export const mockReferralData: ReferralData = {
  totalReferees: 3,
  combinedVolume: 16500,
  totalRewards: 45,
  referees: [
    {
      address: "0x9e3000000000000000000000000000000000f110",
      volume: 9800,
      decayStage: 25,
      reward: 22,
      badge: "gold",
    },
    {
      address: "0xA3f000000000000000000000000000000000093C1",
      volume: 4200,
      decayStage: 50,
      reward: 15,
      badge: "silver",
    },
    {
      address: "0x7bE000000000000000000000000000000000011a5",
      volume: 2500,
      decayStage: 100,
      reward: 8,
      badge: "bronze",
    },
  ],
  referralLink:
    "app.dex223.io/?reference_address=0x1234567890abcdef1234567890abcdef12345678",
  season: 3,
  epochCurrent: 4,
  epochTotal: 12,
  progressPercent: 33,
  epochEndsAt: Date.now() + (3 * 24 * 60 * 60 + 5 * 60 * 60 + 8 * 60 + 37) * 1000,
  seasonNftTier: "silver",
  seasonNftTopPercent: 5,
  seasonNftTimeline: [
    { date: Date.UTC(2025, 9, 4), tier: "bronze" },
    { date: Date.UTC(2025, 10, 12), tier: "silver" },
  ],
};
