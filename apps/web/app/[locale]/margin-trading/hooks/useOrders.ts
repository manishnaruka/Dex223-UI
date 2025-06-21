import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Address } from "viem";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const query = gql`
  query GetOrders {
    orders {
      minLoan
      id
      leverage
      baseAssetToken {
        address
        decimals
        id
        name
        symbol
      }
    }
  }
`;

const queryOwner = gql(`
  query GetOrders($owner: String!) {
    orders(where: {owner: $owner}) {
      id
      duration
      currencyLimit
      createdAt
      interestRate
      leverage
      minLoan
      baseAssetToken {
        address
        decimals
        id
        name
        symbol
      }
      baseAsset
      balance
    }
  }
`);

export function useOrders() {
  const apolloClient = useMarginModuleApolloClient();

  return useQuery<any, any>(query, {
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
}

export function useOrdersByOwner({ owner }: { owner: Address | undefined }) {
  const apolloClient = useMarginModuleApolloClient();

  return useQuery<any, any>(queryOwner, {
    variables: {
      owner,
    },
    skip: !apolloClient || !owner,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
}
