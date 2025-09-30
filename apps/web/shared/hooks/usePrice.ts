import { useMemo } from "react";

import { useDerivedTokens } from "@/app/[locale]/add/hooks/useDerivedTokens";
import { useSortedTokens } from "@/app/[locale]/add/hooks/useSortedTokens";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Token } from "@/sdk_bi/entities/token";

export const usePrice = () => {
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { startPriceTypedValue } = useLiquidityPriceRangeStore();

  const [poolState, pool] = usePool({ currencyA: tokenA, currencyB: tokenB, tier });
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const { token0, token1 } = useSortedTokens({ tokenA, tokenB });
  const { invertPrice } = useDerivedTokens();

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    if (!token0 || !token1) return undefined;

    if (noLiquidity) {
      // побудувати ціну з typed значення (без RPC)
      const parsedQuote = tryParseCurrencyAmount(
        startPriceTypedValue,
        invertPrice ? token0 : token1,
      );
      const baseAmount = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
      if (!parsedQuote || !baseAmount) return undefined;

      const p = new Price(
        baseAmount.currency.wrapped,
        parsedQuote.currency.wrapped,
        baseAmount.quotient,
        parsedQuote.quotient,
      );
      return invertPrice ? p.invert() : p;
    }

    // існуючий пул → беремо mid price
    return pool && token0 ? pool.priceOf(token0.wrapped) : undefined;
  }, [token0, token1, noLiquidity, startPriceTypedValue, invertPrice, pool]);

  const formattedPrice = price
    ? parseFloat((invertPrice ? price.invert() : price).toSignificant())
    : "-";

  return {
    price,
    formattedPrice,
    invertPrice,
    poolState,
    pool,
    token0,
    token1,
    noLiquidity,
  };
};
