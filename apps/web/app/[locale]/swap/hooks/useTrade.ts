import { useEffect, useState } from "react";
import {
  Address,
  decodeAbiParameters,
  decodeErrorResult,
  encodeFunctionData,
  parseUnits,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { POOL_ABI } from "@/config/abis/pool";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useDebounce } from "@/hooks/useDebounce";
import { PoolsResult, PoolState, useStorePools } from "@/hooks/usePools";
import { FeeAmount, TICK_SPACINGS, TradeType } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { Pool } from "@/sdk_bi/entities/pool";
import { Trade } from "@/sdk_bi/entities/trade";
import { ONE, Q96 } from "@/sdk_bi/internalConstants";
import { computePoolAddressDex } from "@/sdk_bi/utils/computePoolAddress";
import { TickMath } from "@/sdk_bi/utils/tickMath";

function filterPools(poolStates: PoolsResult): Pool[] {
  return poolStates
    .filter((state): state is [PoolState, Pool] => state[1] !== null) // Type guard to remove null Pools
    .map(([, pool]) => pool); // Extract the Pool objects
}

export type TokenTrade = Trade<Currency, Currency, TradeType>;
const poolsFees = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

export enum TradeError {
  NO_LIQUIDITY,
}

export function useTrade(): {
  trade: TokenTrade | null;
  isLoading: boolean;
  pools: PoolsResult;
  error: TradeError | null;
} {
  const [error, setError] = useState<TradeError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { tokenA, tokenB } = useSwapTokensStore();
  const chainId = useCurrentChainId();

  const { typedValue } = useSwapAmountsStore();
  const pools = useStorePools(
    poolsFees.map((feeAmount) => {
      return {
        currencyA: tokenA,
        currencyB: tokenB,
        tier: feeAmount,
      };
    }),
  );
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [trade, setTrade] = useState<TokenTrade | null>(null);

  const debouncedTypedValue = useDebounce(typedValue, 150);

  console.log("Pools", pools);

  // useEffect(() => {
  //   const firstPool = pools[2][1];
  //   if (
  //     !firstPool ||
  //     !walletClient ||
  //     !tokenA ||
  //     !tokenB ||
  //     !debouncedTypedValue ||
  //     !publicClient
  //   ) {
  //     return;
  //   }

  //   IIFE(async () => {
  //     const poolAddress = await computePoolAddressDex({
  //       addressTokenA: tokenA.wrapped.address0,
  //       addressTokenB: tokenB.wrapped.address1,
  //       tier: firstPool.fee,
  //       chainId,
  //     });
  //     console.log(poolAddress);
  //
  //     const dummyRecipient = "0x0000000000000000000000000000000000000001" as Address;
  //     const zeroForOne = tokenA.wrapped.address0 < tokenB.wrapped.address0;
  //     const deltaSqrt =
  //       (parseUnits(debouncedTypedValue, tokenA.decimals) * Q96) / firstPool.liquidity;
  //     const sqrtPriceLimitX96 = zeroForOne
  //       ? firstPool.sqrtRatioX96 + deltaSqrt
  //       : firstPool.sqrtRatioX96 - deltaSqrt;
  //
  //     const path = `0x${[
  //       tokenA.wrapped.address0.slice(2),
  //       firstPool.fee.toString(16).padStart(6, "0"),
  //       tokenB.wrapped.address0.slice(2),
  //     ].join("")}` as `0x${string}`;
  //
  //     try {
  //       // const calldata = encodeFunctionData({
  //       //   abi: POOL_ABI,
  //       //   functionName: "swap",
  //       //   args: [
  //       //     dummyRecipient,
  //       //     zeroForOne,
  //       //     parseUnits(debouncedTypedValue, tokenA.decimals),
  //       //     sqrtPriceLimitX96,
  //       //     false,
  //       //     path,
  //       //   ],
  //       // });
  //       //
  //       // await publicClient.call({
  //       //   to: poolAddress,
  //       //   data: calldata,
  //       // });
  //
  //       const result = await publicClient.simulateContract({
  //         abi: POOL_ABI,
  //         address: poolAddress as Address,
  //         functionName: "swap",
  //         args: [
  //           dummyRecipient,
  //           zeroForOne,
  //           parseUnits(debouncedTypedValue, tokenA.decimals),
  //           sqrtPriceLimitX96,
  //           false,
  //           path,
  //         ],
  //       });
  //     } catch (e) {
  //       console.log(e.cause);
  //
  //       const revertData = e.cause?.data || e.data;
  //       console.log("🔍 Object.keys(err):", Object.keys(e.cause));
  //       console.log(revertData);
  //       console.log(e.cause.data);
  //       console.log(e.cause.raw);
  //       const value = decodeErrorResult({
  //         abi: QUOTER_ABI,
  //         data: e.cause.raw,
  //       });
  //       console.log(value);
  //       // decode a single uint256 from the 32-byte payload
  //       // const bigint11 = decodeAbiParameters([{ type: "uint256", name: "amount" }], revertData);
  //       // //
  //       // console.log("Quoted amountOut:", bigint11);
  //     }
  //
  //     console.log("posdf", poolAddress);
  //     if (!poolAddress) {
  //       return;
  //     }
  //
  //     console.log(zeroForOne);
  //     console.log(firstPool);
  //
  //     // const sqrtPriceLimitX96 =
  //     //   firstPool.sqrtRatioX96 +
  //     //   parseUnits(debouncedTypedValue, tokenA.decimals) / firstPool.liquidity;
  //     // sqrtPX96 + -amount / liquidity;
  //     console.log(sqrtPriceLimitX96);
  //
  //     console.log([
  //       tokenA.wrapped.address0,
  //       tokenB.wrapped.address0,
  //       firstPool.fee,
  //       parseUnits(debouncedTypedValue, tokenA.decimals),
  //       BigInt(0),
  //     ]);
  //     // console.log(firstPool);
  //
  //     try {
  //       const result = await publicClient.simulateContract({
  //         abi: QUOTER_ABI,
  //         address: "0x410995BF19C450AACCc51e1ab647E589CAC4332f",
  //         functionName: "quoteExactInputSingle",
  //         args: [
  //           tokenA.wrapped.address0,
  //           tokenB.wrapped.address0,
  //           firstPool.fee,
  //           parseUnits(debouncedTypedValue, tokenA.decimals),
  //           BigInt(0),
  //         ],
  //       });
  //     } catch (e) {
  //       console.log("🔍 Object.keys(err):", Object.keys(e));
  //       console.log("🔍 Object.keys(err):", Object.keys(e.cause));
  //       console.log(e.cause.data);
  //       console.log(e.cause.raw);
  //       const value = decodeErrorResult({
  //         abi: QUOTER_ABI,
  //         data: e.cause.raw,
  //       });
  //       console.log(value);
  //     }
  //   });
  //
  //   // console.log(result);
  //
  //   // const result1 = await publicClient.simulateContract({
  //   //   abi: QUOTER_ABI,
  //   //   address: "0x910991f4c61B92FB0e937F4fC2d95DeBad60c036",
  //   //   functionName: "quoteExactInputSingle",
  //   //   args: [
  //   //     "0x8F5Ea3D9b780da2D0Ab6517ac4f6E697A948794f",
  //   //     "0xEC5aa08386F4B20dE1ADF9Cdf225b71a133FfaBa",
  //   //     10000,
  //   //     400n,
  //   //     25045681874963204020934943n,
  //   //   ],
  //   // });
  //
  //   // console.log("QUOTER WOW", result);
  //   // });
  // }, [chainId, debouncedTypedValue, pools, publicClient, tokenA, tokenB, walletClient]);

  useEffect(() => {
    if (!tokenA || !tokenB || !+debouncedTypedValue || !filterPools(pools).length) {
      setTrade(null);
      setError(null);
      return;
    }

    IIFE(async () => {
      setIsLoading(true);
      try {
        console.log("Pools", pools, filterPools(pools));

        const trades = await Trade.bestTradeExactIn(
          filterPools(pools),
          CurrencyAmount.fromRawAmount(
            tokenA,
            parseUnits(debouncedTypedValue, tokenA?.decimals).toString(),
          ),
          tokenB,
          { maxHops: 1 },
        );

        console.log("Trades", trades);
        if (trades.length > 0) {
          const bestTrade = trades[0];
          console.log("BEST TRADE FROM THESE TWO", bestTrade);
          setTrade(bestTrade);
          setError(null);
        } else {
          setTrade(null);
          setError(TradeError.NO_LIQUIDITY);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [pools, tokenA, tokenB, debouncedTypedValue]);

  return {
    trade: trade,
    pools: pools,
    isLoading: isLoading,
    error,
  };
}
