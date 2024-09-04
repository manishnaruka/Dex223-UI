import { multicall } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";

import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { config } from "@/config/wagmi/config";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokens } from "@/hooks/useTokenLists";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { Token } from "@/sdk_hybrid/entities/token";

import { useActiveAddresses } from "./hooks";
import { useWalletsDeposites, WalletDeposites } from "./useWalletsDeposites";

const getWalletDeposites = async (
  walletAddress: Address,
  tokens: Token[],
  contractAddresses: Address[],
) => {
  const calls = contractAddresses.reduce((acc, contractAddress) => {
    const contractCalls = tokens.map(({ address1 }) => ({
      address: contractAddress,
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "depositedTokens",
      args: [walletAddress, address1],
    }));

    return [...acc, ...contractCalls];
  }, [] as any[]);

  const result = await multicall(config, {
    contracts: calls,
  });

  const deposites = tokens
    .reduce(
      (acc, token, tokenIndex) => {
        if (!result?.length) return acc;

        const contractDeposites = contractAddresses.reduce(
          (acc, contractAddress, contractIndex) => {
            const index = tokenIndex + tokens.length * contractIndex;
            const deposite = {
              token,
              contractAddress,
              value:
                result[index].status === "success" ? (result[index].result as bigint) : BigInt(0),
            };

            return [...acc, deposite];
          },
          [] as WalletDeposites["deposites"],
        );

        return [...acc, ...contractDeposites];
      },
      [] as WalletDeposites["deposites"],
    )
    .filter(({ value }) => value > BigInt(0));

  const walletDeposites: WalletDeposites = {
    address: walletAddress,
    deposites,
  };

  return walletDeposites;
};

export const useActiveWalletsDeposites = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { activeAddresses } = useActiveAddresses();
  const tokens = useTokens();
  const { deposites, setAllDeposites } = useWalletsDeposites();
  const chainId = useCurrentChainId();

  const contractAddresses: Address[] = useMemo(() => {
    return [NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId]];
  }, [chainId]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const walletsDeposites = await Promise.all(
        activeAddresses.map((address) => {
          return getWalletDeposites(address, tokens, contractAddresses);
        }),
      );
      setAllDeposites(walletsDeposites);
      setIsLoading(false);
    })();
  }, [tokens, activeAddresses, setAllDeposites, contractAddresses]);

  return { isLoading, deposites };
};
