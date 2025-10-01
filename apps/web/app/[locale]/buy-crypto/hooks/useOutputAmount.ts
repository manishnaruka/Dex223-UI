import { useEffect, useState } from "react";

interface Token {
  symbol: string;
}

export enum OutputAmountError {
  NOT_FOUND,
  OUT_OF_RANGE,
  UNKNOWN,
}

interface UseOutputAmountResult {
  outputAmount: string | null; // The calculated output amount
  loading: boolean; // Whether the request is in progress
  error: OutputAmountError | null; // Error message if the request fails
}

export function useOutputAmount(
  tokenA: Token | null | undefined,
  tokenB: Token | null | undefined,
  inputAmount: string,
  isFixed: boolean,
): UseOutputAmountResult {
  const [outputAmount, setOutputAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OutputAmountError | null>(null);

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
          if (response.status === 404) {
            setOutputAmount(null);
            setError(OutputAmountError.NOT_FOUND);
          }
          return;
        }

        const data = await response.json();

        if (typeof data === "string") {
          setOutputAmount(data);
          setError(null);
        }
      } catch (err) {
        setOutputAmount(null);
        setError(OutputAmountError.UNKNOWN);
      } finally {
        setLoading(false);
      }
    };

    fetchOutputAmount();
  }, [tokenA, tokenB, inputAmount, isFixed]);

  return { outputAmount, loading, error };
}