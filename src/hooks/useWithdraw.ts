import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits, getAbiItem } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import {
  useWithdrawGasLimitStore,
  useWithdrawGasSettings,
} from "@/app/[locale]/add/stores/useRevokeGasSettings";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
// import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import useDeepEffect from "@/hooks/useDeepEffect";
import addToast from "@/other/toast";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

import { AllowanceStatus } from "./useAllowance";
import useCurrentChainId from "./useCurrentChainId";

const useWithdrawParams = ({
  token,
  contractAddress,
  amountToWithdraw,
}: {
  token: Currency | undefined;
  contractAddress: Address | undefined;
  amountToWithdraw: bigint;
}) => {
  const { address } = useAccount();

  return useMemo(() => {
    if (!contractAddress || !token || !address || !(amountToWithdraw >= 0)) return {};

    const params = {
      account: address as Address,
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "withdraw" as "withdraw",
      address: contractAddress,
      args: [token.wrapped.address1 as Address, address as Address, amountToWithdraw] as [
        Address,
        Address,
        bigint,
      ],
    };

    return { params };
  }, [token, address, contractAddress, amountToWithdraw]);
};

const WITHDRAW_DEFAULT_GAS_LIMIT = BigInt(50000);
export function useWithdrawEstimatedGas({
  token,
  contractAddress,
}: {
  token: Currency | undefined;
  contractAddress: Address | undefined;
}) {
  const { setEstimatedGas } = useWithdrawGasLimitStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { params } = useWithdrawParams({ token, contractAddress, amountToWithdraw: BigInt(0) });

  useDeepEffect(() => {
    IIFE(async () => {
      if (!params || !address) {
        setEstimatedGas(WITHDRAW_DEFAULT_GAS_LIMIT);
        console.log("Can't estimate gas");
        return;
      }

      try {
        const estimated = await publicClient?.estimateContractGas(params as any);

        if (estimated) {
          setEstimatedGas(estimated + BigInt(10000));
        } else {
          setEstimatedGas(WITHDRAW_DEFAULT_GAS_LIMIT);
        }
      } catch (e) {
        console.error(e);
        setEstimatedGas(WITHDRAW_DEFAULT_GAS_LIMIT);
      }
    });
  }, [publicClient, address, params]);
}

export default function useWithdraw({
  token,
  contractAddress,
}: {
  token: Currency | undefined;
  contractAddress: Address | undefined;
}) {
  const [status, setStatus] = useState(AllowanceStatus.INITIAL);

  const { address } = useAccount();
  const chainId = useCurrentChainId();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const currentDeposit = useReadContract({
    address: contractAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "depositedTokens",
    args: address && token && [address, token.wrapped.address1 as Address],
    query: {
      enabled: Boolean(address) && token?.isToken && Boolean(token?.address1),
    },
  });
  const amountToWithdraw = currentDeposit.data as bigint;

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    currentDeposit.refetch();
  }, [currentDeposit, blockNumber]);

  const { gasSettings, customGasLimit, gasModel } = useWithdrawGasSettings();
  const { params } = useWithdrawParams({ token, contractAddress, amountToWithdraw });

  const writeTokenWithdraw = useCallback(
    async (customAmount?: bigint) => {
      if (
        !amountToWithdraw ||
        !contractAddress ||
        !token ||
        !walletClient ||
        !address ||
        !chainId ||
        !publicClient ||
        !token.isToken
      ) {
        return;
      }

      setStatus(AllowanceStatus.PENDING);

      if (!token || !params) return;
      const amount = customAmount || amountToWithdraw;
      try {
        const estimatedGas = await publicClient.estimateContractGas(params);
        const gasToUse = customGasLimit ? customGasLimit : estimatedGas + BigInt(10000); // set custom gas here if user changed it

        const { request } = await publicClient.simulateContract({
          ...params,
          ...gasSettings,
          gas: gasToUse,
        });

        const hash = await walletClient.writeContract(request);

        const transaction = await publicClient.getTransaction({
          hash,
        });

        const nonce = transaction.nonce;

        addRecentTransaction(
          {
            hash,
            nonce,
            chainId,
            gas: {
              ...stringifyObject({ ...gasSettings, model: gasModel }),
              gas: gasToUse.toString(),
            },
            params: {
              ...stringifyObject(params),
              abi: [getAbiItem({ name: "withdraw", abi: NONFUNGIBLE_POSITION_MANAGER_ABI })],
            },
            title: {
              symbol: token.symbol!,
              template: RecentTransactionTitleTemplate.WITHDRAW,
              amount: formatUnits(amount, token.decimals),
              logoURI: token?.logoURI || "/tokens/placeholder.svg",
            },
          },
          address,
        );

        if (hash) {
          setStatus(AllowanceStatus.LOADING);
          await publicClient.waitForTransactionReceipt({ hash });
          setStatus(AllowanceStatus.SUCCESS);
        }
      } catch (e) {
        console.log(e);
        setStatus(AllowanceStatus.INITIAL);
        addToast("Unexpected error, please contact support", "error");
      }
    },
    [
      amountToWithdraw,
      contractAddress,
      token,
      walletClient,
      address,
      chainId,
      publicClient,
      params,
      customGasLimit,
      gasSettings,
      addRecentTransaction,
      gasModel,
    ],
  );

  if ((currentDeposit.data || 0) > 0 && status === AllowanceStatus.SUCCESS) {
    setStatus(AllowanceStatus.INITIAL);
  }

  return {
    withdrawStatus: status,
    withdrawHandler: writeTokenWithdraw,
    currentDeposit: currentDeposit.data as bigint,
  };
}
