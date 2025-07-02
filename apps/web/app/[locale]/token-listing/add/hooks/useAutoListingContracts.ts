import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { Address } from "viem";

import { AutoListing } from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import useAutoListingApolloClient from "@/hooks/useAutoListingApolloClient";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_bi/chains";
import { Token } from "@/sdk_bi/entities/token";

const AUTOLISTING_BLACKLIST = [
  "0x6a5ff6c7b1ea8e9b9e40da3b162468b61e40584f",
  "0x39491101f7d46E9f0c3217D2eB91C016F761aD59",
  "0x50eefb898f8209173ab7e812794a103c1793dc58",
  "0xb568e95591175d61345a8daef225483c120d01c4",
  "0x0dc218cf5b88dd7add4a0d1b7ba4343884bad6df",
  "0xF2A975e0Af1F9D39b4E7CA45b84EbD8b5B67756F",
  "0x250D7Ed2D4daD78bACDafA8B4C2b6298323a86bB",
  "0x163168354cE9BDcE073850B85CC6306d715474B4",
  "0x45DCb59D97809955192EFE86D5c5ba9a6ad3baC2",
  "0x13ddc6460c705d29d37b18a906c7fe69fa9e711d",
  "0xbfbd1a95e551ba8de2dc1c84843d9df5c52619a3",
  "0xf851ffe03478f0bfebd4337287f315350cc311c2",
];

const query = gql(`
  query AutoListings($first: Int!, $blacklist: [String!]) {
    autoListings(first: $first, where: {id_not_in: $blacklist}) {
      id
      owner
      name
      url
      totalTokens
      lastUpdated
      pricesDetail {
        id
        feeTokenAddress {
          id
          name
          symbol
          address
          decimals
          inConverter
        }
        price
      }
      tokens {
        token {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
      }
    }
  }
`);

type GqlToken = {
  addressERC20: Address;
  addressERC223: Address;
  decimals: string;
  symbol: string;
  name: string;
};

type GqlFeeToken = {
  address: Address;
  decimals: string;
  symbol: string;
  name: string;
};

type GqlAutoListing = {
  id: Address;
  owner: Address;
  name: string;
  lastUpdated: string;
  totalTokens: string;
  tokens: Array<{ token: GqlToken }>;
  pricesDetail: Array<{ feeTokenAddress: GqlFeeToken; price: string }>;
};

function serializeAutoListing(gqlAutoListing: GqlAutoListing, chainId: DexChainId): AutoListing {
  return {
    id: gqlAutoListing.id,
    name: gqlAutoListing.name,
    tokens: gqlAutoListing.tokens.map(({ token }) => {
      return new Token(
        chainId,
        token.addressERC20,
        token.addressERC223,
        +token.decimals,
        token.symbol,
        token.name,
        "/images/tokens/placeholder.svg",
      );
    }),
    totalTokens: +gqlAutoListing.totalTokens,
    lastUpdated: gqlAutoListing.lastUpdated,
    tokensToPay: gqlAutoListing.pricesDetail.map(({ feeTokenAddress, price }) => {
      return {
        token: {
          symbol: feeTokenAddress.symbol,
          name: feeTokenAddress.name,
          address: feeTokenAddress.address,
          chainId,
          decimals: +feeTokenAddress.decimals,
        },
        price: BigInt(price),
      };
    }),
    isFree: !Boolean(gqlAutoListing.pricesDetail.length),
  };
}

export default function useAutoListingContracts(): AutoListing[] | undefined {
  const chainId = useCurrentChainId();
  const client = useAutoListingApolloClient();
  const autoListings = useQuery(query, {
    client,
    variables: {
      first: 10,
      blacklist: AUTOLISTING_BLACKLIST.map((v) => v.toLowerCase()),
    },
  });

  return useMemo(() => {
    return autoListings.data?.autoListings.map((autoListing: GqlAutoListing) =>
      serializeAutoListing(autoListing, chainId),
    );
  }, [autoListings.data?.autoListings, chainId]);
}

export function useAutoListingContract(address: Address | undefined): AutoListing | undefined {
  const listings = useAutoListingContracts();

  if (!address) {
    return;
  }

  return listings?.find((listing) => listing.id.toLowerCase() === address.toLowerCase());
}
