import { useCallback, useState } from "react";
import { getAbiItem, getContractAddress, parseEventLogs, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import {
  CreateTokenStatus,
  useCreateTokenStatusStore,
} from "@/app/[locale]/create-token/stores/useCreateTokenStatusStore";
import { useImportToken } from "@/components/manage-tokens/ImportToken";
import { ERC223_TOKEN_DEPLOYER_ABI } from "@/config/abis/erc2223TokenDeployer";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { TOKEN_CONVERTER_ABI } from "@/config/abis/tokenConverter";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { CONVERTER_ADDRESS, ERC223_TOKEN_DEPLOYER_ADDRESS } from "@/sdk_bi/addresses";
import { Standard } from "@/sdk_bi/standard";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useCreateToken(createTokenSettings: {
  name: string;
  symbol: string;
  totalSupply: string;
  imageURL: string;
  allowMintForOwner: boolean;
  createERC20: boolean;
}) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { address: accountAddress } = useAccount();
  const { status, setStatus, setCreateTokenHash, setCreateWrapperHash } =
    useCreateTokenStatusStore();
  const { addRecentTransaction } = useRecentTransactionsStore();
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const { handleImport } = useImportToken();
  const handleCreateToken = useCallback(async () => {
    if (!walletClient || !publicClient || !accountAddress) {
      return;
    }

    setStatus(CreateTokenStatus.PENDING_CREATE_TOKEN);

    try {
      const deployTokenParams = {
        abi: ERC223_TOKEN_DEPLOYER_ABI,
        address: ERC223_TOKEN_DEPLOYER_ADDRESS[chainId],
        functionName: "deployERC223Token" as const,
        args: [
          createTokenSettings.name,
          createTokenSettings.symbol,
          parseUnits(createTokenSettings.totalSupply, 18),
          createTokenSettings.imageURL,
          18,
          createTokenSettings.allowMintForOwner,
        ],
      } as const;

      const hash = await walletClient.writeContract(deployTokenParams);

      setCreateTokenHash(hash);

      const transaction = await getTransactionWithRetries({
        hash,
        publicClient,
      });

      const nonce = transaction.nonce;

      const factoryNonce = await publicClient.getTransactionCount({
        address: ERC223_TOKEN_DEPLOYER_ADDRESS[chainId],
        blockTag: "latest",
      });

      const futureAddress = getContractAddress({
        from: ERC223_TOKEN_DEPLOYER_ADDRESS[chainId],
        nonce: BigInt(factoryNonce),
      });

      addRecentTransaction(
        {
          hash,
          nonce,
          chainId,
          gas: {
            model: GasFeeModel.EIP1559,
            gas: "0",
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          },
          params: {
            ...stringifyObject(deployTokenParams),
            abi: [
              getAbiItem({
                name: deployTokenParams.functionName,
                abi: ERC223_TOKEN_DEPLOYER_ABI,
              }),
            ],
          },
          title: {
            template: RecentTransactionTitleTemplate.DEPLOY_TOKEN,
            symbol: createTokenSettings.symbol!,
            amount: createTokenSettings.totalSupply,
            logoURI: createTokenSettings.imageURL || "/images/tokens/placeholder.svg",
            standard: Standard.ERC223,
            address: futureAddress,
            chainId: chainId,
          },
        },
        accountAddress,
      );

      if (hash) {
        setStatus(CreateTokenStatus.LOADING_CREATE_TOKEN);
        const deployReceipt = await publicClient.waitForTransactionReceipt({ hash }); //TODO: add try catch

        const parsedEventLog = parseEventLogs({
          abi: ERC223_TOKEN_DEPLOYER_ABI,
          logs: deployReceipt.logs,
        });

        const deployTokenLog = parsedEventLog.find((log) => log.eventName === "Deployed");

        console.log(deployTokenLog);
        if (deployTokenLog) {
          setTokenAddress(deployTokenLog.args.token);
          try {
            handleImport(deployTokenLog.args.token, chainId);
          } catch (e) {
            console.log(e);
            console.log("Failed to import token to user custom tokenlist");
          }

          if (!createTokenSettings.createERC20) {
            if (deployReceipt.status === "success") {
              setStatus(CreateTokenStatus.SUCCESS);
            }

            if (deployReceipt.status === "reverted") {
              setStatus(CreateTokenStatus.ERROR_CREATE_TOKEN);
            }
          } else {
            try {
              setStatus(CreateTokenStatus.PENDING_CREATE_WRAPPER);

              const deployTokenParams = {
                abi: TOKEN_CONVERTER_ABI,
                address: CONVERTER_ADDRESS[chainId],
                functionName: "createERC20Wrapper" as const,
                args: [deployTokenLog.args.token],
              } as const;

              const wrapperHash = await walletClient.writeContract(deployTokenParams);

              setCreateWrapperHash(wrapperHash);

              setStatus(CreateTokenStatus.LOADING_CREATE_WRAPPER);
              const receipt = await publicClient.waitForTransactionReceipt({ hash: wrapperHash });

              if (receipt.status === "success") {
                setStatus(CreateTokenStatus.SUCCESS);
              }

              if (receipt.status === "reverted") {
                setStatus(CreateTokenStatus.ERROR_CREATE_WRAPPER);
              }
            } catch (error) {
              setStatus(CreateTokenStatus.ERROR_CREATE_WRAPPER);
            }
          }
        }
      }
    } catch (e) {
      setStatus(CreateTokenStatus.ERROR_CREATE_TOKEN);
    }
  }, [
    accountAddress,
    addRecentTransaction,
    chainId,
    createTokenSettings.allowMintForOwner,
    createTokenSettings.createERC20,
    createTokenSettings.imageURL,
    createTokenSettings.name,
    createTokenSettings.symbol,
    createTokenSettings.totalSupply,
    publicClient,
    setCreateTokenHash,
    setCreateWrapperHash,
    setStatus,
    walletClient,
  ]);

  return { handleCreateToken, tokenAddress, setTokenAddress };
}
