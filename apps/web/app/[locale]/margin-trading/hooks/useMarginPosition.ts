import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { GqlToken, gqlTokenToCurrency } from "@/app/[locale]/margin-trading/hooks/helpers";
import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const queryOwner = gql(`
  query GetPositions($owner: String!) {
    positions(where: {owner: $owner}) {
      owner
      loanAmount
      deadline
      assets
      id
      order {
        whitelist {
          allowedForTradingTokens {
            addressERC20
            addressERC223
            decimals
            id
            name
            symbol
          }
        }
      }
    }
  }
`);

export function usePositionsByOwner({ owner }: { owner: Address | undefined }): {
  loading: boolean;
  positions: MarginPosition[];
} {
  const apolloClient = useMarginModuleApolloClient();
  const chainId = useCurrentChainId();

  const { data, loading } = useQuery<any, any>(queryOwner, {
    variables: {
      owner,
    },
    skip: !apolloClient || !owner,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });

  const positions = useMemo(() => {
    if (!data) {
      return data;
    }

    return data.positions.map((position: any) => {
      const { owner, loanAmount, deadline, assets, id, order } = position;

      return {
        owner,
        deadline,
        loanAmount,
        assets,
        id,
        allowedForTradingTokens: order.whitelist.allowedForTradingTokens.map(
          (tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId),
        ),
      };
    });
  }, [chainId, data]);

  return { loading, positions };
}
