import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { IIFE } from "@/functions/iife";
import { PoolsResult, PoolState, useStorePools } from "@/hooks/usePools";
import { FeeAmount, TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Pool } from "@/sdk_bi/entities/pool";
import { Trade } from "@/sdk_bi/entities/trade";

export type TokenTrade = Trade<Currency, Currency, TradeType>;
const poolsFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

function filterPools(poolStates: PoolsResult): Pool[] {
  return poolStates
    .filter((state): state is [PoolState, Pool] => state[1] !== null) // Type guard to remove null Pools
    .map(([, pool]) => pool); // Extract the Pool objects
}

export function useTrade(): { trade: TokenTrade | null; isLoading: boolean } {
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

  const [poolState, pool] = useMemo(() => {
    return pools.find(([_poolState, _pool]) => _poolState === PoolState.EXISTS) || pools[0];
  }, [pools]);

  useEffect(() => {
    if (!tokenA || !tokenB || !+typedValue || !filterPools(pools).length) {
      setTrade(null);
      return;
    }

    IIFE(async () => {
      const trades = await Trade.bestTradeExactIn(
        filterPools(pools),
        CurrencyAmount.fromRawAmount(tokenA, parseUnits(typedValue, tokenA?.decimals).toString()),
        tokenB,
        { maxHops: 1 },
      );
      if (trades[0]) {
        setTrade(trades[0]);
      } else {
        setTrade(null);
      }
    });
  }, [pools, tokenA, tokenB, typedValue]);

  return {
    trade: trade,
    isLoading: poolState === PoolState.LOADING,
  };
}
