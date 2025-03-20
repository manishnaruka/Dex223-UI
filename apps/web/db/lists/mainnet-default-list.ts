export const mainnetDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 1,
  },
  logoURI: "/token-list-placeholder.svg",
  name: "DEX223 ETH Default",
  tokens: [
    {
      address0: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // ERC-20
      address1: "0xB8f0a8FCCB9F1d3d287A35643E93b8A7ee5E6980", // ERC-223
      name: "Tether USD",
      logoURI: "/images/tokens/USDT.svg",
      chainId: 1,
      decimals: 6,
      symbol: "USDT",
    },
    {
      address0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // ERC-20
      address1: "0xdc87CFa91A4D1A2CF0F74B8ebCE2c7FB1C00BD5e", // ERC-223
      name: "USD Coin",
      logoURI: "/images/tokens/USDC.svg",
      chainId: 1,
      decimals: 6,
      symbol: "USDC",
    },
  ],
};
