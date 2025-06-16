import { useEffect, useState } from "react";
import {
  Address,
  decodeAbiParameters,
  decodeErrorResult,
  encodeFunctionData,
  parseUnits,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { POOL_ABI } from "@/config/abis/pool";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useDebounce } from "@/hooks/useDebounce";
import { PoolsResult, PoolState, useStorePools } from "@/hooks/usePools";
import { FeeAmount, TICK_SPACINGS, TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Pool } from "@/sdk_bi/entities/pool";
import { Trade } from "@/sdk_bi/entities/trade";
import { ONE, Q96 } from "@/sdk_bi/internalConstants";
import { computePoolAddressDex } from "@/sdk_bi/utils/computePoolAddress";
import { TickMath } from "@/sdk_bi/utils/tickMath";

function filterPools(poolStates: PoolsResult): Pool[] {
  return poolStates
    .filter((state): state is [PoolState, Pool] => state[1] !== null) // Type guard to remove null Pools
    .map(([, pool]) => pool); // Extract the Pool objects
}

export type TokenTrade = Trade<Currency, Currency, TradeType>;
const poolsFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

export enum TradeError {
  NO_LIQUIDITY,
}

export function useTrade(): {
  trade: TokenTrade | null;
  isLoading: boolean;
  pools: PoolsResult;
  error: TradeError | null;
} {
  const [error, setError] = useState<TradeError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { tokenA, tokenB } = useSwapTokensStore();

  const { typedValue } = useSwapAmountsStore();
  const pools = useStorePools(
    poolsFees.map((feeAmount) => {
      return {
        currencyA: tokenA,
        currencyB: tokenB,
        tier: feeAmount,
      };
    }),
  );

  const [trade, setTrade] = useState<TokenTrade | null>(null);

  const debouncedTypedValue = useDebounce(typedValue, 150);

  console.log("Pools", pools);

  useEffect(() => {
    if (!tokenA || !tokenB || !+debouncedTypedValue || !filterPools(pools).length) {
      setTrade(null);
      setError(null);
      return;
    }

    IIFE(async () => {
      setIsLoading(true);
      try {
        console.log("Pools", pools, filterPools(pools));

        const trades = await Trade.bestTradeExactIn(
          filterPools(pools),
          CurrencyAmount.fromRawAmount(
            tokenA,
            parseUnits(debouncedTypedValue, tokenA?.decimals).toString(),
          ),
          tokenB,
          { maxHops: 1 },
        );

        console.log("Trades", trades);
        if (trades.length > 0) {
          const bestTrade = trades[0];
          console.log("BEST TRADE FROM THESE TWO", bestTrade);
          setTrade(bestTrade);
          setError(null);
        } else {
          setTrade(null);
          setError(TradeError.NO_LIQUIDITY);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [pools, tokenA, tokenB, debouncedTypedValue]);

  return {
    trade: trade,
    pools: pools,
    isLoading: isLoading,
    error,
  };
}
