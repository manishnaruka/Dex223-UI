export type ChainId =
  | "ethereum"
  | "optimism"
  | "polygon"
  | "bsc"
  | "base"
  | "arbitrum"
  | "avalanche";

export interface ChainInfo {
  id: ChainId;
  label: string;
  logo: string;
}

export const chainInfo: Record<ChainId, ChainInfo> = {
  ethereum: { id: "ethereum", label: "Ethereum", logo: "/images/chains/ethereum.svg" },
  optimism: { id: "optimism", label: "Optimism", logo: "/images/chains/optimism.svg" },
  polygon: { id: "polygon", label: "Polygon", logo: "/images/chains/polygon.svg" },
  bsc: { id: "bsc", label: "BSC", logo: "/images/chains/bsc.svg" },
  base: { id: "base", label: "Base", logo: "/images/chains/base.svg" },
  arbitrum: { id: "arbitrum", label: "Arbitrum", logo: "/images/chains/arbitrum.svg" },
  avalanche: { id: "avalanche", label: "Avalanche", logo: "/images/chains/avalanche.svg" },
};

export interface OverviewRow {
  chain: ChainId;
  volume: string;
  fees: string;
}

export const overviewRows: OverviewRow[] = [
  { chain: "ethereum", volume: "$23,000", fees: "$320" },
  { chain: "optimism", volume: "$21,324", fees: "$246.9" },
  { chain: "polygon", volume: "$2,520", fees: "$64.24" },
  { chain: "bsc", volume: "$422", fees: "$31.21" },
];

export type StreakDayStatus = "completed" | "broken" | "today" | "upcoming" | "reset";

export interface StreakDay {
  day: number;
  label: string;
  status: StreakDayStatus;
}

export const streakTimeline: StreakDay[] = [
  { day: 1, label: "1 day", status: "completed" },
  { day: 2, label: "2 days", status: "completed" },
  { day: 3, label: "3 days", status: "broken" },
  { day: 4, label: "Today", status: "today" },
  { day: 5, label: "5 days", status: "upcoming" },
  { day: 6, label: "6 days", status: "upcoming" },
  { day: 7, label: "7 days", status: "reset" },
];

export type ClaimReceiptPool = "trading" | "social" | "referral";

export interface ClaimReceipt {
  id: string;
  pool: ClaimReceiptPool;
  hash: string;
  amount: string;
  chain: ChainId;
}

export const claimReceipts: ClaimReceipt[] = [
  { id: "c1", pool: "trading", hash: "0x3...b2c", amount: "0.2 ETH", chain: "ethereum" },
  { id: "c2", pool: "social", hash: "0x7...f8a4", amount: "123.13 USDC", chain: "ethereum" },
  { id: "c3", pool: "social", hash: "0xa...1aef", amount: "0.12 BNB", chain: "bsc" },
  { id: "c4", pool: "trading", hash: "0x3...ba2c", amount: "26.31 FTM", chain: "ethereum" },
  { id: "c5", pool: "referral", hash: "0x7...f8a4", amount: "76.22 USDC", chain: "ethereum" },
  { id: "c6", pool: "trading", hash: "0xa...1aef", amount: "87.2 GLMR", chain: "bsc" },
  { id: "c7", pool: "trading", hash: "0x3...ab2c", amount: "9.2 ONE", chain: "ethereum" },
  { id: "c8", pool: "social", hash: "v", amount: "12.3 MARSEC", chain: "ethereum" },
  { id: "c9", pool: "referral", hash: "0xa...1edf", amount: "23.2 BNB", chain: "bsc" },
  { id: "c10", pool: "social", hash: "0x7...f8a4", amount: "23.13 D223", chain: "ethereum" },
];

export type TradeSide = "buy" | "sell";
export type TradeEligibility = "eligible" | "ineligible" | "pending";

export interface TradeRow {
  id: string;
  date: string;
  time: string;
  chain: ChainId;
  venue: string;
  market: string;
  side: TradeSide;
  size: string;
  notional: string;
  fee: string;
  eligibility: TradeEligibility;
  points?: string;
  epoch: string;
}

