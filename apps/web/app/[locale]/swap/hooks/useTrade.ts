import { useEffect, useState } from "react";
import {
  Address,
  decodeAbiParameters,
  decodeErrorResult,
  encodeFunctionData,
  encodePacked,
  formatUnits,
  parseUnits,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { object } from "yup";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { POOL_ABI } from "@/config/abis/pool";
import { EXPERIMENTAL_POOL_ABI } from "@/config/abis/pool_experimental";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useDebounce } from "@/hooks/useDebounce";
import { PoolsResult, PoolState, useStorePools } from "@/hooks/usePools";
import { FeeAmount, TICK_SPACINGS, TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Pool } from "@/sdk_bi/entities/pool";
import { Route } from "@/sdk_bi/entities/route";
import { Trade } from "@/sdk_bi/entities/trade";
import { NEGATIVE_ONE, ONE, Q96 } from "@/sdk_bi/internalConstants";
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
  const publicClient = usePublicClient();

  const { address } = useAccount();
  const chainId = useCurrentChainId();
  useEffect(() => {
    if (!tokenA || !tokenB || !+debouncedTypedValue || !filterPools(pools).length) {
      setTrade(null);
      setError(null);
      return;
    }

    IIFE(async () => {
      setIsLoading(true);
      const outputs: { [key: number]: { output: bigint; pool: Pool } } = {};

      try {
        console.log(pools);
        for (let i = 0; i < pools.length; i++) {
          const a = pools[i];

          if (!a) {
            continue;
          }

          const pool = a[1];

          if (!pool) {
            continue;
          }

          const poolAddress = await computePoolAddressDex({
            addressTokenA: pool.token0.wrapped.address0,
            addressTokenB: pool.token1.wrapped.address0,
            tier: pool.fee,
            chainId,
          });

          if (!poolAddress || !address || !publicClient) {
            continue;
          }

          const zeroForOne = tokenA.equals(pool.token0.wrapped);
          const sqrtPriceLimitX96 = zeroForOne
            ? TickMath.MIN_SQRT_RATIO + ONE
            : TickMath.MAX_SQRT_RATIO - ONE;

          const { result } = await publicClient.simulateContract({
            address: poolAddress,
            abi: EXPERIMENTAL_POOL_ABI,
            functionName: "quoteSwap",
            args: [
              address,
              zeroForOne,
              parseUnits(debouncedTypedValue, tokenA?.decimals),
              sqrtPriceLimitX96,
              false,
              encodePacked(
                ["address", "uint24", "address"],
                [tokenA.wrapped.address0, pool.fee, tokenB.wrapped.address0],
              ),
            ],
          });

          const inverted = result * NEGATIVE_ONE;

          outputs[pool.fee] = { output: inverted, pool };
        }

        Object.entries(outputs).forEach(([key, value]) => {
          console.log(`Result for ${key} pool is: `, formatUnits(value.output, tokenB.decimals));
        });

        if (!Object.entries(outputs).length) {
          return;
        }

        const bestEntry = Object.entries(outputs).reduce((a, b) =>
          b[1].output > a[1].output ? b : a,
        );

        if (bestEntry) {
          const bestOutput = bestEntry[1].output;
          const bestPool = bestEntry[1].pool;
          const _trade = Trade.createUncheckedTrade({
            route: new Route([bestPool], tokenA, tokenB),
            inputAmount: CurrencyAmount.fromRawAmount(
              tokenA,
              parseUnits(debouncedTypedValue, tokenA?.decimals).toString(),
            ),
            outputAmount: CurrencyAmount.fromRawAmount(tokenB, bestOutput),
            tradeType: TradeType.EXACT_INPUT,
          });
          setTrade(_trade);
          setIsLoading(false);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [address, chainId, debouncedTypedValue, pools, publicClient, tokenA, tokenB]);

  return {
    trade: trade,
    pools: pools,
    isLoading: isLoading,
    error,
  };
}
