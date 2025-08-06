import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";

import {
  MarginPositionRecentTransaction,
  serializeGqlOrder,
  serializeGqlPosition,
  serializeGqlRecentTransactions,
} from "@/app/[locale]/margin-trading/hooks/helpers";
import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";

const queryById = gql(`
  query GetPosition($id: ID!) {
    position(id: $id) {
      transactions(orderBy: timestamp) {
        marginSwap {
          timestamp
          id
        }
        positionOpened {
          timestamp
          id
        }
        key
        id
        liquidation {
          timestamp
          id
        }
        positionWithdrawal {
          id
          timestamp
        }
        positionFrozen {
          id
          timestamp
        }
        positionDeposit {
          id
          timestamp
        }
        positionClosed {
          id
          timestamp
        }
      }
    }
  }
`);

export default function useMarginPositionRecentTransactionsById({ id }: { id: string }): {
  loading: boolean;
  recentTransactions: MarginPositionRecentTransaction[];
} {
  const apolloClient = useMarginModuleApolloClient();
  // const chainId = useCurrentChainId();

  const { data, loading } = useQuery<any, any>(queryById, {
    variables: {
      id,
    },
    skip: !apolloClient || !id,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });

  console.log(data);
  const recentTransactions = useMemo(() => {
    if (!data) {
      return data;
    }

    return serializeGqlRecentTransactions(data.position.transactions);
  }, [data]);

  return { loading, recentTransactions };
}
