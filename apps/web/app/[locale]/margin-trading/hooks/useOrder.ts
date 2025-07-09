import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { GqlToken, gqlTokenToCurrency } from "@/app/[locale]/margin-trading/hooks/helpers";
import { SortingType } from "@/components/buttons/IconButton";
import daysToSeconds from "@/functions/daysToSeconds";
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
  query GetOrders($orderBy: String, $orderDirection: String, $where: Order_filter) {
    orders(orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
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
  assets: any;
  allowedForTradingTokens: Currency[];
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

export function useOrders({
  sortingDirection,
  orderBy,
  leverage_lte,
  currencyLimit_lte,
  duration_lte,
  duration_gte,
  interestRate_lte,
}: {
  sortingDirection: SortingType;
  orderBy: string;
  leverage_lte: string;
  currencyLimit_lte?: string;
  duration_lte?: string;
  duration_gte?: string;
  interestRate_lte?: string;
}): {
  loading: boolean;
  orders: LendingOrder[];
} {
  const apolloClient = useMarginModuleApolloClient();
  const chainId = useCurrentChainId();

  const where = useMemo(() => {
    const f: Record<string, number> = {};

    // helper to turn "" or undefined into undefined, else +string
    const toNum = (raw?: string) => {
      if (!raw || raw.trim() === "") return undefined;
      const n = Number(raw);
      return isNaN(n) ? undefined : n;
    };

    const lev = toNum(leverage_lte);
    if (lev != null) f.leverage_lte = lev;

    const curLim = toNum(currencyLimit_lte);
    if (curLim != null) f.currencyLimit_lte = curLim;

    const durL = toNum(duration_lte);
    if (durL != null) f.duration_lte = daysToSeconds(durL);

    const durG = toNum(duration_gte);
    if (durG != null) f.duration_gte = daysToSeconds(durG);

    const ir = toNum(interestRate_lte);
    if (ir != null) f.interestRate_lte = ir;

    return f;
  }, [leverage_lte, currencyLimit_lte, duration_lte, duration_gte, interestRate_lte]);

  const { data, loading } = useQuery<any, any>(queryAllOrders, {
    variables: {
      orderBy: sortingDirection !== SortingType.NONE ? orderBy : undefined,
      orderDirection: sortingDirection !== SortingType.NONE ? sortingDirection : undefined,
      where,
    },
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
