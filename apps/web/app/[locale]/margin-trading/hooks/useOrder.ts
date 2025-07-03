import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useMarginModuleApolloClient from "@/hooks/useMarginModuleApolloClient";
import { DexChainId } from "@/sdk_bi/chains";
import { Currency } from "@/sdk_bi/entities/currency";
import { NativeCoin } from "@/sdk_bi/entities/ether";
import { Token } from "@/sdk_bi/entities/token";
import { wrappedTokens } from "@/sdk_bi/entities/weth9";
import { Standard } from "@/sdk_bi/standard";

const queryAllOrders = gql`
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
      positions {
        deadline
        loanAmount
        owner
        id
      }
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
`);

const queryId = gql(`
  query GetOrders($id: Int!) {
    order(id: $id) {
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
      minLoan,
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
`);

export type MarginPosition = {
  id: number;
  owner: Address;
  loanAmount: bigint;
  loanAsset: Currency;
  deadline: number;
};

export type LendingOrder = {
  id: number;
  owner: Address;
  leverage: number;
  minLoan: bigint;
  positionDuration: number;
  deadline: number;

  liquidationRewardAmount: bigint;
  liquidationRewardAsset: Currency;
  liquidationRewardAssetStandard: Standard;

  collateralAddresses: Address[];
  allowedCollateralAssets: Currency[];
  isErc223CollateralAllowed: boolean;

  allowedTradingAssets: Currency[];
  isErc223TradingAllowed: boolean;

  interestRate: number;
  currencyLimit: number;

  balance: bigint;
  baseAsset: Currency;

  positions?: MarginPosition[];
};

type GqlToken = {
  addressERC20: string;
  addressERC223: string;
  decimals: string;
  id: string;
  name: string;
  symbol: string;
};

function gqlTokenToCurrency(gqlToken: GqlToken, chainId: DexChainId): Currency {
  if (gqlToken.addressERC20.toLowerCase() === wrappedTokens[chainId].address0.toLowerCase()) {
    return NativeCoin.onChain(chainId);
  }

  return new Token(
    chainId,
    gqlToken.addressERC20 as Address,
    gqlToken.addressERC223 as Address,
    +gqlToken.decimals,
    gqlToken.symbol,
    gqlToken.name,
    "/images/tokens/placeholder.svg",
  );
}

export function useOrder({ id }: { id: number }): {
  loading: boolean;
  order: LendingOrder | undefined;
} {
  const apolloClient = useMarginModuleApolloClient();
  const chainId = useCurrentChainId();

  const { data, loading } = useQuery<any, any>(queryId, {
    variables: {
      id,
    },
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });

  const order = useMemo(() => {
    if (!data) {
      return data;
    }

    const {
      id,
      owner,
      leverage,
      minLoan,
      duration,
      deadline,
      liquidationRewardAmount,
      interestRate,
      currencyLimit,
      balance,
    } = data.order;

    return {
      id,
      owner,
      leverage,
      minLoan,
      deadline,
      liquidationRewardAmount: BigInt(liquidationRewardAmount),
      interestRate,
      currencyLimit,
      balance: BigInt(balance),
      positionDuration: duration,
      liquidationRewardAsset: gqlTokenToCurrency(data.order.liquidationRewardAssetToken, chainId),
      baseAsset: gqlTokenToCurrency(data.order.baseAssetToken, chainId),
      collateralAddresses: data.order.collaterals,
      allowedCollateralAssets: data.order.collateralTokens.map((collateralToken: GqlToken) =>
        gqlTokenToCurrency(collateralToken, chainId),
      ),
      allowedTradingAssets: data.order.whitelist.allowedForTradingTokens.map(
        (tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId),
      ),
      liquidationRewardAssetStandard:
        data.order.liquidationRewardAsset === data.order.liquidationRewardAssetToken.addressERC20
          ? Standard.ERC20
          : Standard.ERC223,
    };
  }, [chainId, data]);

  return { loading, order };
}

export function useOrders(): {
  loading: boolean;
  orders: LendingOrder[];
} {
  const apolloClient = useMarginModuleApolloClient();
  const chainId = useCurrentChainId();

  const { data, loading } = useQuery<any, any>(queryAllOrders, {
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });

  const orders = useMemo(() => {
    if (!data) {
      return data;
    }

    return data.orders.map((order: any) => {
      const {
        id,
        owner,
        leverage,
        minLoan,
        duration,
        deadline,
        liquidationRewardAmount,
        interestRate,
        currencyLimit,
        balance,
      } = order;

      return {
        id,
        owner,
        leverage,
        minLoan,
        deadline,
        liquidationRewardAmount: BigInt(liquidationRewardAmount),
        interestRate,
        currencyLimit,
        balance: BigInt(balance),
        positionDuration: duration,
        liquidationRewardAsset: gqlTokenToCurrency(order.liquidationRewardAssetToken, chainId),
        baseAsset: gqlTokenToCurrency(order.baseAssetToken, chainId),
        collateralAddresses: order.collaterals,
        allowedCollateralAssets: order.collateralTokens.map((collateralToken: GqlToken) =>
          gqlTokenToCurrency(collateralToken, chainId),
        ),
        allowedTradingAssets: order.whitelist.allowedForTradingTokens.map(
          (tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId),
        ),
        liquidationRewardAssetStandard:
          order.liquidationRewardAsset === order.liquidationRewardAssetToken.addressERC20
            ? Standard.ERC20
            : Standard.ERC223,
      };
    });
  }, [chainId, data]);

  return { loading, orders };
}

export function useOrdersByOwner({ owner }: { owner: Address | undefined }): {
  loading: boolean;
  orders: LendingOrder[];
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

  const orders = useMemo(() => {
    if (!data) {
      return data;
    }

    return data.orders.map((order: any) => {
      const {
        owner,
        leverage,
        minLoan,
        duration,
        deadline,
        liquidationRewardAmount,
        interestRate,
        currencyLimit,
        balance,
      } = order;

      return {
        owner,
        leverage,
        minLoan,
        deadline,
        liquidationRewardAmount: BigInt(liquidationRewardAmount),
        interestRate,
        currencyLimit,
        balance: BigInt(balance),
        positionDuration: duration,
        liquidationRewardAsset: gqlTokenToCurrency(order.liquidationRewardAssetToken, chainId),
        baseAsset: gqlTokenToCurrency(order.baseAssetToken, chainId),
        collateralAddresses: order.collaterals,
        allowedCollateralAssets: order.collateralTokens.map((collateralToken: GqlToken) =>
          gqlTokenToCurrency(collateralToken, chainId),
        ),
        liquidationRewardAssetStandard:
          order.liquidationRewardAsset === order.liquidationRewardAssetToken.addressERC20
            ? Standard.ERC20
            : Standard.ERC223,
        positions: order.positions.map((position: any) => {
          return {
            id: position.id,
            owner: position.owner,
            loanAmount: position.loanAmount,
            loanAsset: gqlTokenToCurrency(order.baseAssetToken, chainId),
            deadline: position.deadline,
          };
        }),
      };
    });
  }, [chainId, data]);

  return { loading, orders };
}
