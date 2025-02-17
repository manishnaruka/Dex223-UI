import { useEffect, useMemo, useState } from "react";

import { ExchangeToken } from "@/app/[locale]/types";

interface UseFilteredTokensResult {
  availableTokens: ExchangeToken[]; // Non-fiat tokens (filtered or matched pairs)
  fiatTokens: ExchangeToken[]; // Tokens with isFiat = true
  loading: boolean; // Indicates if the request is in progress
}

export function useFilteredTokens(
  tokens: ExchangeToken[],
  filterToken?: ExchangeToken,
  isFixed: boolean = false,
): UseFilteredTokensResult {
  const [availableTokens, setAvailableTokens] = useState<ExchangeToken[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoize the fiat tokens list (no need to recompute on each render)
  const fiatTokens = useMemo(() => tokens.filter((token) => token.isFiat), [tokens]);

  useEffect(() => {
    if (!filterToken) {
      // No token passed, return all non-fiat tokens
      setAvailableTokens(tokens.filter((token) => !token.isFiat));
      return;
    }

    const fetchPairs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/simpleswap/get-pairs?symbol=${filterToken.symbol}&fixed=${isFixed}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch token pairs");
        }

        const pairs = await response.json(); // Assume API returns an array of symbols
        const pairSet = new Set(pairs);

        // Filter available tokens by matching the pairs with the full list
        setAvailableTokens(tokens.filter((token) => pairSet.has(token.symbol)));
      } catch (error) {
        console.error("Error fetching pairs:", error);
        setAvailableTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, [filterToken, tokens, isFixed]);

  return { availableTokens, fiatTokens, loading };
}
