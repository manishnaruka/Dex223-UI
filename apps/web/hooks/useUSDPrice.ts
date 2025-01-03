import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";

import { apolloClient } from "@/graphql/thegraph/apollo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useUSDPriceStore } from "@/stores/useUSDPriceStore";

type FetchPriceFn = (token: string) => Promise<number>;

const query = gql(`
  query USDPrice($address: String!) {
    token(id: $address) {
      name
      tokenDayData {
        priceUSD
      }
    }
  }
`);

export const useUSDPrice = (tokenAddress: Address) => {
  const { prices, loading, setPrice, setLoading } = useUSDPriceStore();
  const chainId = useCurrentChainId();
  const [error, setError] = useState<string | null>(null);
  const client = useMemo(() => {
    return apolloClient(chainId);
  }, [chainId]);
  const [getPrice] = useLazyQuery(query, { client });

  // Fetch price if not available and not already loading
  useEffect(() => {
    const fetchPrice = async () => {
      if (loading[tokenAddress] || prices[tokenAddress] !== undefined) return;

      setLoading(tokenAddress, true);
      try {
        const priceData = await getPrice({ variables: { address: tokenAddress } });
        const price = priceData.data.token?.tokenDayData[0].priceUSD;
        if (price) {
          setError(null);
          setPrice(tokenAddress, price);
        } else {
          setError("Token price not found");
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${tokenAddress}:`, error);
        setError(`Failed to fetch price for ${tokenAddress}`); // Set error message
      } finally {
        setLoading(tokenAddress, false);
      }
    };

    if (prices[tokenAddress] === undefined && !loading[tokenAddress] && !error) {
      fetchPrice();
    }
  }, [tokenAddress, prices, loading, setLoading, setPrice, getPrice, error, chainId]);

  return {
    price: prices[tokenAddress],
    isLoading: loading[tokenAddress] || prices[tokenAddress] === undefined,
    error,
  };
};
