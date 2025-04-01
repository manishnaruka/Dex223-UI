import { parseUnits } from "viem";

import { FeeAmount, TICK_SPACINGS } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { Token } from "@/sdk_bi/entities/token";
import { encodeSqrtRatioX96 } from "@/sdk_bi/utils/encodeSqrtRatioX96";
import { nearestUsableTick } from "@/sdk_bi/utils/nearestUsableTick";
import { priceToClosestTick, tickToPrice } from "@/sdk_bi/utils/priceTickConversions";
import { TickMath } from "@/sdk_bi/utils/tickMath";

function tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
  if (!baseToken || !quoteToken || !value) {
    return undefined;
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined;
  }

  const [whole, fraction] = value.split(".");

  const decimals = fraction?.length ?? 0;
  const withoutDecimals = BigInt((whole ?? "") + (fraction ?? ""));

  return new Price(
    baseToken,
    quoteToken,
    BigInt(10 ** decimals) * BigInt(10 ** baseToken.decimals),
    withoutDecimals * BigInt(10 ** quoteToken.decimals),
  );
}

export function tryParseTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string,
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined;
  }

  const price = tryParsePrice(baseToken, quoteToken, value);

  if (!price) {
    return undefined;
  }

  let tick: number;

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator);

  if (sqrtRatioX96 >= TickMath.MAX_SQRT_RATIO) {
    tick = TickMath.MAX_TICK;
  } else if (sqrtRatioX96 <= TickMath.MIN_SQRT_RATIO) {
    tick = TickMath.MIN_TICK;
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price);
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount]);
}

export function getTickToPrice(
  baseToken?: Token,
  quoteToken?: Token,
  tick?: number,
): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== "number") {
    return undefined;
  }
  return tickToPrice(baseToken, quoteToken, tick);
}

function truncateValue(value: string, decimals: number): string {
  const parts = value.split(/[.,]/);
  const symbol = value.includes(".") ? "." : ",";
  if (parts.length > 1 && parts[1].length > decimals) {
    return parts[0] + symbol + parts[1].slice(0, decimals);
  }
  return value;
}

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export function tryParseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(
      truncateValue(value, currency.decimals),
      currency.decimals,
    ).toString();
    if (typedValueParsed !== "0") {
      return CurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed));
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}
