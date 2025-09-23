import { useMemo } from "react";

import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeepEffect from "@/hooks/useDeepEffect";
import useDeepMemo from "@/hooks/useDeepMemo";
import { useFetchPoolData } from "@/hooks/useFetchPoolsData";
import { FeeAmount } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { Pool } from "@/sdk_bi/entities/pool";
import { getPoolAddressKey, useComputePoolAddressesDex } from "@/sdk_bi/utils/computePoolAddress";
import { useGlobalBlockNumber } from "@/shared/hooks/useGlobalBlockNumber";
import { _usePoolsStore, usePoolAddresses } from "@/stores/usePoolsStore";

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
  IDLE,
}

export type PoolParams = {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  tier: FeeAmount | undefined;
};

export type PoolsParams = PoolParams[];

export type PoolResult = [PoolState, Pool | null];
export type PoolsResult = PoolResult[];

/** Додаткові опції (необов’язкові) */
type UseStorePoolsOptions = {
  enabled?: boolean; // за замовчуванням true
  refreshOnBlock?: boolean; // за замовчуванням true
  fetchOverride?: ReturnType<typeof useFetchPoolData>; // опційно підмінити фетчер (для тестів/затримок)
};

// In-flight dedup: один реальний фетч на ключ одночасно
const inFlight = new Map<string, Promise<void>>();

// Який блок останнім разом фетчили по конкретному ключу (щоб не фетчити двічі в той самий блок)
const lastFetchedBlockForKey = new Map<string, bigint | undefined>();

export function useStorePools(
  poolsParams: PoolsParams,
  options?: UseStorePoolsOptions,
): PoolsResult {
  const enabled = options?.enabled ?? true;
  const refreshOnBlock = options?.refreshOnBlock ?? true;

  const setStatus = _usePoolsStore((state) => state.setStatus);
  const pools = _usePoolsStore((state) => state.pools);
  const chainId = useCurrentChainId();
  const { addresses } = usePoolAddresses();

  // підписуємось на блоки (глобально), беремо lastBlock у залежності
  const { blockNumber } = useGlobalBlockNumber();

  const poolKeys = useMemo(() => {
    if (!chainId) return [];
    return poolsParams.map(({ currencyA, currencyB, tier }) => {
      if (!currencyA || !currencyB || !tier) return undefined;
      if (currencyA.wrapped.equals(currencyB.wrapped)) return undefined;
      const token0 = currencyA.wrapped.sortsBefore(currencyB.wrapped) ? currencyA : currencyB;
      const token1 = currencyA.wrapped.sortsBefore(currencyB.wrapped) ? currencyB : currencyA;
      return getPoolAddressKey({
        addressTokenA: token0.wrapped.address0,
        addressTokenB: token1.wrapped.address0,
        chainId,
        tier,
      });
    });
  }, [poolsParams, chainId]);

  const poolTokens: ({ token0: Currency; token1: Currency; tier: FeeAmount } | undefined)[] =
    useMemo(() => {
      if (!chainId) return [...Array(poolsParams.length)];

      return poolsParams.map(({ currencyA, currencyB, tier }) => {
        if (!currencyA || !currencyB || !tier) {
          return undefined;
        }
        const tokenA = currencyA;
        const tokenB = currencyB;
        if (tokenA.wrapped.equals(tokenB.wrapped)) return undefined;
        return {
          token0: tokenA.wrapped.sortsBefore(tokenB.wrapped) ? tokenA : tokenB,
          token1: tokenA.wrapped.sortsBefore(tokenB.wrapped) ? tokenB : tokenA,
          tier,
        };
      });
    }, [chainId, poolsParams]);

  const poolAddressesParams = useMemo(() => {
    return poolTokens.map((poolToken) => {
      if (!poolToken)
        return {
          tokenA: undefined,
          tokenB: undefined,
          tier: undefined,
        };
      const { token0, token1, tier } = poolToken;
      return {
        tokenA: token0,
        tokenB: token1,
        tier,
      };
    });
  }, [poolTokens]);

  useComputePoolAddressesDex(poolAddressesParams);

  const fetchPoolDataBase = useFetchPoolData(chainId);
  const fetchPoolData = options?.fetchOverride ?? fetchPoolDataBase;

  useDeepEffect(() => {
    if (!enabled) return;
    if (!poolKeys.length) return;

    poolKeys.forEach((key, index) => {
      if (!key) return;

      const addrRec = addresses[key];
      const address = addrRec?.address;
      if (!address) return;

      const poolRecord = pools[key];

      const isIdle = !poolRecord || poolRecord.status === PoolState.IDLE;
      const isStale = !!poolRecord?.lastUpdated && poolRecord.lastUpdated < Date.now() - 60000; // TTL, як і було
      const isLoading = poolRecord?.status === PoolState.LOADING;

      // block-refresh: фетчимо максимум 1 раз на блок для цього ключа
      const lastFetchedBlock = lastFetchedBlockForKey.get(key);
      const shouldRefetchByBlock =
        refreshOnBlock && blockNumber !== undefined && lastFetchedBlock !== blockNumber;

      if (inFlight.has(key)) return;

      const tokens = poolTokens[index];
      if (!tokens) return;

      const shouldFetch = isIdle || isStale || shouldRefetchByBlock;

      if (shouldFetch && !isLoading) {
        setStatus(key, PoolState.LOADING);

        const { token0, token1, tier } = tokens;

        // Запам'ятати, що для цього ключа почали фетч в цьому блоці
        if (refreshOnBlock && blockNumber !== undefined) {
          lastFetchedBlockForKey.set(key, blockNumber);
        }

        const p = fetchPoolData(key, address, token0, token1, tier)
          .then((pool) => {
            if (pool) {
              setStatus(key, PoolState.EXISTS, pool);
            } else {
              setStatus(key, PoolState.NOT_EXISTS);
            }
          })
          .catch((err) => {
            setStatus(key, PoolState.INVALID, undefined, err?.message ?? "Pool fetch failed");
          })
          .finally(() => {
            inFlight.delete(key);
          });

        inFlight.set(key, p);
      }
    });
  }, [
    enabled,
    poolKeys,
    poolTokens,
    addresses,
    pools,
    setStatus,
    fetchPoolData,
    refreshOnBlock,
    blockNumber,
  ]);

  return useDeepMemo(() => {
    return poolKeys.map((key) => {
      if (!key) return [PoolState.INVALID, null];

      const poolRecord = pools[key];
      if (!poolRecord) return [PoolState.NOT_EXISTS, null];

      switch (poolRecord.status) {
        case PoolState.EXISTS:
          return [PoolState.EXISTS, poolRecord.pool ?? null];
        case PoolState.NOT_EXISTS:
          return [PoolState.NOT_EXISTS, null];
        case PoolState.INVALID:
          return [PoolState.INVALID, null];
        case PoolState.LOADING:
          return [PoolState.LOADING, null];
        case PoolState.IDLE:
          return [PoolState.IDLE, null];
        default:
          return [PoolState.LOADING, null];
      }
    });
  }, [poolKeys, pools]);
}

export function usePool(poolParamas: PoolParams): [PoolState, Pool | null] {
  const poolsParams = useDeepMemo(() => [poolParamas], [poolParamas]);
  return useStorePools(poolsParams)[0];
}
