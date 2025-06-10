import { Address } from "viem";

import { AutoListing } from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import { TokenList } from "@/db/db";
import { Currency } from "@/sdk_bi/entities/currency";

export enum LendingOrderPeriodType {
  FIXED,
  PERPETUAL,
}

export enum PerpetualPeriodType {
  DAYS,
  MINUTES,
}

export enum TradingTokensInputMode {
  MANUAL,
  AUTOLISTING,
}

export enum LiquidationType {
  ANYONE,
  SPECIFIED,
}

export type LendingOrderPeriod = {
  type: LendingOrderPeriodType;
  lendingOrderDeadline: string;
  positionDuration: string;
  borrowingPeriod: {
    type: PerpetualPeriodType;
    borrowingPeriodInDays: string;
    borrowingPeriodInMinutes: string;
  };
};

export type LendingOrderPeriodErrors = {
  lendingOrderDeadline?: string;
  positionDuration?: string;
  borrowingPeriod?: {
    borrowingPeriodInDays?: string;
    borrowingPeriodInMinutes?: string;
  };
};

export type LendingOrderTradingTokens = {
  inputMode: TradingTokensInputMode;
  allowedTokens: Currency[];
  includeERC223Trading: boolean;
  tradingTokensAutoListing: AutoListing | undefined;
};

export type LiquidationMode = {
  type: LiquidationType;
  whitelistedLiquidators: Address[];
};
