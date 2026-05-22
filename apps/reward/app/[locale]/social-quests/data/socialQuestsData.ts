export type QuestConfidence = "high" | "medium";
export type QuestWeight = "high" | "medium";
export type QuestStatus = "available" | "submitted" | "verified" | "rewarded" | "pending";

export interface QuestTaskDetails {
  description: string;
  walletName: string;
  walletIcon: string;
  platform: string;
  formats: string;
  pointsValue: string;
  confidenceLabel: string;
  bonus: string;
  reviewTime: string;
}

export interface QuestTask {
  id: string;
  title: string;
  weight: QuestWeight;
  confidence: QuestConfidence;
  estimate: string;
  autoBumped?: boolean;
  status: QuestStatus;
  details: QuestTaskDetails;
}

export interface EligibilityStat {
  label: "valid_volume" | "active_days" | "counterparties";
  connectedValue: string;
  disconnectedValue: string;
}

export interface SocialQuestsData {
  eligibilityStats: EligibilityStat[];
  tasks: QuestTask[];
}

export const mockSocialQuestsData: SocialQuestsData = {
  eligibilityStats: [
    {
      label: "valid_volume",
      connectedValue: "$23,540",
      disconnectedValue: "$—",
    },
    {
      label: "active_days",
      connectedValue: "5 / 7 days",
      disconnectedValue: "— / 7 days",
    },
    {
      label: "counterparties",
      connectedValue: "9",
      disconnectedValue: "—",
    },
  ],
  tasks: [
    {
      id: "twitter-thread",
      title: "Twitter thread (≥6 tweets). Write an engaging and informative Twitter thread",
      weight: "high",
      confidence: "high",
      estimate: "Est. 260 pts → ~$325",
      status: "submitted",
      details: defaultDetails({
        pointsValue: "260 pts ≈ $13 USDT",
        platform: "X (Twitter)",
        formats: "Text + images",
        confidenceLabel: "High",
      }),
    },
    {
      id: "short-video",
      title: "Short video (≥45s)",
      weight: "high",
      confidence: "high",
      estimate: "Est. 140 pts → ~$175",
      status: "verified",
      details: defaultDetails({
        pointsValue: "140 pts ≈ $7 USDT",
        platform: "X (Twitter), YouTube",
        formats: "Video",
        confidenceLabel: "High",
      }),
    },
    {
      id: "host-ama",
      title: "Host AMA (≥20m)",
      weight: "medium",
      confidence: "medium",
      estimate: "Est. 280 pts → ~$350",
      status: "rewarded",
      details: defaultDetails({
        pointsValue: "280 pts ≈ $14 USDT",
        platform: "Discord, X Spaces",
        formats: "Live audio",
        confidenceLabel: "Medium",
      }),
    },
    {
      id: "write-tutorial",
      title: "Write tutorial/guide",
      weight: "high",
      confidence: "high",
      estimate: "Est. 320 pts → ~$400",
      autoBumped: true,
      status: "available",
      details: defaultDetails({
        pointsValue: "320 pts ≈ $16 USDT",
        platform: "Medium, Mirror",
        formats: "Long-form text + images",
        confidenceLabel: "High",
      }),
    },
    {
      id: "short-educational-thread",
      title: "Short educational thread",
      weight: "high",
      confidence: "medium",
      estimate: "Est. 124 pts → ~$235",
      autoBumped: true,
      status: "pending",
      details: defaultDetails({
        pointsValue: "124 pts ≈ $6 USDT",
        platform: "X (Twitter)",
        formats: "Text",
        confidenceLabel: "Medium",
      }),
    },
  ],
};

function defaultDetails(
  overrides: Partial<QuestTaskDetails> & Pick<QuestTaskDetails, "pointsValue" | "platform" | "formats" | "confidenceLabel">,
): QuestTaskDetails {
  return {
    description:
      "Liquidity pools in DeFi are digital pools of funds where users lock their crypto to enable trading on decentralized exchanges (DEXs) without relying on a traditional buyer or seller. By depositing tokens in a pair (e.g., 1 ETH + 2000 USDT), you receive LP tokens representing your share, and earn fees whenever trades occur in the pool. LP tokens can also be staked for extra rewards. While providing liquidity helps the ecosystem and can generate income, risks like impermanent loss and smart contract vulnerabilities exist. To get started, pick a trusted DEX, choose a token pair, deposit your tokens, and watch your rewards grow. #DeFiExplained Liquidity pools in DeFi are digital pools of funds where users lock their crypto to enable trading on decentralized exchanges (DEXs) without relying on a traditional buyer or seller. By depositing tokens in a pair (e.g., 1 ETH + 2000 USDT), you receive LP tokens representing your share, and earn fees whenever trades occur in the pool. LP tokens can also be staked for extra rewards. While providing liquidity helps the ecosystem and can generate income, risks like impermanent loss and smart contract vulnerabilities exist. To get started, pick a trusted DEX, choose a token pair, deposit your tokens, and watch your rewards grow. #DeFiExplained!",
    walletName: "Metamask",
    walletIcon: "/images/wallets/metamask.svg",
    bonus: "1x streak grace",
    reviewTime: "48 hours",
    ...overrides,
  };
}
