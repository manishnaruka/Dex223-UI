import { multicall } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";

import { useRefreshDepositsDataStore } from "@/app/[locale]/portfolio/components/stores/useRefreshTableStore";
import { ERC20_ABI } from "@/config/abis/erc20";
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

  const approveCalls = contractAddresses.reduce((acc, contractAddress) => {
    const contractCalls = tokens.map(({ address0 }) => ({
      address: address0 as Address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [walletAddress, contractAddress],
      query: {
        //make sure hook don't run when there is no addresses
        enabled: Boolean(address0) && Boolean(walletAddress) && Boolean(contractAddress),
      },
    }));
    return [...acc, ...contractCalls];
  }, [] as any[]);

  const approveResult = await multicall(config, {
    contracts: approveCalls,
  });

  const deposites: WalletDeposites["deposites"] = [];

  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const token = tokens[tokenIndex];

    // Early exit if both result and approveResult are empty
    if (result?.length === 0 && approveResult?.length === 0) {
      break;
    }

    for (let contractIndex = 0; contractIndex < contractAddresses.length; contractIndex++) {
      const contractAddress = contractAddresses[contractIndex];
      const index = tokenIndex + tokens.length * contractIndex;
      const deposite = {
        token,
        contractAddress,
        deposited:
          result[index].status === "success" ? (result[index].result as bigint) : BigInt(0),
        approved:
          approveResult[index].status === "success"
            ? (approveResult[index].result as bigint)
            : BigInt(0),
      };

      if (deposite.deposited > BigInt(0) || deposite.approved > BigInt(0)) {
        deposites.push(deposite);
      }
    }
  }

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
  const { refreshDepositsTrigger, setRefreshDepositsTrigger } = useRefreshDepositsDataStore();

  const contractAddresses: Address[] = useMemo(() => {
    return [NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId]];
  }, [chainId]);

  useEffect(() => {
    if (!tokens.length) return;
    (async () => {
      setIsLoading(true);
      const result = await Promise.all(
        activeAddresses.map((address) => {
          return getWalletDeposites(
            address,
            tokens.map((token) => token.wrapped),
            contractAddresses,
          );
        }),
      );
      setAllDeposites(result);
      setIsLoading(false);
      setRefreshDepositsTrigger(false);
    })();
  }, [
    tokens,
    activeAddresses,
    setAllDeposites,
    contractAddresses,
    refreshDepositsTrigger,
    setRefreshDepositsTrigger,
  ]);

  return { isLoading, deposites };
};
