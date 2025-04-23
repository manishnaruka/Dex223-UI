import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Address } from "viem";
import { readContracts } from "wagmi/actions";

import { POOL_STATE_ABI } from "@/config/abis/poolState";
import { config } from "@/config/wagmi/config";
import { apolloClient } from "@/graphql/thegraph/apollo";
import { FeeAmount } from "@/sdk_bi/constants";
import { Currency } from "@/sdk_bi/entities/currency";
import { Pool } from "@/sdk_bi/entities/pool";
import { Tick } from "@/sdk_bi/entities/tick";

const POOL_QUERY = gql`
  query PoolsTicks($addresses: [ID!]) {
    pools(where: { id_in: $addresses }) {
      id
      ticks {
        tickIdx
        liquidityGross
        liquidityNet
      }
    }
  }
`;
export const useFetchPoolData = (chainId: number) => {
  const [triggerQuery, { data, error }] = useLazyQuery(POOL_QUERY, {
    client: apolloClient(chainId),
    fetchPolicy: "network-only", // Always fresh
  });

  return async (
    key: string,
    address: Address,
    token0: Currency,
    token1: Currency,
    tier: FeeAmount,
  ) => {
    try {
      // Step 1: Query GraphQL for ticks
      await triggerQuery({ variables: { addresses: [address.toLowerCase()] } });

      const poolGqlData = data?.pools?.[0];
      if (!poolGqlData) {
        // Pool does not exist in the subgraph
        return null;
      }

      const ticks = poolGqlData.ticks
        .map(
          (_tick: any) =>
            new Tick({
              index: _tick.tickIdx,
              liquidityGross: _tick.liquidityGross,
              liquidityNet: _tick.liquidityNet,
            }),
        )
        .sort((a, b) => a.index - b.index);

      // Step 2: Read from contracts via wagmi
      const [slot0Result, liquidityResult] = await readContracts(config, {
        contracts: [
          { address, abi: POOL_STATE_ABI, functionName: "slot0" },
          { address, abi: POOL_STATE_ABI, functionName: "liquidity" },
        ],
        allowFailure: false,
      });

      const [sqrtPriceX96, tick] = slot0Result as [bigint, number];
      const liquidity = liquidityResult as bigint;

      if (!sqrtPriceX96 || sqrtPriceX96 === BigInt(0)) {
        // Pool invalid on-chain
        return null;
      }

      return new Pool(
        token0,
        token1,
        tier,
        sqrtPriceX96.toString(),
        liquidity.toString(),
        tick,
        ticks,
      );
    } catch (err: any) {
      console.error("Error fetching pool data:", err);
      throw new Error(err.message || "Unknown error");
    }
  };
};
