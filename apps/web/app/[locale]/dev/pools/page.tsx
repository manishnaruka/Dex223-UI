"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import { Bound } from "@/app/[locale]/add/components/PriceRange/LiquidityChartRangeInput/types";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import Input from "@/components/atoms/Input";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { PoolState } from "@/hooks/usePools";
import { FeeAmount, TICK_SPACINGS } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { Price } from "@/sdk_bi/entities/fractions/price";
import { nearestUsableTick } from "@/sdk_bi/utils/nearestUsableTick";
import { priceToClosestTick } from "@/sdk_bi/utils/priceTickConversions";
import { useGlobalFees } from "@/shared/hooks/useGlobalFees";
import { useStorePools } from "@/shared/hooks/usePools";
import { usePriceRange } from "@/shared/hooks/usePriceRange";
import { useV3DerivedMintInfo } from "@/shared/hooks/useV3DerivedMintInfo";

export default function DevPoolsPage() {
  const chainId = useCurrentChainId();
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const { setTokenA: setStoreTokenA, setTokenB: setStoreTokenB } = useAddLiquidityTokensStore();
  const { setTier } = useLiquidityTierStore();

  const {
    typedValue,
    independentField,
    dependentField,
    setTypedValue, // якщо у твоєму сторі називається інакше — підстав актуальну дію
  } = useLiquidityAmountsStore();

  // розрахунок позиції/залежної суми

  // значення для інпутів (керовані)

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");
  const [tokenA, setTokenA] = useState<Currency>();
  const [tokenB, setTokenB] = useState<Currency>();

  const handlePick = useCallback(
    (token?: Currency, tokenPicking?: "tokenA" | "tokenB") => {
      const currentlyPickingToken = tokenPicking || currentlyPicking;
      if (currentlyPickingToken === "tokenA") {
        if (!token) {
          setTokenA(undefined);
          setStoreTokenA(undefined);
        } else {
          if (token === tokenB) {
            setTokenB(tokenA);
            setStoreTokenB(tokenA); // ← синхронізація
          }
          setTokenA(token);
          setStoreTokenA(token); // ← синхронізація
        }
      }

      if (currentlyPickingToken === "tokenB") {
        if (!token) {
          setTokenB(undefined);
          setStoreTokenB(undefined);
        } else {
          if (token === tokenA) {
            setTokenA(tokenB);
            setStoreTokenA(tokenB); // ← синхронізація
          }
          setTokenB(token);
          setStoreTokenB(token); // ← синхронізація
        }
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setStoreTokenA, tokenB, tokenA, setStoreTokenB],
  );

  const [fee, setFee] = useState<FeeAmount>(FeeAmount.MEDIUM);

  useEffect(() => {
    setTier(fee);
  }, [fee, setTier]);

  const [enabled, setEnabled] = useState(true);
  const [refreshOnBlock, setRefreshOnBlock] = useState(true);

  const [delayMs, setDelayMs] = useState(800);

  // const baseFetcher = useFetchPoolData(chainId);
  //
  // const delayedFetcher = useMemo(() => {
  //   if (!baseFetcher) return undefined;
  //   return async (...args: Parameters<typeof baseFetcher>) => {
  //     if (delayMs > 0) {
  //       await new Promise((r) => setTimeout(r, delayMs));
  //     }
  //     return baseFetcher(...args);
  //   };
  // }, [baseFetcher, delayMs]);

  const pools = useStorePools([{ currencyA: tokenA, currencyB: tokenB, tier: fee }], {
    enabled,
    refreshOnBlock,
  });

  const pools_ = useStorePools(
    [
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.LOW },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.MEDIUM },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.HIGH },
    ],
    {
      enabled,
      refreshOnBlock,
    },
  );

  const [state, pool] = pools[0] ?? [PoolState.IDLE, null];

  console.log(pools_);

  // ======== PRICE + RANGE (локально) ========
  const { tier } = useLiquidityTierStore();
  const tickSpacing = tier ? TICK_SPACINGS[tier] : undefined;

  const { ticks, startPriceTypedValue, setTicks, setRangeTouched, setStartPriceTypedValue } =
    useLiquidityPriceRangeStore();

  // Готові похідні (ціна, ліміти, ціни на межах) — все без RPC
  const { formattedPrice, price, leftPrice, rightPrice, tickSpaceLimits } = usePriceRange();

  const noLiquidity = state === PoolState.NOT_EXISTS;
  // контроль інпутів тік-діапазону
  const lowerTick = typeof ticks?.LOWER === "number" ? ticks.LOWER : "";
  const upperTick = typeof ticks?.UPPER === "number" ? ticks.UPPER : "";
  const [lowerPriceInput, setLowerPriceInput] = useState("");
  const [upperPriceInput, setUpperPriceInput] = useState("");

  const onPriceChange = (bound: Bound) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (bound === Bound.LOWER) setLowerPriceInput(val);
    if (bound === Bound.UPPER) setUpperPriceInput(val);

    if (!tokenA || !tokenB) return;
    const base = tokenA.wrapped;
    const quote = tokenB.wrapped;

    const parsed = tryParseCurrencyAmount(val, quote);
    if (!parsed) return;

    const baseAmount = tryParseCurrencyAmount("1", base);
    if (!baseAmount) return;

    const price = new Price(
      baseAmount.currency.wrapped,
      parsed.currency.wrapped,
      baseAmount.quotient,
      parsed.quotient,
    );

    const tick = priceToClosestTick(price);

    setTicks({
      [bound]: nearestUsableTick(tick, tickSpacing ?? 60),
    });
  };

  const { parsedAmounts, position, outOfRange, depositADisabled, depositBDisabled } =
    useV3DerivedMintInfo({
      tokenA,
      tokenB,
      tier: fee, // fee зі сторінки
      price, // з usePrice()
    });

  console.log(parsedAmounts);

  const amountA =
    independentField === Field.CURRENCY_A
      ? typedValue
      : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6);

  const amountB =
    independentField === Field.CURRENCY_B
      ? typedValue
      : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6);

  // хендлери
  const onAmountAChange = useCallback(
    (v: string) => {
      setTypedValue({ typedValue: v, field: Field.CURRENCY_A });
    },
    [setTypedValue],
  );

  const onAmountBChange = useCallback(
    (v: string) => {
      setTypedValue({ typedValue: v, field: Field.CURRENCY_B });
    },
    [setTypedValue],
  );

  const { gasPrice, baseFee, priorityFee, timestamp } = useGlobalFees();

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Pools Dev Monitor</h1>

      <div>{gasPrice}</div>
      <div>{baseFee}</div>
      <div>{priorityFee}</div>
      <div>{timestamp}</div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div className="flex w-full lg:w-auto gap-2 items-center ml-auto">
          <SelectButton
            className="pl-4 md:pl-5"
            fullWidth
            onClick={() => {
              setCurrentlyPicking("tokenA");
              setIsOpenedTokenPick(true);
            }}
            size="medium"
            withArrow={!tokenA}
          >
            {tokenA ? (
              <span className="flex gap-2 items-center">
                <Image
                  className="flex-shrink-0 hidden md:block"
                  src={tokenA?.logoURI || "/images/tokens/placeholder.svg"}
                  alt="Ethereum"
                  width={24}
                  height={24}
                />
                <Image
                  className="flex-shrink-0 block md:hidden"
                  src={tokenA?.logoURI || "/images/tokens/placeholder.svg"}
                  alt="Ethereum"
                  width={24}
                  height={24}
                />
                <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                  {tokenA.symbol}
                </span>
                <Svg
                  className="flex-shrink-0"
                  iconName="close"
                  size={20}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePick(undefined, "tokenA");
                  }}
                />
              </span>
            ) : (
              <span className="text-tertiary-text">{"Token"}</span>
            )}
          </SelectButton>
          <span>—</span>
          <SelectButton
            fullWidth
            className="pl-4 md:pl-5"
            onClick={() => {
              setCurrentlyPicking("tokenB");
              setIsOpenedTokenPick(true);
            }}
            size="medium"
            withArrow={!tokenB}
          >
            {tokenB ? (
              <span className="flex gap-2 items-center">
                <Image
                  className="flex-shrink-0 hidden md:block"
                  src={tokenB?.logoURI || "/images/tokens/placeholder.svg"}
                  alt="Ethereum"
                  width={24}
                  height={24}
                />
                <Image
                  className="flex-shrink-0 block md:hidden"
                  src={tokenB?.logoURI || "/images/tokens/placeholder.svg"}
                  alt="Ethereum"
                  width={24}
                  height={24}
                />
                <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                  {tokenB.symbol}
                </span>
                <Svg
                  className="flex-shrink-0"
                  iconName="close"
                  size={20}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePick(undefined, "tokenB");
                  }}
                />
              </span>
            ) : (
              <span className="text-terтіary-text">{"Token"}</span>
            )}
          </SelectButton>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Fee tier
          <select value={fee} onChange={(e) => setFee(Number(e.target.value) as FeeAmount)}>
            <option value={FeeAmount.LOW}>LOW (0.05%)</option>
            <option value={FeeAmount.MEDIUM}>MEDIUM (0.3%)</option>
            <option value={FeeAmount.HIGH}>HIGH (1%)</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          enabled
        </label>

        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={refreshOnBlock}
            onChange={(e) => setRefreshOnBlock(e.target.checked)}
          />
          refresh on block
        </label>

        <label>
          Delay, ms
          <input
            type="number"
            min={0}
            step={100}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <div>
          <b>Status:</b> {PoolState[state] ?? "n/a"}
        </div>
        <div>
          <b>Pool exists:</b> {state === PoolState.EXISTS ? "yes" : "no"}
        </div>
        <div>
          <b>Pool object:</b> {state === PoolState.EXISTS ? "loaded" : "—"}
        </div>
      </div>

      {/* ===== PRICE ===== */}
      <div style={{ marginTop: 20, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h3 style={{ marginBottom: 10 }}>Price</h3>
        {state === PoolState.EXISTS ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span>Mid price:</span>
            <code>{formattedPrice}</code>
            <span style={{ color: "#6b7280" }}>(read-only, from pool snapshot)</span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>
              Start price (A/B)
              <Input
                type="number"
                min={0}
                step="any"
                value={startPriceTypedValue ?? ""}
                onChange={(e) => setStartPriceTypedValue(e.target.value)}
                style={{ width: 200, marginLeft: 8 }}
              />
            </label>
            <span style={{ color: "#6b7280" }}>Пул не існує — введи стартову ціну (без RPC)</span>
          </div>
        )}
      </div>

      {/* ===== RANGE IN TICKS ===== */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <div>
          <b>Range (prices)</b>
        </div>
        <label>
          Lower price (A/B)
          <Input
            type="number"
            value={lowerPriceInput}
            onChange={onPriceChange(Bound.LOWER)}
            style={{ width: 140, marginLeft: 8 }}
          />
        </label>
        <label style={{ marginLeft: 12 }}>
          Upper price (A/B)
          <Input
            type="number"
            value={upperPriceInput}
            onChange={onPriceChange(Bound.UPPER)}
            style={{ width: 140, marginLeft: 8 }}
          />
        </label>

        <div style={{ marginTop: 12, color: "#6b7280" }}>
          Lower tick: {ticks?.LOWER ?? "—"} <br />
          Upper tick: {ticks?.UPPER ?? "—"}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h3 style={{ marginBottom: 10 }}>Amounts</h3>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            Amount A
            <Input
              type="number"
              inputMode="decimal"
              value={amountA}
              onChange={(e) => onAmountAChange(e.target.value)}
              placeholder="0.0"
              style={{ width: 180, marginLeft: 8 }}
            />
          </label>

          <label>
            Amount B
            <Input
              type="number"
              inputMode="decimal"
              value={amountB}
              onChange={(e) => onAmountBChange(e.target.value)}
              placeholder="0.0"
              style={{ width: 180, marginLeft: 8 }}
            />
          </label>

          <div style={{ display: "flex", gap: 12, color: "#6b7280", flexWrap: "wrap" }}>
            <span>
              outOfRange: <b>{outOfRange ? "true" : "false"}</b>
            </span>
            <span>
              depositA disabled: <b>{depositADisabled ? "true" : "false"}</b>
            </span>
            <span>
              depositB disabled: <b>{depositBDisabled ? "true" : "false"}</b>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 8, color: "#6b7280" }}>
          {position ? (
            <div>
              <div>
                mintAmounts.amount0: <code>{position.mintAmounts.amount0.toString()}</code>
              </div>
              <div>
                mintAmounts.amount1: <code>{position.mintAmounts.amount1.toString()}</code>
              </div>
              <div>
                tickLower / tickUpper:{" "}
                <code>
                  {ticks?.LOWER ?? "—"} / {ticks?.UPPER ?? "—"}
                </code>
              </div>
            </div>
          ) : (
            <div>position: —</div>
          )}
        </div>
      </div>

      <pre style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
        {JSON.stringify(ticks, null, 2)}
      </pre>

      <pre style={{ fontSize: 12, color: "#888" }}>
        {JSON.stringify({ independentField, typedValue }, null, 2)}
      </pre>

      <p style={{ marginTop: 8, color: "#6b7280" }}>
        Сторінка навмисно накладає затримку на фетч пулу через <code>fetchOverride</code>, щоб можна
        було відслідкувати, що <b>in-flight dedup</b> і <b>refresh on block</b> працюють без
        лавинних викликів. Блоки <b>Price</b> і <b>Range</b> рахуються локально (без RPC).
      </p>

      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
    </div>
  );
}
