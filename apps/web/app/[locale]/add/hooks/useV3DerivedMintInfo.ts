import { useMemo } from "react";

import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { FeeAmount } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Pool } from "@/sdk_bi/entities/pool";
import { Position } from "@/sdk_bi/entities/position";
import { encodeSqrtRatioX96 } from "@/sdk_bi/utils/encodeSqrtRatioX96";
import { priceToClosestTick } from "@/sdk_bi/utils/priceTickConversions";
import { TickMath } from "@/sdk_bi/utils/tickMath";

import { Field, useLiquidityAmountsStore } from "../stores/useAddLiquidityAmountsStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";

const BIG_INT_ZERO = BigInt(0);

export const useV3DerivedMintInfo = ({
  tokenA,
  tokenB,
  tier,
  price,
}: {
  tokenA?: Currency;
  tokenB?: Currency;
  tier: FeeAmount;
  price: Price<Currency, Currency> | undefined;
}) => {
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper,
  );
  const { typedValue, independentField, dependentField, setTypedValue } =
    useLiquidityAmountsStore();

  const [poolState, pool] = usePool({ currencyA: tokenA, currencyB: tokenB, tier });
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const currencyA = tokenA;
  const currencyB = tokenB;

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };

  // check if price is within range
  const outOfRange: boolean =
    pool && typeof tickLower === "number" && typeof tickUpper === "number"
      ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper
      : false;

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    return (
      price &&
      sqrtRatioX96 &&
      !(sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO && sqrtRatioX96 < TickMath.MAX_SQRT_RATIO)
    );
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && tier && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(tokenA, tokenB, tier, currentSqrt, BigInt(0), currentTick, []);
    } else {
      return undefined;
    }
  }, [tier, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool;

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField],
  );

  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !independentAmount ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== "number" ||
      typeof tickUpper !== "number" ||
      invalidRange
    ) {
      return undefined;
    }

    // Which pool token corresponds to the independent field?
    const independentCurrency = currencies[independentField];
    if (!independentCurrency) return undefined;

    const independentIsToken0 = independentCurrency.wrapped.equals(poolForPosition.token0.wrapped);

    try {
      return independentIsToken0
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true,
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          });
    } catch {
      return undefined;
    }
  }, [
    poolForPosition,
    independentAmount,
    tokenA,
    tokenB,
    tickLower,
    tickUpper,
    invalidRange,
    currencies,
    independentField,
  ]);

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (!position) return undefined;

    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;
    if (!dependentCurrency) return undefined;

    const { amount0, amount1 } = position.mintAmounts;
    const isDepToken0 = dependentCurrency.wrapped.equals(position.pool.token0.wrapped);
    const raw = isDepToken0 ? amount0 : amount1;

    return CurrencyAmount.fromRawAmount(dependentCurrency, raw);
  }, [position, dependentField, currencyA, currencyB]);

  // const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
  //   return {
  //     [Field.CURRENCY_A]:
  //       independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
  //     [Field.CURRENCY_B]:
  //       independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
  //   };
  // }, [dependentAmount, independentAmount, independentField]);

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === "number" && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === "number" && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA)),
    );
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB)),
    );

  // create position entity based on users selection

  const mintedParsed: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    if (!position || !poolForPosition) {
      return { [Field.CURRENCY_A]: undefined, [Field.CURRENCY_B]: undefined };
    }
    const { amount0, amount1 } = position.mintAmounts;

    const token0AsA =
      currencies[Field.CURRENCY_A]?.wrapped &&
      currencies[Field.CURRENCY_A]!.wrapped.equals(poolForPosition.token0.wrapped);

    const amountForAraw = token0AsA ? amount0 : amount1;
    const amountForBraw = token0AsA ? amount1 : amount0;

    const amountA =
      currencies[Field.CURRENCY_A] &&
      CurrencyAmount.fromRawAmount(currencies[Field.CURRENCY_A]!, amountForAraw);

    const amountB =
      currencies[Field.CURRENCY_B] &&
      CurrencyAmount.fromRawAmount(currencies[Field.CURRENCY_B]!, amountForBraw);

    return { [Field.CURRENCY_A]: amountA, [Field.CURRENCY_B]: amountB };
  }, [position, poolForPosition, currencies]);

  return {
    parsedAmounts: mintedParsed,
    position,
    currencies,
    noLiquidity,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  };
};
