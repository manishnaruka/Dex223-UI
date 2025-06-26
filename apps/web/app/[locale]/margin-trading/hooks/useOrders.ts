import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Address } from "viem";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const query = gql`
  query GetOrders {
    orders {
      owner
      balance
      leverage
      collateralTokens {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      baseAssetToken {
        id
        decimals
        addressERC223
        addressERC20
        name
        symbol
      }
      collaterals
      currencyLimit
      deadline
      duration
      id
      interestRate
      liquidationRewardAmount
      liquidationRewardAsset
      liquidationRewardAssetToken {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      minLoan
    }
  }
`;

const queryOwner = gql(`
  query GetOrders($owner: String!) {
    orders(where: {owner: $owner}) {
      owner
      balance
      leverage
      collateralTokens {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      baseAssetToken {
        id
        decimals
        addressERC223
        addressERC20
        name
        symbol
      }
      collaterals
      currencyLimit
      deadline
      duration
      id
      interestRate
      liquidationRewardAmount
      liquidationRewardAsset
      liquidationRewardAssetToken {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      minLoan
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
