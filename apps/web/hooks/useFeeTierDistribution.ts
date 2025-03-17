import ms from "ms";
import { useMemo } from "react";
import { Address } from "viem";

import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";

import useFeeTierDistributionQuery from "../graphql/thegraph/FeeTierDistributionQuery";
import { PoolsParams, PoolState, usePools } from "./usePools";

// maximum number of blocks past which we consider the data stale
const MAX_DATA_BLOCK_AGE = 20;

interface FeeTierDistribution {
  isLoading: boolean;
  isError: boolean;
  largestUsageFeeTier?: FeeAmount;

  // distributions as percentages of overall liquidity
  distributions?: Record<FeeAmount, number | undefined>;
}

export function useFeeTierDistribution(tokenA?: Currency, tokenB?: Currency): FeeTierDistribution {
  const { isLoading, error, distributions } = usePoolTVL(tokenA, tokenB);

  // fetch all pool states to determine pool state
  const poolParams: PoolsParams = useMemo(
    () => [
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.LOWEST },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.LOW },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.MEDIUM },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.HIGH },
    ],
    [tokenA, tokenB],
  );
  const [poolStateVeryLow, poolStateLow, poolStateMedium, poolStateHigh] = usePools(poolParams);

  return useMemo(() => {
    if (isLoading || error || !distributions) {
      return {
        isLoading,
        isError: !!error,
        distributions,
      };
    }

    const largestUsageFeeTier = Object.keys(distributions)
      .map((d) => Number(d))
      .filter((d: FeeAmount) => distributions[d] !== 0 && distributions[d] !== undefined)
      .reduce(
        (a: FeeAmount, b: FeeAmount) => ((distributions[a] ?? 0) > (distributions[b] ?? 0) ? a : b),
        -1,
      );

    const percentages =
      !isLoading &&
      !error &&
      distributions &&
      poolStateVeryLow[0] !== PoolState.LOADING &&
      poolStateLow[0] !== PoolState.LOADING &&
      poolStateMedium[0] !== PoolState.LOADING &&
      poolStateHigh[0] !== PoolState.LOADING
        ? {
            [FeeAmount.LOWEST]:
              poolStateVeryLow[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.LOWEST] ?? 0) * 100
                : undefined,
            [FeeAmount.LOW]:
              poolStateLow[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.LOW] ?? 0) * 100
                : undefined,
            [FeeAmount.MEDIUM]:
              poolStateMedium[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.MEDIUM] ?? 0) * 100
                : undefined,
            [FeeAmount.HIGH]:
              poolStateHigh[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.HIGH] ?? 0) * 100
                : undefined,
          }
        : undefined;

    return {
      isLoading,
      isError: !!error,
      distributions: percentages,
      largestUsageFeeTier: largestUsageFeeTier === -1 ? undefined : largestUsageFeeTier,
    };
  }, [
    distributions,
    error,
    isLoading,
    poolStateHigh,
    poolStateLow,
    poolStateMedium,
    poolStateVeryLow,
  ]);
}

function usePoolTVL(tokenA?: Currency, tokenB?: Currency) {
  const { data: latestBlock } = useScopedBlockNumber({ watch: true });

  // Your fee tier distribution query with stable addresses
  const { isLoading, error, data } = useFeeTierDistributionQuery(
    tokenA?.wrapped.address0,
    tokenB?.wrapped.address0,
    30000,
  );
  //
  // console.log("WWW");
  //
  const { asToken0, asToken1, _meta } = data ?? {};
  //
  return useMemo(() => {
    if (!latestBlock || !_meta || !asToken0 || !asToken1) {
      return {
        isLoading,
        error,
      };
    }

    if (latestBlock - BigInt(_meta?.block?.number ?? 0) > MAX_DATA_BLOCK_AGE) {
      console.log(`Graph stale (latest block: ${latestBlock})`);
      return {
        isLoading,
        error,
      };
    }

    const all = [...asToken0, ...asToken1];

    const tvlByFeeTier = all.reduce<Record<FeeAmount, [number, number]>>(
      (acc, value) => {
        const feeTier = value.feeTier as FeeAmount;
        acc[feeTier][0] += Number(value.totalValueLockedToken0 ?? 0);
        acc[feeTier][1] += Number(value.totalValueLockedToken1 ?? 0);
        return acc;
      },
      {
        [FeeAmount.LOWEST]: [0, 0],
        [FeeAmount.LOW]: [0, 0],
        [FeeAmount.MEDIUM]: [0, 0],
        [FeeAmount.HIGH]: [0, 0],
      },
    );

    const [sumToken0Tvl, sumToken1Tvl] = Object.values(tvlByFeeTier).reduce<[number, number]>(
      (acc, [tv0, tv1]) => {
        acc[0] += tv0;
        acc[1] += tv1;
        return acc;
      },
      [0, 0],
    );

    const mean = (
      tvl0: number,
      sumTvl0: number,
      tvl1: number,
      sumTvl1: number,
    ): number | undefined =>
      tvl0 === 0 && tvl1 === 0 ? undefined : (tvl0 + tvl1) / (sumTvl0 + sumTvl1 || 1); // prevent divide by zero

    const distributions: Record<FeeAmount, number | undefined> = {
      [FeeAmount.LOWEST]: mean(...tvlByFeeTier[FeeAmount.LOWEST], sumToken0Tvl, sumToken1Tvl),
      [FeeAmount.LOW]: mean(...tvlByFeeTier[FeeAmount.LOW], sumToken0Tvl, sumToken1Tvl),
      [FeeAmount.MEDIUM]: mean(...tvlByFeeTier[FeeAmount.MEDIUM], sumToken0Tvl, sumToken1Tvl),
      [FeeAmount.HIGH]: mean(...tvlByFeeTier[FeeAmount.HIGH], sumToken0Tvl, sumToken1Tvl),
    };

    return {
      isLoading,
      error,
      distributions,
    };
  }, [_meta, asToken0, asToken1, isLoading, error, latestBlock]);
}
