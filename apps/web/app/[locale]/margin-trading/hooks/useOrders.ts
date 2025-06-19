import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const query = gql`
  query MyQuery {
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

export function useOrders() {
  const apolloClient = useMarginModuleApolloClient();

  return useQuery<any, any>(query, {
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
}
