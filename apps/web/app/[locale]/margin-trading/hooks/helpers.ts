import { Address, formatUnits } from "viem";

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

  createdAt: number;

  isClosed: boolean;
  closedAt: number;
  isLiquidated: boolean;
  liquidatedAt: number;
  order: GqlOrder;
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
  const { positions, duration, liquidationRewardAmount, balance, ...rest } = gqlOrder;

  return {
    ...rest,
    liquidationRewardAmount: {
      value: BigInt(liquidationRewardAmount),
      formatted: formatUnits(liquidationRewardAmount, +gqlOrder.baseAssetToken.decimals),
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
    isErc223TradingAllowed: false,
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
  const { assets, assetsTokens, baseAssetToken, order, ...rest } = gqlPosition;

  return {
    ...rest,
    loanAsset: gqlTokenToCurrency(baseAssetToken, chainId),
    assetAddresses: assets,
    assets: assetsTokens.map((tradingToken: GqlToken) => gqlTokenToCurrency(tradingToken, chainId)),
    assetsWithBalances: assetsTokens.map((tradingToken: GqlToken) => ({
      asset: gqlTokenToCurrency(tradingToken, chainId),
      balance: assets.find((asset: any) => asset.address === tradingToken.addressERC20)?.balance,
    })),
  };
}
