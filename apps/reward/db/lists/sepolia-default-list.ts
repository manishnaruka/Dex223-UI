import { Token } from "@/sdk_bi/entities/token";

export const sepoliaDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 9,
  },
  logoURI: "/images/token-list-placeholder.svg",
  name: "DEX223 Sepolia Default",
  tokens: [
    new Token(
      11155111,
      "0x51a3F4b5fFA9125Da78b55ed201eFD92401604fa",
      "0xe029f17CFf7eb6414239Cb0B72fDd57651cF0Cae",
      18,
      "TOT1",
      "Total Test 1",
      "/images/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x30C7A2261Ad72ad12393B075163Bf9a72a2dA4f8",
      "0x8C72FB1F48e7Ccc9231c9aFDCE1d67406E235426",
      6,
      "TOT2",
      "Total Test 2",
      "/images/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x18B32000CEaAe9BE1cec1cb6845EF7bba1c9DC02",
      "0x71b3852D32741dfc4d25af168885f2e5864d5370",
      10,
      "TOT3",
      "Total Test 3",
      "/images/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0xa083e42B1525c67A90Cb1628acBC99895dC0447B",
      "0x5E88Aa8f7b06Ec7b526B1E9B8B5FEAE149990a62",
      0,
      "TOT4Z",
      "Total Test 4Z",
      "/images/tokens/placeholder.svg",
    ),
  ],
};
