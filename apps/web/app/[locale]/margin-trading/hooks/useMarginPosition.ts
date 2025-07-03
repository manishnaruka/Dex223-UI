import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { ZERO_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";
import { Standard } from "@/sdk_bi/standard";

const queryOwner = gql(`
  query GetPositions($owner: String!) {
    positions(where: {owner: $owner}) {
      owner
      loanAmount
      deadline
      assets
      id
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
      owner: ZERO_ADDRESS,
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
      const { owner, loanAmount, deadline, assets, id } = position;

      return {
        owner,
        deadline,
        loanAmount,
        assets,
        id,
      };
    });
  }, [data]);

  return { loading, positions };
}
