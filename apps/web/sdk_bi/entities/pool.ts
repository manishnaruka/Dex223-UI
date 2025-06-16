import invariant from "tiny-invariant";

import { BigintIsh, FeeAmount, TICK_SPACINGS } from "@/sdk_bi/constants";
import { NoTickDataProvider, TickDataProvider } from "@/sdk_bi/entities/tickDataProvider";
import { TickListDataProvider } from "@/sdk_bi/entities/tickListDataProvider";
import { LiquidityMath } from "@/sdk_bi/utils/liquidityMath";
import { SwapMath } from "@/sdk_bi/utils/swapMath";

import { NEGATIVE_ONE, ONE, Q192, ZERO } from "../internalConstants";
import { TickMath } from "../utils/tickMath";
import { Currency } from "./currency";
import { CurrencyAmount } from "./fractions/currencyAmount";
import { Price } from "./fractions/price";
import { Tick, TickConstructorArgs } from "./tick";
import { Token } from "./token";

interface StepComputations {
  sqrtPriceStartX96: bigint;
  tickNext: number;
  initialized: boolean;
  sqrtPriceNextX96: bigint;
  amountIn: bigint;
  amountOut: bigint;
  feeAmount: bigint;
}

export function makeSqrtPriceLimitX96({
  currentSqrtPriceX96,
  shift,
  zeroForOne,
}: {
  currentSqrtPriceX96: bigint;
  shift: number; // e.g. 50 = 0.5 %
  zeroForOne: boolean;
}): bigint {
  const currentTick = TickMath.getTickAtSqrtRatio(currentSqrtPriceX96);
  console.log(currentTick);
  console.log(shift);
  const limitTick = zeroForOne ? currentTick - shift : currentTick + shift;
  console.log("Limit tick", limitTick);
  return TickMath.getSqrtRatioAtTick(limitTick);
}

export function shiftSqrtPriceX96ByPercent(sqrtPriceX96: bigint, percent: number): bigint {
  const Q96 = 2n ** 96n;

  // 1. Переводим в обычную цену
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const price = sqrtPrice ** 2;

  // 2. Применяем процент
  const shiftedPrice = price * (1 + percent / 100);

  // 3. Возвращаем обратно в sqrtPriceX96
  const shiftedSqrtPrice = Math.sqrt(shiftedPrice);
  const shiftedSqrtPriceX96 = shiftedSqrtPrice * Number(Q96);

  return BigInt(Math.floor(shiftedSqrtPriceX96));
}

/**
 * By default, pools will not allow operations that require ticks.
 */
const NO_TICK_DATA_PROVIDER_DEFAULT = new NoTickDataProvider();

/**
 * Represents a V3 pool
 */
export class Pool {
  public readonly token0: Currency;
  public readonly token1: Currency;
  public readonly fee: FeeAmount;
  public readonly sqrtRatioX96: bigint;
  public readonly liquidity: bigint;
  public readonly tickCurrent: number;
  public readonly tickDataProvider: TickDataProvider;

  private _token0Price?: Price<Token, Token>;
  private _token1Price?: Price<Token, Token>;

