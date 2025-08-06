import { Address, formatUnits, Hash } from "viem";

import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/types";
import { DexChainId } from "@/sdk_bi/chains";
import { Currency } from "@/sdk_bi/entities/currency";
import { NativeCoin } from "@/sdk_bi/entities/ether";
import { Token } from "@/sdk_bi/entities/token";
import { wrappedTokens } from "@/sdk_bi/entities/weth9";
import { Standard } from "@/sdk_bi/standard";

export type GqlToken = {
  addressERC20: string;
  addressERC223: string;
  decimals: string;
  id: string;
  name: string;
  symbol: string;
};

export type GqlPosition = {
  id: number;
  owner: Address;
  loanAmount: bigint;
  baseAssetToken: GqlToken;
  deadline: number;
  assetsTokens: GqlToken[];
  assets: {
    address: Address;
    balance: bigint;
    assetId: number;
  }[];

  createdAt: string;

  isClosed: boolean;
  closedAt: string;
  isLiquidated: boolean;
  liquidatedAt: string;
  order: GqlOrder;
  liquidator: Address;
  txClosed: Hash;
  txFrozen: Hash;
  txLiquidated: Hash;
};

export type GqlOrder = {
  id: number;
  owner: Address;
  leverage: number;
  minLoan: bigint;
  duration: number;
  deadline: number;

  baseAssetToken: GqlToken;
  baseAsset: Address;

  liquidationRewardAmount: bigint;
  liquidationRewardAsset: Address;
  liquidationRewardAssetToken: GqlToken;

  interestRate: number;
  currencyLimit: number;

  collaterals: Address[];
  collateralTokens: GqlToken[];
  balance: bigint;
  positions: GqlPosition[];

  whitelist: {
    allowedForTrading: Address[];
    allowedForTradingTokens: GqlToken[];
    autolisting: Address;
    id: string;
  };

  alive: boolean;
};

type BaseGqlRecentTransaction = {
  timestamp: string;
  id: Hash;
};

export type GqlRecentTransaction = {
  marginSwap: BaseGqlRecentTransaction;
  positionOpened: BaseGqlRecentTransaction;
  key:
    | "PositionDeposit"
    | "PositionWithdrawal"
    | "PositionClosed"
    | "PositionOpened"
    | "MarginSwap"
    | "PositionLiquidated";
  id: Hash;
  liquidation: BaseGqlRecentTransaction;
  positionWithdrawal: BaseGqlRecentTransaction;
  positionFrozen: BaseGqlRecentTransaction;
  positionDeposit: BaseGqlRecentTransaction;
  positionClosed: BaseGqlRecentTransaction;
};

export function gqlTokenToCurrency(gqlToken: GqlToken, chainId: DexChainId): Currency {
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

export function serializeGqlOrder(
  gqlOrder: GqlOrder,
  chainId: DexChainId,
): Omit<LendingOrder, "positions"> {
  const { positions, duration, liquidationRewardAmount, balance, minLoan, ...rest } = gqlOrder;

  return {
    ...rest,
    minLoan: BigInt(minLoan),
    liquidationRewardAmount: {
      value: BigInt(liquidationRewardAmount),
      formatted: formatUnits(
        liquidationRewardAmount,
        +gqlOrder.liquidationRewardAssetToken.decimals,
      ),
    },
    balance: BigInt(balance),
    positionDuration: duration,
    liquidationRewardAsset: gqlTokenToCurrency(gqlOrder.liquidationRewardAssetToken, chainId),
    baseAsset: gqlTokenToCurrency(gqlOrder.baseAssetToken, chainId),
    baseAssetStandard:
      gqlOrder.baseAsset.toLowerCase() === gqlOrder.baseAssetToken.addressERC20.toLowerCase()
        ? Standard.ERC20
        : Standard.ERC223,
    collateralAddresses: gqlOrder.collaterals,
    allowedTradingAddresses: gqlOrder.whitelist.allowedForTrading,
    isErc223TradingAllowed:
      gqlOrder.whitelist.allowedForTrading.length >
      gqlOrder.whitelist.allowedForTradingTokens.length,
    allowedCollateralAssets: gqlOrder.collateralTokens.map((collateralToken: GqlToken) =>
      gqlTokenToCurrency(collateralToken, chainId),
    ),
    allowedTradingAssets: gqlOrder.whitelist.allowedForTradingTokens.map((tradingToken: GqlToken) =>
      gqlTokenToCurrency(tradingToken, chainId),
    ),
    liquidationRewardAssetStandard:
      gqlOrder.liquidationRewardAsset === gqlOrder.liquidationRewardAssetToken.addressERC20
        ? Standard.ERC20
        : Standard.ERC223,
  };
}

export function serializeGqlPosition(
  gqlPosition: GqlPosition,
  chainId: DexChainId,
): Omit<MarginPosition, "order"> {
  const {
    assets,
    assetsTokens,
    baseAssetToken,
    order,
    loanAmount,
    liquidatedAt,
    createdAt,
    closedAt,
    ...rest
  } = gqlPosition;

  return {
    ...rest,
    closedAt: +closedAt,
    liquidatedAt: +liquidatedAt,
    createdAt: +createdAt,
    loanAmount: BigInt(loanAmount),
    loanAsset: gqlTokenToCurrency(baseAssetToken, chainId),
    assetAddresses: assets,
    assets: assetsTokens.map((tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId)),
    assetsWithBalances: assetsTokens.map((tradingToken: GqlToken) => ({
      asset: gqlTokenToCurrency(tradingToken, chainId),
      balance: assets.find((asset: any) => asset.address === tradingToken.addressERC20)?.balance,
    })),
  };
}

export enum MarginPositionTransactionType {
  MARGIN_SWAP,
  WITHDRAW,
  FROZEN,
  DEPOSIT,
  CLOSED,
  BORROW,
  LIQUIDATED,
}

type BaseMarginPositionFields = {
  hash: Hash;
};

export type MarginPositionRecentTransaction = BaseMarginPositionFields & {
  type: MarginPositionTransactionType;
  timestamp: string;
};

const keyToTransactionTypeMap = {
  PositionDeposit: MarginPositionTransactionType.DEPOSIT,
  PositionWithdrawal: MarginPositionTransactionType.WITHDRAW,
  PositionClosed: MarginPositionTransactionType.CLOSED,
  PositionOpened: MarginPositionTransactionType.BORROW,
  MarginSwap: MarginPositionTransactionType.MARGIN_SWAP,
  PositionLiquidated: MarginPositionTransactionType.LIQUIDATED,
  PositionFrozen: MarginPositionTransactionType.FROZEN,
};

const keyToFieldNameMap = {
  PositionDeposit: "positionDeposit",
  PositionWithdrawal: "positionWithdrawal",
  PositionClosed: "positionClosed",
  PositionOpened: "positionOpened",
  MarginSwap: "marginSwap",
  PositionLiquidated: "liquidation",
  PositionFrozen: "positionFrozen",
};

export function serializeGqlRecentTransactions(
  gqlRecentTransactions: GqlRecentTransaction[],
): MarginPositionRecentTransaction[] {
  return gqlRecentTransactions.map((gqlTransaction) => {
    const fieldName = keyToFieldNameMap[gqlTransaction.key] as keyof GqlRecentTransaction;

    const fieldArray = gqlTransaction[fieldName] as unknown as { timestamp: string }[];
    const timestamp = fieldArray[0]?.timestamp;
    return {
      type: keyToTransactionTypeMap[gqlTransaction.key],
      hash: gqlTransaction.id,
      timestamp,
    };
  });
}
