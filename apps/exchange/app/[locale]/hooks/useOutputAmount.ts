import { useEffect, useState } from "react";

interface Token {
  symbol: string;
}

interface UseOutputAmountResult {
  outputAmount: string | null; // The calculated output amount
  loading: boolean; // Whether the request is in progress
  error: string | null; // Error message if the request fails
}

export function useOutputAmount(
  tokenA: Token | null | undefined,
  tokenB: Token | null | undefined,
  inputAmount: string,
  isFixed: boolean,
): UseOutputAmountResult {
  const [outputAmount, setOutputAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !tokenA ||
      !tokenB ||
      !inputAmount ||
      isNaN(Number(inputAmount)) ||
      Number(inputAmount) <= 0
    ) {
      setOutputAmount(null);
      setError(null);
      return;
    }

    const fetchOutputAmount = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/simpleswap/get-estimated?fixed=${isFixed}&currencyFrom=${tokenA.symbol}&currencyTo=${tokenB.symbol}&amount=${inputAmount}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch output amount");
        }

        const data = await response.json();

        if (typeof data === "string") {
          setOutputAmount(data);
        } else {
          setOutputAmount(null);
          setError("Invalid response from server");
        }
      } catch (err) {
        setOutputAmount(null);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOutputAmount();
  }, [tokenA, tokenB, inputAmount, isFixed]);

  return { outputAmount, loading, error };
}
