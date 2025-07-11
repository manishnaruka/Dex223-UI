export const ORACLE_ABI = [
  {
    inputs: [{ internalType: "address", name: "_factory", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "contract IUniswapV3Factory", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "feeTiers",
    outputs: [{ internalType: "uint24", name: "", type: "uint24" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
    ],
    name: "findPoolWithHighestLiquidity",
    outputs: [
      { internalType: "address", name: "poolAddress", type: "address" },
      { internalType: "uint128", name: "liquidity", type: "uint128" },
      { internalType: "uint24", name: "fee", type: "uint24" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset1", type: "address" },
      { internalType: "address", name: "asset2", type: "address" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
    ],
    name: "getAmountOut",
    outputs: [{ internalType: "uint256", name: "amountForBuy", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
