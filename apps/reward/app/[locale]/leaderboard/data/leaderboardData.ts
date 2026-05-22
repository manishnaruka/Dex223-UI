import { Address } from "viem";

export type NftTier = "gold" | "silver" | "bronze";
export type LeaderboardView = "top10" | "top1000" | "cluster";

export interface LeaderboardRow {
  rank: number;
  wallet: Address;
  points: number;
  tier: NftTier;
  highlighted?: boolean;
}

export const leaderboardViewLabels: Record<LeaderboardView, string> = {
  top10: "Top 10",
  top1000: "Top 1000",
  cluster: "My cluster",
};

export const topLeaderboardRows: LeaderboardRow[] = [
  {
    rank: 1,
    wallet: "0xA3f000000000000000000000000000000000093C1",
    points: 1200,
    tier: "gold",
  },
  {
    rank: 2,
    wallet: "0x5f4000000000000000000000000000000000c322",
    points: 1127,
    tier: "silver",
  },
  {
    rank: 3,
    wallet: "0x9e3000000000000000000000000000000000f110",
    points: 1054,
    tier: "bronze",
  },
  {
    rank: 4,
    wallet: "0x0d70000000000000000000000000000000006a13",
    points: 981,
    tier: "bronze",
  },
  {
    rank: 5,
    wallet: "0x64b000000000000000000000000000000000ea20",
    points: 824,
    tier: "bronze",
  },
  {
    rank: 6,
    wallet: "0x5f4000000000000000000000000000000000c3b2",
    points: 756,
    tier: "bronze",
  },
  {
    rank: 7,
    wallet: "0x19d000000000000000000000000000000000b831",
    points: 732,
    tier: "bronze",
  },
  {
    rank: 8,
    wallet: "0xf18300000000000000000000000000000000141F",
    points: 689,
    tier: "bronze",
    highlighted: true,
  },
  {
    rank: 9,
    wallet: "0xA3f0000000000000000000000000000000009C21",
    points: 616,
    tier: "bronze",
  },
  {
    rank: 10,
    wallet: "0x7bE00000000000000000000000000000000011a5",
    points: 543,
    tier: "bronze",
  },
];

export const clusterLeaderboardRows: LeaderboardRow[] = [
  1099, 1098, 1098, 1096, 1096, 1096, 1095, 1095, 1094, 1090, 1089, 1089, 1085, 1067, 1065, 1055,
  1050, 1047, 1043, 1032, 1026, 1024, 1020,
].map((points, index) => ({
  rank: 26 + index,
  wallet: topLeaderboardRows[index % topLeaderboardRows.length].wallet,
  points,
  tier: "bronze" as const,
  highlighted: 26 + index === 34,
}));

export const formatLeaderboardWallet = (wallet: string) =>
  `${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
