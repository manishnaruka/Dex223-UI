import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export interface RevenueTokenInfo {
    addressERC20: Address;
    addressERC223: Address;
    decimals: string;
    id: string;
    name: string;
    symbol: string;
}

export interface RevenueTokenItem {
    accruedInPoolsNow: string;
    accruedInPoolsNowUSD: string | null;
    claimedFromRevenueTotalERC20: string;
    claimedFromRevenueTotalERC223: string;
    deliveredToRevenueTotalERC20: string;
    deliveredToRevenueTotalERC223: string;
    inRevenueNowERC20: string;
    inRevenueNowERC223: string;
    token: RevenueTokenInfo;
    accruedNormalized: string;
    priceUSD: string | null;
    totalValueUSD: string | null;
}

export interface RevenueBalancesResponse {
    updated_at: number;
    total: number;
    limit: number;
    offset: number;
    items: RevenueTokenItem[];
}

export function useRevenueTokens(limit: number = 50, offset: number = 0) {
    return useQuery<RevenueBalancesResponse>({
        queryKey: ["revenue-balances", limit, offset],
        queryFn: async () => {
            const response = await fetch(
                `https://api.dex223.io/v1/cache/revenue/balances?limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        accept: "application/json",
                    },
                },
            );
            if (!response.ok) {
                throw new Error("Failed to fetch revenue balances");
            }
            return response.json();
        },
        staleTime: 60000,
    });
}
