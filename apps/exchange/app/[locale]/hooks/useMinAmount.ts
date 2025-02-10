import { useEffect, useState } from "react";

interface Token {
  symbol: string;
}

interface UseMinAmountResult {
  minAmount: string | null; // The minimum amount or null if unavailable
  loading: boolean; // Whether the request is in progress
  error: string | null; // Error message if the request fails
}

export function useMinAmount(
  tokenA: Token | null | undefined,
  tokenB: Token | null | undefined,
  isFixed: boolean,
): UseMinAmountResult {
  const [minAmount, setMinAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenA || !tokenB) {
      setMinAmount(null); // No tokens provided, clear the result
      setError(null); // Clear previous errors
      return;
    }

    const fetchMinAmount = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/simpleswap/get-ranges/?fixed=${isFixed}&currencyFrom=${tokenA.symbol}&currencyTo=${tokenB.symbol}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch minimum amount");
        }

        const data = await response.json();

        if (data && data.min) {
          setMinAmount(data.min);
        } else {
          setMinAmount(null); // Handle case where pair does not exist
          setError("Pair does not exist");
        }
      } catch (err) {
        setMinAmount(null);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMinAmount();
  }, [tokenA, tokenB, isFixed]);

  return { minAmount, loading, error };
}
