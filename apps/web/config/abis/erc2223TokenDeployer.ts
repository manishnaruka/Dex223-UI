export const ERC223_TOKEN_DEPLOYER_ABI = [
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "token", type: "address" }],
    name: "Deployed",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_symbol", type: "string" },
      { internalType: "uint256", name: "_initialSupply", type: "uint256" },
      { internalType: "string", name: "_imageURL", type: "string" },
      { internalType: "uint8", name: "_decimals", type: "uint8" },
      { internalType: "bool", name: "_mintable", type: "bool" },
    ],
    name: "deployERC223Token",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
