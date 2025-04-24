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

export const useUSDPrice = (tokenAddress: Address | undefined) => {
  const { prices, loading, setPrice, setLoading } = useUSDPriceStore();
  const chainId = useCurrentChainId();
  const [error, setError] = useState<string | null>(null);
  const client = useMemo(() => {
    return apolloClient(chainId);
  }, [chainId]);
  const [getPrice] = useLazyQuery(query, { client });

  // Fetch price if not available and not already loading
  useEffect(() => {
    console.log("Fetch initialized");
    const fetchPrice = async () => {
      console.log(loading);
      console.log(prices);
      console.log(tokenAddress);
      if (!tokenAddress || loading[tokenAddress] || prices[tokenAddress] !== undefined) return;

      console.log("Started loading");
      setLoading(tokenAddress, true);
      try {
        console.log("Loading price");
        const priceData = await getPrice({ variables: { address: tokenAddress.toLowerCase() } });
        console.log(priceData);

        if (priceData.data.token) {
          const price =
            priceData.data.token?.tokenDayData[priceData.data.token?.tokenDayData.length - 1]
              .priceUSD;
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

    console.log(tokenAddress);
    console.log(prices);
    console.log(loading);
    console.log(error);
    if (tokenAddress && prices[tokenAddress] === undefined && !loading[tokenAddress] && !error) {
      console.log("Check");
      fetchPrice();
    }
  }, [tokenAddress, prices, loading, setLoading, setPrice, getPrice, error, chainId]);

  return {
    price: tokenAddress ? prices[tokenAddress] : undefined,
    isLoading: tokenAddress && (loading[tokenAddress] || prices[tokenAddress] === undefined),
    error,
  };
};