export const tradeRows: TradeRow[] = [
  {
    id: "t1",
    date: "16 Oct 2025",
    time: "09:42",
    chain: "ethereum",
    venue: "DEX223",
    market: "ETH/USDT",
    side: "sell",
    size: "0.35 ETH",
    notional: "3,218 USDT / $1,142",
    fee: "0.0007 ETH",
    eligibility: "eligible",
    points: "38 pts = $0.19",
    epoch: "S1E3",
  },
  {
    id: "t2",
    date: "15 Oct 2025",
    time: "09:37",
    chain: "base",
    venue: "DEX223",
    market: "ARB/USDT",
    side: "buy",
    size: "2.5 ARB",
    notional: "3.08 USDT / $3.08",
    fee: "0.34 BASE",
    eligibility: "ineligible",
    epoch: "S1E3",
  },
  {
    id: "t3",
    date: "14 Oct 2025",
    time: "09:33",
    chain: "bsc",
    venue: "Pancake",
    market: "BNB/USDT",
    side: "sell",
    size: "0.5 BNB",
    notional: "158.75 USDT / $158.75",
    fee: "0.0005 BSC",
    eligibility: "eligible",
    points: "26 pts = $0.13",
    epoch: "S1E3",
  },
  {
    id: "t4",
    date: "13 Oct 2025",
    time: "09:32",
    chain: "ethereum",
    venue: "UniswapV3",
    market: "UNI/ETH",
    side: "buy",
    size: "5 UNI",
    notional: "0.075 ETH / $142.5",
    fee: "0.07 ETH",
    eligibility: "eligible",
    points: "14 pts = $0.07",
    epoch: "S1E3",
  },
  {
    id: "t5",
    date: "12 Oct 2025",
    time: "09:31",
    chain: "base",
    venue: "DEX223",
    market: "OP/USDT",
    side: "sell",
    size: "10 OP",
    notional: "20 USDT / $20",
    fee: "0.2 BASE",
    eligibility: "eligible",
    points: "21 pts = $0.10",
    epoch: "S1E3",
  },
  {
    id: "t6",
    date: "11 Oct 2025",
    time: "09:28",
    chain: "ethereum",
    venue: "DEX223",
    market: "WBTC/USDT",
    side: "buy",
    size: "0.1 WBTC",
    notional: "5,000 USDT / $5,000",
    fee: "0.00001 ETH",
    eligibility: "eligible",
    points: "52 pts = $0.26",
    epoch: "S1E3",
  },
  {
    id: "t7",
    date: "10 Oct 2025",
    time: "09:26",
    chain: "base",
    venue: "ApeSwap",
    market: "CAKE/BUSD",
    side: "sell",
    size: "5 CAKE",
    notional: "50 BUSD / $50",
    fee: "0.04 BASE",
    eligibility: "ineligible",
    epoch: "S1E3",
  },
  {
    id: "t8",
    date: "7 Oct 2025",
    time: "09:25",
    chain: "ethereum",
    venue: "DEX223",
    market: "ETH/USDC",
    side: "sell",
    size: "0.35 ETH",
    notional: "531 USDC / $531",
    fee: "0.0004 ETH",
    eligibility: "pending",
    epoch: "S1E3",
  },
  {
    id: "t9",
    date: "6 Oct 2025",
    time: "09:25",
    chain: "bsc",
    venue: "DEX223",
    market: "LINK/USDT",
    side: "buy",
    size: "3 LINK",
    notional: "45 USDT / $45",
    fee: "0.005 BSC",
    eligibility: "eligible",
    points: "24 pts = $0.12",
    epoch: "S1E3",
  },
  {
    id: "t10",
    date: "2 Oct 2025",
    time: "09:12",
    chain: "ethereum",
    venue: "DEX223",
    market: "AVAX/USDT",
    side: "buy",
    size: "1.2 AVAX",
    notional: "36 USDT / $36",
    fee: "0.02 ETH",
    eligibility: "ineligible",
    epoch: "S1E3",
  },
];

export type ClaimStatus = "claimed" | "unclaimed" | "pending";

export interface ClaimRow {
  id: string;
  pool: "Trading" | "Social" | "Referral";
  chain: ChainId;
  epoch: string;
  amount: string;
  status: ClaimStatus;
  rootId: string;
  schema: string;
  leaf: string;
  transaction: string;
  canClaim: boolean;
}

