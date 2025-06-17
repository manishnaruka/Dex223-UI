import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const query = gql`
  query GetOrderById($id: Int!) {
    order(id: $id) {
      leverage
      owner
      currencyLimit
      baseAsset
      balance
      whitelist
      minLoan
      interestRate
      id
      duration
    }
  }
`;

export function useOrderById(id: number) {
  const apolloClient = useMarginModuleApolloClient();

  return useQuery<any, any>(query, {
    variables: {
      id,
    },
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
}
