import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { GqlToken, gqlTokenToCurrency } from "@/app/[locale]/margin-trading/hooks/helpers";
import { MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
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
      assets {
        address
        balance
        id
      }
      assetsTokens {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      id
      createdAt
      order {
        id
        baseAssetToken {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
        currencyLimit
        whitelist {
          allowedForTrading
          allowedForTradingTokens {
            addressERC20
            addressERC223
            decimals
            id
            name
            symbol
          }
        }
        liquidationRewardAssetToken {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
        liquidationRewardAmount
      }
    }
  }
`);

const queryById = gql(`
  query GetPosition($id: ID!) {
    position(id: $id) {
      owner
      loanAmount
      deadline
      assets {
        address
        balance
        id
      }
      assetsTokens {
        addressERC20
        addressERC223
        decimals
        id
        name
        symbol
      }
      id
      createdAt
      order {
        id
        baseAssetToken {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
        currencyLimit
        whitelist {
          allowedForTrading
          allowedForTradingTokens {
            addressERC20
            addressERC223
            decimals
            id
            name
            symbol
          }
        }
        liquidationRewardAssetToken {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
        liquidationRewardAmount
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
      console.log(position);
      const { createdAt, owner, loanAmount, deadline, assets, assetsTokens, id, order } = position;

      return {
        owner,
        deadline,
        loanAsset: gqlTokenToCurrency(order.baseAssetToken, chainId),
        loanAmount,
        assetAddresses: assets,
        assets: assetsTokens.map((tradingToken: GqlToken) =>
          gqlTokenToCurrency(tradingToken, chainId),
        ),
        isAllowedErc223Trading:
          order.whitelist.allowedForTrading.length !==
          order.whitelist.allowedForTradingTokens.length,
        id,
        allowedForTradingAddresses: order.whitelist.allowedForTrading,
        allowedForTradingTokens: order.whitelist.allowedForTradingTokens.map(
          (tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId),
        ),
        currencyLimit: order.currencyLimit,
        createdAt,
        liquidationRewardAmount: BigInt(order.liquidationRewardAmount),
        liquidationRewardAsset: gqlTokenToCurrency(order.liquidationRewardAssetToken, chainId),
      };
    });
  }, [chainId, data]);

  return { loading, positions };
}

export default function useMarginPositionById({ id }: { id: string }): {
  loading: boolean;
  position: MarginPosition;
} {
  const apolloClient = useMarginModuleApolloClient();
  const chainId = useCurrentChainId();

  const { data, loading } = useQuery<any, any>(queryById, {
    variables: {
      id,
    },
    skip: !apolloClient || !id,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });

  const position = useMemo(() => {
    if (!data) {
      return data;
    }

    const { createdAt, owner, loanAmount, deadline, assets, assetsTokens, id, order } =
      data.position;

    return {
      owner,
      deadline,
      loanAmount,
      loanAsset: gqlTokenToCurrency(order.baseAssetToken, chainId),
      assetAddresses: assets,
      assets: assetsTokens.map((tradingToken: GqlToken) =>
        gqlTokenToCurrency(tradingToken, chainId),
      ),
      isAllowedErc223Trading:
        order.whitelist.allowedForTrading.length !== order.whitelist.allowedForTradingTokens.length,
      id,
      allowedForTradingAddresses: order.whitelist.allowedForTrading,
      allowedForTradingTokens: order.whitelist.allowedForTradingTokens.map(
        (tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId),
      ),
      currencyLimit: order.currencyLimit,
      orderId: order.id,
      createdAt,
      liquidationRewardAmount: BigInt(order.liquidationRewardAmount),
      liquidationRewardAsset: gqlTokenToCurrency(order.liquidationRewardAssetToken, chainId),
    };
  }, [chainId, data]);

  return { loading, position };
}
