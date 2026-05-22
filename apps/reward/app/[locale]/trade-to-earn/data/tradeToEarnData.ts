export type StreakState = "broken" | "active" | "target_met" | "new";

export type FomoEventType = "jackpot" | "near_miss" | "nft_upgrade";

export interface StreakSnapshot {
  dailyRequirement: string;
  counterpartiesRequirement: string;
  validVolume: string;
  feesPaid: string;
  counterparties: string;
  clamp: string;
  todayProgress: string;
  todayProgressPercent: number;
  todayTimeLeft: string;
  currentStreakDays: number;
  multiplierBoost: string;
}

export interface LootBoxSnapshot {
  jackpotOdds: string;
  nextLootProgress: string;
  nextLootProgressPercent: number;
  recentLootUsdt: string;
  recentLootFeeCredit: string;
  chainContributions: Array<{ chain: string; amount: string }>;
  epochBonus: string;
  epochBonusProgressPercent: number;
}

export interface FomoFeedEvent {
  id: string;
  type: FomoEventType;
  text: string;
  isMyWin: boolean;
}

export interface TradeToEarnData {
  streak: StreakSnapshot;
  lootBox: LootBoxSnapshot;
  fomoFeed: FomoFeedEvent[];
}

export const mockTradeToEarnData: TradeToEarnData = {
  streak: {
    dailyRequirement: "$1,500",
    counterpartiesRequirement: "≥10 counterparties",
    validVolume: "$23,542",
    feesPaid: "$112.24",
    counterparties: "12",
    clamp: "rewards <4x fees",
    todayProgress: "$900/$1,500",
    todayProgressPercent: 60,
    todayTimeLeft: "8h 12m left",
    currentStreakDays: 5,
    multiplierBoost: "+10%",
  },
  lootBox: {
    jackpotOdds: "1 / 1,000",
    nextLootProgress: "$10,000/$10,000",
    nextLootProgressPercent: 100,
    recentLootUsdt: "+12 USDT",
    recentLootFeeCredit: "+5 fee",
    chainContributions: [
      { chain: "Ethereum", amount: "$14,000" },
      { chain: "Base", amount: "$6,500" },
      { chain: "BSC", amount: "$3,040" },
    ],
    epochBonus: "8%/25%",
    epochBonusProgressPercent: 32,
  },
  fomoFeed: [
    {
      id: "34245",
      type: "jackpot",
      text: "0x9f…ab won $500 USDT jackpot on Base #DEX223JP-E4-BAB",
      isMyWin: false,
    },
    {
      id: "34244",
      type: "near_miss",
      text: "0x51…cd was 0.3% from jackpot on Ethereum",
      isMyWin: false,
    },
    {
      id: "34243",
      type: "nft_upgrade",
      text: "0xA1…77 upgraded NFT Bronze → Silver (Season 3)",
      isMyWin: false,
    },
    {
      id: "34242",
      type: "near_miss",
      text: "0xA1…2B was 0.5% from jackpot on Base",
      isMyWin: false,
    },
    {
      id: "34241",
      type: "nft_upgrade",
      text: "0x9C…E2 upgraded NFT Silver → Gold (Season 3)",
      isMyWin: true,
    },
    {
      id: "34239",
      type: "jackpot",
      text: "0x9f…ab won $500 USDT jackpot on Base #DEX223JP-E4-BAB",
      isMyWin: false,
    },
    {
      id: "34238",
      type: "nft_upgrade",
      text: "0x9C…E2 upgraded NFT Silver → Gold (Season 3)",
      isMyWin: false,
    },
    {
      id: "34237",
      type: "jackpot",
      text: "0x9f…ab won $500 USDT jackpot on Base #DEX223JP-E4-BAB",
      isMyWin: false,
    },
    {
      id: "34236",
      type: "near_miss",
      text: "0xA4…7E was 0.5% from jackpot on Base",
      isMyWin: false,
    },
    {
      id: "34235",
      type: "jackpot",
      text: "0x4E…2F won $1,000 USDT jackpot on Base #DEX223JP-A1-9F2",
      isMyWin: false,
    },
  ],
};

export const disconnectedStreakSnapshot: StreakSnapshot = {
  dailyRequirement: "$1,500",
  counterpartiesRequirement: "≥10 counterparties",
  validVolume: "$—",
  feesPaid: "$—",
  counterparties: "—",
  clamp: "—",
  todayProgress: "$—/$1,500",
  todayProgressPercent: 0,
  todayTimeLeft: "8h 12m left",
  currentStreakDays: 0,
  multiplierBoost: "+10%",
};
