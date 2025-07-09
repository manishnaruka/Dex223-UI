import { Address } from "viem";

import { DexChainId } from "@/sdk_bi/chains";
import { Currency } from "@/sdk_bi/entities/currency";
import { NativeCoin } from "@/sdk_bi/entities/ether";
import { Token } from "@/sdk_bi/entities/token";
import { wrappedTokens } from "@/sdk_bi/entities/weth9";

export type GqlToken = {
  addressERC20: string;
  addressERC223: string;
  decimals: string;
  id: string;
  name: string;
  symbol: string;
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
