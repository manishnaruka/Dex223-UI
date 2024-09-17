import { DexChainId } from "@/sdk_hybrid/chains";

import { Token } from "./token";

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const wrappedTokens: Record<DexChainId, Token> = {
  [DexChainId.SEPOLIA]: new Token(
    DexChainId.SEPOLIA,
    "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
    "0x4b113093b80700b3c6cfbcaf6c2600e99f419dc2",
    18,
    "WETH",
    "Wrapped Ether",
  ),
  [DexChainId.BSC_TESTNET]: new Token(
    97,
    "0x094616f0bdfb0b526bd735bf66eca0ad254ca81f",
    "0xf0a9AC13a76D5A6f9057dd2d0dcc6198FA959453",
    18,
    "WBNB",
    "Wrapped BNB",
  ),
};