export const claimRows: ClaimRow[] = [
  {
    id: "k1",
    pool: "Trading",
    chain: "base",
    epoch: "S1E3",
    amount: "2.5 LINK / $45",
    status: "unclaimed",
    rootId: "root-2025-10-12T18:00Z",
    schema: "v1.0",
    leaf: "0x9cd...4a93",
    transaction: "0x2d3...89b4",
    canClaim: true,
  },
  {
    id: "k2",
    pool: "Social",
    chain: "bsc",
    epoch: "S1E3",
    amount: "0.2 AAVE / $120",
    status: "claimed",
    rootId: "root-2025-10-12T18:00Z",
    schema: "1.1",
    leaf: "0x5f0...e7cc",
    transaction: "0x7af...c331",
    canClaim: false,
  },
  {
    id: "k3",
    pool: "Referral",
    chain: "ethereum",
    epoch: "S1E2",
    amount: "0.35 ETH / $1,410.64",
    status: "claimed",
    rootId: "root-2025-10-05T18:00Z",
    schema: "v1.0",
    leaf: "0x2d3...89b4",
    transaction: "0x4be...f921",
    canClaim: false,
  },
  {
    id: "k4",
    pool: "Trading",
    chain: "base",
    epoch: "S1E2",
    amount: "5 OP / $0.75",
    status: "pending",
    rootId: "—",
    schema: "v1.0",
    leaf: "—",
    transaction: "0x89f...e410",
    canClaim: false,
  },
  {
    id: "k5",
    pool: "Trading",
    chain: "bsc",
    epoch: "S1E1",
    amount: "18.76 USDT / $18.76",
    status: "claimed",
    rootId: "root-2025-10-10T18:00Z",
    schema: "1.1",
    leaf: "0x7a1...c2f9",
    transaction: "0xa10...bd2f",
    canClaim: false,
  },
  {
    id: "k6",
    pool: "Social",
    chain: "ethereum",
    epoch: "S1E1",
    amount: "20.15 USDC / $20.15",
    status: "claimed",
    rootId: "root-2025-09-29T18:00Z",
    schema: "v1.0",
    leaf: "0xabf...71d0",
    transaction: "0x54c...7b02",
    canClaim: false,
  },
  {
    id: "k7",
    pool: "Trading",
    chain: "ethereum",
    epoch: "S1E1",
    amount: "890 USDT / $890",
    status: "unclaimed",
    rootId: "root-2025-10-08T18:00Z",
    schema: "1.2",
    leaf: "0x4e8...2af1",
    transaction: "0x6dd...c992",
    canClaim: true,
  },
  {
    id: "k8",
    pool: "Referral",
    chain: "bsc",
    epoch: "S1E1",
    amount: "36.88 USDT / $36.88",
    status: "claimed",
    rootId: "root-2025-09-29T18:00Z",
    schema: "v1.0",
    leaf: "0x9cd...4a92",
    transaction: "0x1ff...a004",
    canClaim: false,
  },
  {
    id: "k9",
    pool: "Trading",
    chain: "bsc",
    epoch: "S1E1",
    amount: "250 USDT / $250",
    status: "claimed",
    rootId: "root-2025-10-12T18:00Z",
    schema: "v1.0",
    leaf: "0xb3a...f11c",
    transaction: "0x93a...2e89",
    canClaim: false,
  },
  {
    id: "k10",
    pool: "Trading",
    chain: "ethereum",
    epoch: "S1E1",
    amount: "3,400 D223 / $23",
    status: "unclaimed",
    rootId: "root-2025-10-12T18:00Z",
    schema: "1.1",
    leaf: "0x8ee...2b74",
    transaction: "0xb21...11d5",
    canClaim: true,
  },
];

export const drillDownSummary = {
  totalEligibleTrades: 128,
  totalClaimed: "$4,250",
  pendingValue: "$1,120",
  totalTrades: 34345,
  totalClaims: 3422,
};

export const seasonOptions = [
  { value: "all", label: "All seasons" },
  { value: "s1", label: "S1" },
  { value: "s2", label: "S2" },
  { value: "s3", label: "S3" },
  { value: "s4", label: "S4" },
];

export const epochOptions = [
  { value: "all", label: "All epochs" },
  { value: "s1e1", label: "S1E1" },
  { value: "s1e2", label: "S1E2" },
  { value: "s1e3", label: "S1E3" },
  { value: "s1e4", label: "S1E4" },
];

export const chainOptions = [
  { value: "all", label: "All chains" },
  { value: "ethereum", label: "Ethereum", logo: chainInfo.ethereum.logo },
  { value: "bsc", label: "Binance Smart Chain", logo: chainInfo.bsc.logo },
  { value: "base", label: "Base", logo: chainInfo.base.logo },
];

export const dexOptions = [
  { value: "all", label: "All DEXes" },
  { value: "dex223", label: "DEX223" },
  { value: "pancake", label: "Pancake" },
  { value: "uniswapv3", label: "UniswapV3" },
];

export const marketOptions = [
  { value: "all", label: "All pairs" },
  { value: "eth-usdt", label: "ETH/USDT" },
  { value: "arb-usdt", label: "ARB/USDT" },
  { value: "bnb-usdt", label: "BNB/USDT" },
  { value: "uni-eth", label: "UNI/ETH" },
];

export const sideOptions = [
  { value: "all", label: "All sides" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

export const eligibilityReasonOptions = [
  { value: "all", label: "All reasons" },
  { value: "min-notional", label: "Min notional met (≥ $500)" },
  { value: "matched-maker", label: "Matched maker volume rule (≥ $10)" },
  { value: "market-allowed", label: "Market allowed for rewards" },
  { value: "active-epoch", label: "Trade within active epoch" },
];

export const poolOptions = [
  { value: "all", label: "All pools" },
  { value: "trading", label: "Trading" },
  { value: "social", label: "Social" },
  { value: "referral", label: "Referral" },
];

export const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "claimed", label: "Claimed" },
  { value: "pending", label: "Pending" },
];