  /**
   * Construct a pool
   * @param tokenA One of the tokens in the pool
   * @param tokenB The other token in the pool
   * @param fee The fee in hundredths of a bips of the input amount of every swap that is collected by the pool
   * @param sqrtRatioX96 The sqrt of the current ratio of amounts of token1 to token0
   * @param liquidity The current value of in range liquidity
   * @param tickCurrent The current tick of the pool
   * @param ticks The current state of the pool ticks or a data provider that can return tick data
   */
  public constructor(
    tokenA: Currency,
    tokenB: Currency,
    fee: FeeAmount,
    sqrtRatioX96: BigintIsh,
    liquidity: BigintIsh,
    tickCurrent: number,
    ticks: TickDataProvider | (Tick | TickConstructorArgs)[] = NO_TICK_DATA_PROVIDER_DEFAULT,
  ) {
    invariant(Number.isInteger(fee) && fee < 1_000_000, "FEE");

    const tickCurrentSqrtRatioX96 = TickMath.getSqrtRatioAtTick(tickCurrent);
    const nextTickSqrtRatioX96 = TickMath.getSqrtRatioAtTick(tickCurrent + 1);
    invariant(
      BigInt(sqrtRatioX96) >= tickCurrentSqrtRatioX96 &&
        BigInt(sqrtRatioX96) <= nextTickSqrtRatioX96,
      "PRICE_BOUNDS",
    );
    // always create a copy of the list since we want the pool's tick list to be immutable
    [this.token0, this.token1] = tokenA.wrapped.sortsBefore(tokenB.wrapped)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
    this.fee = fee;
    this.sqrtRatioX96 = BigInt(sqrtRatioX96);
    this.liquidity = BigInt(liquidity);
    this.tickCurrent = tickCurrent;
    this.tickDataProvider = Array.isArray(ticks)
      ? new TickListDataProvider(ticks, TICK_SPACINGS[fee])
      : ticks;
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token The token to check
   * @returns True if token is either token0 or token
   */
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0.wrapped) || token.equals(this.token1.wrapped);
  }

  /**
   * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
   */
  public get token0Price(): Price<Token, Token> {
    return (
      this._token0Price ??
      (this._token0Price = new Price(
        this.token0.wrapped,
        this.token1.wrapped,
        Q192,
        this.sqrtRatioX96 * this.sqrtRatioX96,
      ))
    );
  }

  /**
   * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
   */
  public get token1Price(): Price<Token, Token> {
    return (
      this._token1Price ??
      (this._token1Price = new Price(
        this.token1.wrapped,
        this.token0.wrapped,
        this.sqrtRatioX96 * this.sqrtRatioX96,
        Q192,
      ))
    );
  }

  /**
   * Return the price of the given token in terms of the other token in the pool.
   * @param token The token to return price of
   * @returns The price of the given token, in terms of the other.
   */
  public priceOf(token: Token): Price<Token, Token> {
    invariant(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0.wrapped) ? this.token0Price : this.token1Price;
  }

  /**
   * Returns the chain ID of the tokens in the pool.
   */
  public get chainId(): number {
    return this.token0.chainId;
  }

  /**
   * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
   * @param inputAmount The input amount for which to quote the output amount
   * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit
   * @returns The output amount and the pool with updated state
   */
  public async getOutputAmount(
    inputAmount: CurrencyAmount<Token>,
    sqrtPriceLimitX96?: bigint,
  ): Promise<[CurrencyAmount<Token>, Pool]> {
    invariant(this.involvesToken(inputAmount.currency), "TOKEN");

    const zeroForOne = inputAmount.currency.equals(this.token0.wrapped);

    const {
      amountCalculated: outputAmount,
      sqrtRatioX96,
      liquidity,
      tickCurrent,
    } = await this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX96);
    const outputToken = zeroForOne ? this.token1.wrapped : this.token0.wrapped;
    return [
      CurrencyAmount.fromRawAmount(outputToken, outputAmount * NEGATIVE_ONE),
      new Pool(
        this.token0,
        this.token1,
        this.fee,
        sqrtRatioX96,
        liquidity,
        tickCurrent,
        this.tickDataProvider,
      ),
    ];
  }

  /**
   * Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade
   * @param outputAmount the output amount for which to quote the input amount
   * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
   * @returns The input amount and the pool with updated state
   */
  public async getInputAmount(
    outputAmount: CurrencyAmount<Token>,
    sqrtPriceLimitX96?: bigint,
  ): Promise<[CurrencyAmount<Token>, Pool]> {
    invariant(outputAmount.currency.isToken && this.involvesToken(outputAmount.currency), "TOKEN");

    const zeroForOne = outputAmount.currency.equals(this.token1.wrapped);

    const {
      amountCalculated: inputAmount,
      sqrtRatioX96,
      liquidity,
      tickCurrent,
    } = await this.swap(zeroForOne, outputAmount.quotient * NEGATIVE_ONE, sqrtPriceLimitX96);
    const inputToken = zeroForOne ? this.token0.wrapped : this.token1.wrapped;
    return [
      CurrencyAmount.fromRawAmount(inputToken, inputAmount),
      new Pool(
        this.token0,
        this.token1,
        this.fee,
        sqrtRatioX96,
        liquidity,
        tickCurrent,
        this.tickDataProvider,
      ),
    ];
  }

  /**
   * Executes a swap
   * @param zeroForOne Whether the amount in is token0 or token1
   * @param amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
   * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
   * @returns amountCalculated
   * @returns sqrtRatioX96
   * @returns liquidity
   * @returns tickCurrent
   */
  private async swap(
    zeroForOne: boolean,
    amountSpecified: bigint,
    sqrtPriceLimitX96?: bigint,
  ): Promise<{
    amountCalculated: bigint;
    sqrtRatioX96: bigint;
    liquidity: bigint;
    tickCurrent: number;
  }> {
    const extraTickScan =
      {
        500: 200,
        3000: 100,
        10000: 50,
      }[this.fee] ?? 100;

    if (zeroForOne) {
      const [nextTick, _] = await this.tickDataProvider.nextInitializedTickWithinOneWord(
        this.tickCurrent,
        true,
        this.tickSpacing + extraTickScan,
      );
      sqrtPriceLimitX96 = TickMath.getSqrtRatioAtTick(nextTick);
    } else {
      const [nextTick, _] = await this.tickDataProvider.nextInitializedTickWithinOneWord(
        this.tickCurrent,
        false,
        this.tickSpacing + extraTickScan,
      );
      sqrtPriceLimitX96 = TickMath.getSqrtRatioAtTick(nextTick);
    }

    if (zeroForOne) {
      invariant(sqrtPriceLimitX96 > TickMath.MIN_SQRT_RATIO, "RATIO_MIN");
      invariant(sqrtPriceLimitX96 < this.sqrtRatioX96, "RATIO_CURRENT");
    } else {
      invariant(sqrtPriceLimitX96 < TickMath.MAX_SQRT_RATIO, "RATIO_MAX");
      invariant(sqrtPriceLimitX96 > this.sqrtRatioX96, "RATIO_CURRENT");
    }

    console.log("SWAP OPERATION", this.liquidity, this.sqrtRatioX96, this.tickDataProvider);

    const exactInput = amountSpecified >= ZERO;

    // keep track of swap state

    const state = {
      amountSpecifiedRemaining: amountSpecified,
      amountCalculated: ZERO,
      sqrtPriceX96: this.sqrtRatioX96,
      tick: this.tickCurrent,
      liquidity: this.liquidity,
    };

    // start swap while loop
    while (state.amountSpecifiedRemaining !== ZERO && state.sqrtPriceX96 != sqrtPriceLimitX96) {
      let step: Partial<StepComputations> = {};
      step.sqrtPriceStartX96 = state.sqrtPriceX96;

      // because each iteration of the while loop rounds, we can't optimize this code (relative to the smart contract)
      // by simply traversing to the next available tick, we instead need to exactly replicate
      // tickBitmap.nextInitializedTickWithinOneWord
      [step.tickNext, step.initialized] =
        await this.tickDataProvider.nextInitializedTickWithinOneWord(
          state.tick,
          zeroForOne,
          this.tickSpacing,
        );

      if (step.tickNext < TickMath.MIN_TICK) {
        step.tickNext = TickMath.MIN_TICK;
      } else if (step.tickNext > TickMath.MAX_TICK) {
        step.tickNext = TickMath.MAX_TICK;
      }

      step.sqrtPriceNextX96 = TickMath.getSqrtRatioAtTick(step.tickNext);
      [state.sqrtPriceX96, step.amountIn, step.amountOut, step.feeAmount] =
        SwapMath.computeSwapStep(
          state.sqrtPriceX96,
          (
            zeroForOne
              ? step.sqrtPriceNextX96 < sqrtPriceLimitX96
              : step.sqrtPriceNextX96 > sqrtPriceLimitX96
          )
            ? sqrtPriceLimitX96
            : step.sqrtPriceNextX96,
          state.liquidity,
          state.amountSpecifiedRemaining,
          this.fee,
        );

      if (exactInput) {
        state.amountSpecifiedRemaining =
          state.amountSpecifiedRemaining - step.amountIn - step.feeAmount;
        state.amountCalculated = state.amountCalculated - step.amountOut;
      } else {
        state.amountSpecifiedRemaining = state.amountSpecifiedRemaining + step.amountOut;
        state.amountCalculated = state.amountCalculated + step.amountIn + step.feeAmount;
      }

      if (state.sqrtPriceX96 === step.sqrtPriceNextX96) {
        if (step.initialized) {
          let liquidityNet = BigInt(
            (await this.tickDataProvider.getTick(step.tickNext)).liquidityNet,
          );
          // if we're moving leftward, we interpret liquidityNet as the opposite sign
          // safe because liquidityNet cannot be type(int128).min
          if (zeroForOne) liquidityNet = liquidityNet * NEGATIVE_ONE;

          state.liquidity = LiquidityMath.addDelta(state.liquidity, liquidityNet);
        }

        state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
      } else {
        // updated comparison function
        // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
        state.tick = TickMath.getTickAtSqrtRatio(state.sqrtPriceX96);
      }
    }

    return {
      amountCalculated: state.amountCalculated,
      sqrtRatioX96: state.sqrtPriceX96,
      liquidity: state.liquidity,
      tickCurrent: state.tick,
    };
  }

  public get tickSpacing(): number {
    return TICK_SPACINGS[this.fee];
  }
}
