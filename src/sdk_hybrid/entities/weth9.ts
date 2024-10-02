import { DexChainId } from "@/sdk_hybrid/chains";

import { Token } from "./token";

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const wrappedTokens: Record<DexChainId, Token> = {
  [DexChainId.SEPOLIA]: new Token(
    DexChainId.SEPOLIA,
    "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    "0x6dB85a3187c3a606913D26e651E1f932A44C4f0D",
    18,
    "WETH",
    "Wrapped Ether",
  ),
  [DexChainId.BSC_TESTNET]: new Token(
    97,
    "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    "0xe76C629580279b9B3972643AB4444EdC0F292DC4",
    18,
    "WBNB",
    "Wrapped BNB",
  ),
};
