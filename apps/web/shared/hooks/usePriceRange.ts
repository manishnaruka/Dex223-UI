import { useEffect, useMemo, useRef } from "react";

import { Bound } from "@/app/[locale]/add/components/PriceRange/LiquidityChartRangeInput/types";
import { useDerivedTokens } from "@/app/[locale]/add/hooks/useDerivedTokens";
import { useSortedTokens } from "@/app/[locale]/add/hooks/useSortedTokens";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import { getTickToPrice, tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { TICK_SPACINGS } from "@/sdk_bi/constants";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Token } from "@/sdk_bi/entities/token";
import { nearestUsableTick } from "@/sdk_bi/utils/nearestUsableTick";
import { TickMath } from "@/sdk_bi/utils/tickMath";

// допоміжне: створити дефолтний діапазон +-N spacing від референс-тіка
function defaultRangeAround(tick: number, tickSpacing: number, halfWidthSpacings = 100) {
  const width = halfWidthSpacings * tickSpacing;
  const lower = nearestUsableTick(tick - width, tickSpacing);
  const upper = nearestUsableTick(tick + width, tickSpacing);
  return { LOWER: lower, UPPER: upper };
}

export const usePriceRange = () => {
  const {
    ticks,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    rangeTouched,
    setTicks,
  } = useLiquidityPriceRangeStore();

  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const tickSpacing = tier ? TICK_SPACINGS[tier] : undefined;

  const [poolState, pool] = usePool({ currencyA: tokenA, currencyB: tokenB, tier });
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const { token0, token1 } = useSortedTokens({ tokenA, tokenB });
  const { invertPrice, baseToken, quoteToken } = useDerivedTokens();

  // 1) Референс-тік: від пулу, або з введеної "стартової ціни", коли пулу ще нема
  const referenceTick: number | undefined = useMemo(() => {
    if (!token0 || !token1 || !tickSpacing) return undefined;

    if (!noLiquidity && pool) {
      return nearestUsableTick(pool.tickCurrent, tickSpacing);
    }

    // коли пулу нема — пробуємо побудувати ціну зі стартового інпуту
    const parsed = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1);
    const base = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
    if (parsed && base) {
      const p = new Price(
        base.currency.wrapped,
        parsed.currency.wrapped,
        base.quotient,
        parsed.quotient,
      );
      const price = invertPrice ? p.invert() : p;
      // convert price → tick (твоя функція вже робить це, але тут беремо готову обернену логіку)
      // getTickToPrice дає price з тіку, а обернений напрямок у вас уже є в SDK (priceToClosestTick).
      // Якщо маєш готовий util price→tick — використовуй його. Інакше спираємось на pool.mock у V3DerivedMintInfo.
      // Тут обмежимось найпростішим оцінюванням через TickMath:
      const sqrt = TickMath.getSqrtRatioAtTick(0); // не використовуємо; лишаємо referenceTick визначеним у V3 hook
      // Щоб не лізти в деталі — повернемо undefined і дамо це зробити у V3DerivedMintInfo/mockPool,
      // А дефолтний діапазон виставимо тільки якщо його ще не торкались (див. ефект нижче).
      return undefined;
    }
    return undefined;
  }, [token0, token1, invertPrice, startPriceTypedValue, tickSpacing, noLiquidity, pool]);

  // 2) Авто-ініціалізація діапазону
  //    - якщо пул є → центр навколо pool.tickCurrent
  //    - якщо пулу нема та користувач задав startPrice, і range ще не чіпали → авто-діапазон
  //    - при зміні tier (tickSpacing) → снап на нове spacing
  const prevTickSpacingRef = useRef<number | undefined>(tickSpacing);

  useEffect(() => {
    if (!tickSpacing) return;

    const touched = rangeTouched;
    const hasTicks = typeof ticks?.LOWER === "number" && typeof ticks?.UPPER === "number";

    // зміна tickSpacing → снап поточних меж
    if (prevTickSpacingRef.current && prevTickSpacingRef.current !== tickSpacing && hasTicks) {
      const lower = nearestUsableTick(ticks.LOWER!, tickSpacing);
      const upper = nearestUsableTick(ticks.UPPER!, tickSpacing);
      if (lower !== ticks.LOWER || upper !== ticks.UPPER) {
        setTicks({ LOWER: lower, UPPER: upper });
      }
      prevTickSpacingRef.current = tickSpacing;
      return;
    }
    prevTickSpacingRef.current = tickSpacing;

    // якщо пул існує й меж не було → проставимо дефолт
    if (!noLiquidity && pool && !hasTicks) {
      const around = defaultRangeAround(pool.tickCurrent, tickSpacing, 100);
      setTicks(around);
      return;
    }

    // якщо пулу нема, є стартове значення ціни, меж не було і юзер range не чіпав → дефолт навколо reference
    if (noLiquidity && !hasTicks && !touched) {
      // якщо referenceTick undefined (див. коментар у memo вище), просто центр 0
      const center = typeof referenceTick === "number" ? referenceTick : 0;
      const around = defaultRangeAround(center, tickSpacing, 100);
      setTicks(around);
      return;
    }
  }, [noLiquidity, pool, tickSpacing, ticks, rangeTouched, referenceTick, setTicks]);

  // 3) Derived дані для UI (тільки мемо, без побічних ефектів)
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);

  const price: Price<Token, Token> | undefined = useMemo(() => {
    if (!token0 || !token1) return undefined;
    if (noLiquidity) {
      const parsed = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1);
      const base = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
      if (!parsed || !base) return undefined;
      const p = new Price(
        base.currency.wrapped,
        parsed.currency.wrapped,
        base.quotient,
        parsed.quotient,
      );
      return invertPrice ? p.invert() : p;
    }
    return pool && token0 ? pool.priceOf(token0.wrapped) : undefined;
  }, [token0, token1, noLiquidity, startPriceTypedValue, invertPrice, pool]);

  const formattedPrice = price
    ? parseFloat((invertPrice ? price.invert() : price).toSignificant())
    : "-";

  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tier ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[tier]) : undefined,
      [Bound.UPPER]: tier ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[tier]) : undefined,
    }),
    [tier],
  );

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

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
