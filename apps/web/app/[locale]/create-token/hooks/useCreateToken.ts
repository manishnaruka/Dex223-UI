import { useCallback } from "react";
import { getAbiItem, parseEventLogs, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import {
  CreateTokenStatus,
  useCreateTokenStatusStore,
} from "@/app/[locale]/create-token/stores/useCreateTokenStatusStore";
import { ERC223_TOKEN_DEPLOYER_ABI } from "@/config/abis/erc2223TokenDeployer";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { ERC223_TOKEN_DEPLOYER_ADDRESS } from "@/sdk_bi/addresses";
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
  const { status, setStatus, setCreateTokenHash } = useCreateTokenStatusStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const handleCreateToken = useCallback(async () => {
    if (!walletClient || !publicClient || !accountAddress) {
      return;
    }

    setStatus(CreateTokenStatus.PENDING_CREATE_TOKEN);

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
        },
      },
      accountAddress,
    );

    if (hash) {
      setStatus(CreateTokenStatus.LOADING_CREATE_TOKEN);
      const receipt = await publicClient.waitForTransactionReceipt({ hash }); //TODO: add try catch

      const parsedEventLog = parseEventLogs({
        abi: ERC223_TOKEN_DEPLOYER_ABI,
        logs: receipt.logs,
      });

      const deployTokenLog = parsedEventLog.find((log) => log.eventName === "Deployed");

      console.log(deployTokenLog);

      if (receipt.status === "success") {
        setStatus(CreateTokenStatus.SUCCESS);
      }

      if (receipt.status === "reverted") {
        setStatus(CreateTokenStatus.ERROR_CREATE_TOKEN);
      }
    }
  }, [
    accountAddress,
    addRecentTransaction,
    chainId,
    createTokenSettings.allowMintForOwner,
    createTokenSettings.imageURL,
    createTokenSettings.name,
    createTokenSettings.symbol,
    createTokenSettings.totalSupply,
    publicClient,
    setCreateTokenHash,
    setStatus,
    walletClient,
  ]);

  return { handleCreateToken };
}
