import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import { useImportToken } from "@/components/manage-tokens/ImportToken";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { usePathname } from "@/i18n/routing";
import { DexChainId } from "@/sdk_bi/chains";
import { FeeAmount } from "@/sdk_bi/constants";

import { useTokens } from "./useTokenLists";

enum PoolsQueryParams {
  tokenA = "tokenA",
  tokenB = "tokenB",
  tier = "tier",
  chainId = "chainId",
}

export const usePoolsSearchParams = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const locale = useLocale();
  const _pathname = usePathname();
  const pathname = `/${locale}${_pathname}`;
  const searchParams = useSearchParams();
  const tokens = useTokens();
  const _chainId = useCurrentChainId();

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();

  const currentPath = useMemo(() => {
    return searchParams.toString() ? pathname + "?" + searchParams.toString() : pathname;
  }, [searchParams, pathname]);

  const updatedPath = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (tokenA?.wrapped.address0) {
      params.set(PoolsQueryParams.tokenA, tokenA.wrapped.address0);
    } else {
      params.delete(PoolsQueryParams.tokenA);
    }
    if (tokenB?.wrapped.address0) {
      params.set(PoolsQueryParams.tokenB, tokenB.wrapped.address0);
    } else {
      params.delete(PoolsQueryParams.tokenB);
    }
    params.set(PoolsQueryParams.tier, tier.toString());

    return pathname + "?" + params.toString();
  }, [pathname, searchParams, tokenA, tokenB, tier]);

  const queryTokenA = useMemo(() => {
    return searchParams.get(PoolsQueryParams.tokenA);
  }, [searchParams]);

  const queryTokenB = useMemo(() => {
    return searchParams.get(PoolsQueryParams.tokenB);
  }, [searchParams]);

  const tokenAFromList = useMemo(() => {
    if (queryTokenA && isAddress(queryTokenA)) {
      return tokens.find((t) => t.wrapped.address0.toLowerCase() === queryTokenA.toLowerCase());
    }
  }, [queryTokenA, tokens]);

  const tokenBFromList = useMemo(() => {
    if (queryTokenB && isAddress(queryTokenB)) {
      return tokens.find((t) => t.wrapped.address0.toLowerCase() === queryTokenB.toLowerCase());
    }
  }, [queryTokenB, tokens]);

  const queryChainId = useMemo(() => {
    return searchParams.get(PoolsQueryParams.chainId)
      ? (Number(searchParams.get(PoolsQueryParams.chainId)) as DexChainId)
      : _chainId;
  }, [_chainId, searchParams]);

  const { handleImport } = useImportToken();

  useEffect(() => {
    if (!isInitialized && tokens.length > 1) {
      IIFE(async () => {
        if (tokenAFromList) {
          setTokenA(tokenAFromList);
        } else {
          if (queryTokenA && isAddress(queryTokenA)) {
            const token = await handleImport(queryTokenA, queryChainId);
            if (token) {
              setTokenA(token);
            }
            // setTokenA(tokenToImportA);
          }
        }

        if (tokenBFromList) {
          setTokenB(tokenBFromList);
        } else {
          if (queryTokenB && isAddress(queryTokenB)) {
            const token = await handleImport(queryTokenB, queryChainId);
            if (token) {
              setTokenB(token);
            }
          }
        }

        const queryTier = parseInt(searchParams.get(PoolsQueryParams.tier) || "");

        if (queryTier && Object.values(FeeAmount).includes(queryTier)) {
          setTier(queryTier as FeeAmount);
        }

        setIsInitialized(true);
      });
    }
  }, [
    searchParams,
    tokens,
    setTokenA,
    setTokenB,
    setTier,
    isInitialized,
    tokenAFromList,
    tokenBFromList,
    queryTokenA,
    handleImport,
    queryChainId,
    queryTokenB,
  ]);

  useEffect(() => {
    if (isInitialized) {
      console.log("INITIALIZED");
      if (currentPath !== updatedPath) {
        window.history.replaceState(null, "", updatedPath);
      }
    }
  }, [currentPath, updatedPath, isInitialized]);
};
