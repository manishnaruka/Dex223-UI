import { multicall } from "@wagmi/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, parseUnits } from "viem";
import { usePublicClient } from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ERC223_ABI } from "@/config/abis/erc223";
import { config } from "@/config/wagmi/config";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useDebounce } from "@/hooks/useDebounce";
import { PoolsResult, PoolState, useStorePools } from "@/hooks/usePools";
import { FeeAmount, TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Pool } from "@/sdk_bi/entities/pool";
import { Trade } from "@/sdk_bi/entities/trade";
import {
  computePoolAddressDex,
  computePoolAddressDexNoCache,
  useComputePoolAddressDex,
} from "@/sdk_bi/utils/computePoolAddress";

export type TokenTrade = Trade<Currency, Currency, TradeType>;
const poolsFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

function filterPools(poolStates: PoolsResult): Pool[] {
  return poolStates
    .filter((state): state is [PoolState, Pool] => state[1] !== null) // Type guard to remove null Pools
    .map(([, pool]) => pool); // Extract the Pool objects
}

function getUsablePools(poolStates: PoolsResult): Pool[] {
  return poolStates
    .filter((entry): entry is [PoolState, Pool] => {
      const [state, pool] = entry;
      return state === PoolState.EXISTS && pool !== null && !!pool.liquidity && pool.liquidity > 0;
    })
    .map(([, pool]) => pool);
}

function groupPoolBalances(multicallResults: any[]): bigint[][] {
  return multicallResults.reduce((acc: bigint[][], item, index) => {
    const poolIndex = Math.floor(index / 2);

    // ensure sub-array exists
    if (!acc[poolIndex]) acc[poolIndex] = [];

    if (item.status === "success") {
      acc[poolIndex].push(BigInt(item.result));
    } else {
      acc[poolIndex].push(0n); // or handle as null, or skip, depending on preference
    }

    return acc;
  }, []);
}

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
  const chainId = useCurrentChainId();

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

  const getFirstTradeWithLiquidity = useCallback(
    async (trades: Trade<Currency, Currency, TradeType.EXACT_INPUT>[]) => {
      const calls = [];
      for (let trade of trades) {
        const poolAddress = await computePoolAddressDexNoCache({
          addressTokenA: trade.inputAmount.currency.wrapped.address0,
          addressTokenB: trade.outputAmount.currency.wrapped.address0,
          tier: trade.swaps[0].route.pools[0].fee,
          chainId,
        });

        calls.push({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          address: trade.outputAmount.currency.wrapped.address0 as Address,
          args: [poolAddress],
        });
        calls.push({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          address: trade.outputAmount.currency.wrapped.address1 as Address,
          args: [poolAddress],
        });
      }

      const result = await multicall(config, {
        contracts: calls,
      });

      const poolsOutputBalances = groupPoolBalances(result);

      const poolsOutputs = poolsOutputBalances.map((pair) => pair[0] + pair[1]);

      for (let i = 0; i < trades.length; i++) {
        if (poolsOutputs[i] >= BigInt(trades[i]?.swaps[0].outputAmount.quotient)) {
          return trades[i];
        }
      }

      return null;
    },
    [chainId],
  );

  const debouncedTypedValue = useDebounce(typedValue, 150);

  useEffect(() => {
    if (!tokenA || !tokenB || !+debouncedTypedValue || !getUsablePools(pools).length) {
      setTrade(null);
      setError(null);
      return;
    }

    IIFE(async () => {
      setIsLoading(true);
      try {
        const trades = await Trade.bestTradeExactIn(
          getUsablePools(pools),
          CurrencyAmount.fromRawAmount(
            tokenA,
            parseUnits(debouncedTypedValue, tokenA?.decimals).toString(),
          ),
          tokenB,
          { maxHops: 1 },
        );

        if (trades.length > 0) {
          const bestTradeWithLiquidity = await getFirstTradeWithLiquidity(trades);
          console.log("BEST TRADE FROM THESE TWO", bestTradeWithLiquidity);

          setTrade(bestTradeWithLiquidity);
          if (!bestTradeWithLiquidity) {
            setError(TradeError.NO_LIQUIDITY);
          } else {
            setError(null);
          }
        } else {
          setTrade(null);
          setError(null);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [getFirstTradeWithLiquidity, pools, tokenA, tokenB, debouncedTypedValue]);

  return {
    trade: trade,
    pools: pools,
    isLoading: isLoading,
    error,
  };
}
