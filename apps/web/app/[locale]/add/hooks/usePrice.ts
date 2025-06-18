import { useMemo } from "react";

import { useDerivedTokens } from "@/app/[locale]/add/hooks/useDerivedTokens";
import { usePriceDirectionStore } from "@/app/[locale]/add/stores/usePriceDirectionStore";
import { getTickToPrice, tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { TICK_SPACINGS } from "@/sdk_bi/constants";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Token } from "@/sdk_bi/entities/token";
import { nearestUsableTick } from "@/sdk_bi/utils/nearestUsableTick";
import { TickMath } from "@/sdk_bi/utils/tickMath";

import { Bound } from "../components/PriceRange/LiquidityChartRangeInput/types";
import { useAddLiquidityTokensStore } from "../stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "../stores/useLiquidityTierStore";
import { useSortedTokens } from "./useSortedTokens";

export const usePriceRange = () => {
  const { ticks, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue } =
    useLiquidityPriceRangeStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();

  const [poolState, pool] = usePool({ currencyA: tokenA, currencyB: tokenB, tier });
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const { token0, token1 } = useSortedTokens({
    tokenA,
    tokenB,
  });

  const { invertPrice, baseToken, quoteToken } = useDerivedTokens();

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseCurrencyAmount(
        startPriceTypedValue,
        invertPrice ? token0 : token1,
      );
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency.wrapped,
                parsedQuoteAmount.currency.wrapped,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined;
        return (invertPrice ? price?.invert() : price) ?? undefined;
      }
      return undefined;
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0.wrapped) : undefined;
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

  const formattedPrice = price
    ? parseFloat((invertPrice ? price?.invert() : price).toSignificant())
    : "-";

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tier ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[tier]) : undefined,
      [Bound.UPPER]: tier ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[tier]) : undefined,
    }),
    [tier],
  );

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: tier && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tier && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, tier],
  );

  const leftPrice = getTickToPrice(baseToken?.wrapped, quoteToken?.wrapped, tickLower);
  const rightPrice = getTickToPrice(baseToken?.wrapped, quoteToken?.wrapped, tickUpper);

  const isSorted = tokenA && tokenB && tokenA.wrapped.sortsBefore(tokenB.wrapped);
  const isFullRange =
    typeof leftRangeTypedValue === "boolean" && typeof rightRangeTypedValue === "boolean";

  return {
    price,
    formattedPrice,
    invertPrice,
    pricesAtTicks,
    ticksAtLimit,
    isSorted,
    isFullRange,
    leftPrice,
    rightPrice,
    token0,
    token1,
    tickSpaceLimits,
  };
};
