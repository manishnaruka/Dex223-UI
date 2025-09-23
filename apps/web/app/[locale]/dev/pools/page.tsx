"use client";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useFetchPoolData } from "@/hooks/useFetchPoolsData";
import { FeeAmount } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { PoolState, useStorePools } from "@/shared/hooks/usePools";

export default function DevPoolsPage() {
  const chainId = useCurrentChainId();
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");
  const [tokenA, setTokenA] = useState<Currency>();
  const [tokenB, setTokenB] = useState<Currency>();
  const handlePick = useCallback(
    (token?: Currency, tokenPicking?: "tokenA" | "tokenB") => {
      const currentlyPickingToken = tokenPicking || currentlyPicking;
      if (currentlyPickingToken === "tokenA") {
        if (!token) {
          setTokenA(undefined);
        } else {
          if (token === tokenB) {
            setTokenB(tokenA);
          }

          setTokenA(token);
        }
      }

      if (currentlyPickingToken === "tokenB") {
        if (!token) {
          setTokenB(undefined);
        } else {
          if (token === tokenA) {
            setTokenA(tokenB);
          }
          setTokenB(token);
        }
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB, tokenA, tokenB, setIsOpenedTokenPick],
  );

  const [fee, setFee] = useState<FeeAmount>(FeeAmount.MEDIUM);

  const [enabled, setEnabled] = useState(true);
  const [refreshOnBlock, setRefreshOnBlock] = useState(true);

  const [delayMs, setDelayMs] = useState(800);

  const baseFetcher = useFetchPoolData(chainId);

  const delayedFetcher = useMemo(() => {
    if (!baseFetcher) return undefined;
    return async (...args: Parameters<typeof baseFetcher>) => {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return baseFetcher(...args);
    };
  }, [baseFetcher, delayMs]);

  const pools = useStorePools([{ currencyA: tokenA, currencyB: tokenB, tier: fee }], {
    enabled,
    refreshOnBlock,
    fetchOverride: delayedFetcher,
  });

  const [state, pool] = pools[0] ?? [PoolState.IDLE, null];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Pools Dev Monitor</h1>

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
              <span className="text-tertiary-text">{"Token"}</span>
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

      <p style={{ marginTop: 8, color: "#6b7280" }}>
        Сторінка навмисно накладає затримку на фетч пулу через <code>fetchOverride</code>, щоб можна
        було відслідкувати, що <b>in-flight dedup</b> і <b>refresh on block</b> працюють без
        лавинних викликів.
      </p>

      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
    </div>
  );
}
