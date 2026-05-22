export interface ClaimChainPayout {
  chain: string;
  amount: number;
  feeCredits: number;
  status: "claimable" | "claimed";
}

export interface ClaimLimit {
  label: "per_referee_cap" | "per_cluster_cap" | "fee_clamp";
  value: string;
}

export interface ClaimCenterData {
  payouts: ClaimChainPayout[];
  caps: ClaimLimit[];
}

export const mockClaimCenterData: ClaimCenterData = {
  payouts: [
    {
      chain: "Ethereum",
      amount: 420,
      feeCredits: 18,
      status: "claimable",
    },
    {
      chain: "Base",
      amount: 260,
      feeCredits: 18,
      status: "claimed",
    },
    {
      chain: "BSC",
      amount: 140,
      feeCredits: 6,
      status: "claimable",
    },
  ],
  caps: [
    {
      label: "per_referee_cap",
      value: "$100",
    },
    {
      label: "per_cluster_cap",
      value: "$10,000",
    },
    {
      label: "fee_clamp",
      value: "4x",
    },
  ],
};
