import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Address, getAbiItem, Hash, TransactionReceipt } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { GasSettings } from "@/stores/factories/createGasPriceStore";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";
import {
  IRecentTransactionTitle,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useRunStep() {
  const { data: walletClient } = useWalletClient();
  const t = useTranslations("Swap");

  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { address } = useAccount();
  const { openConfirmInWalletAlert, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const handleRunStep = useCallback(
    async ({
      params,
      customGasLimit,
      gasSettings,
      title,
      gasPriceSettings,
      onHashReceive,
      onReceiptReceive,
    }: {
      params: any;
      customGasLimit?: bigint;
      gasSettings: any;
      title: IRecentTransactionTitle;
      gasPriceSettings: GasSettings;
      onHashReceive: (hash: Hash | undefined) => void;
      onReceiptReceive: (receipt: TransactionReceipt, gas: bigint) => void;
    }) => {
      openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

      if (!publicClient || !walletClient || !address) {
        return;
      }

      let hash;

      try {
        const estimatedGas = await publicClient.estimateContractGas({
          account: address,
          ...params,
        } as any);

        const gasToUse = customGasLimit || estimatedGas + BigInt(30000); // set custom gas here if user changed it

        let _request;
        try {
          const { request } = await publicClient.simulateContract({
            ...params,
            account: address,
            ...gasSettings,
            gas: gasToUse,
          } as any);
          _request = request;
        } catch (e) {
          _request = {
            ...params,
            ...gasSettings,
            gas: gasToUse,
            account: undefined,
          } as any;
        }

        hash = await walletClient.writeContract({
          ..._request,
          account: undefined,
        });

        closeConfirmInWalletAlert();

        onHashReceive(hash);

        const transaction = await getTransactionWithRetries({
          hash,
          publicClient,
        });
        if (transaction) {
          const nonce = transaction.nonce;

          addRecentTransaction(
            {
              hash,
              nonce,
              chainId,
              gas: {
                ...stringifyObject({ ...gasSettings, model: gasPriceSettings.model }),
                gas: gasToUse.toString(),
              },
              params: {
                ...stringifyObject(params),
                abi: [
                  getAbiItem({
                    name: params.functionName,
                    abi: params.abi,
                    args: params.args as any,
                  }),
                ],
              },
              title,
            },
            address,
          );

          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          }); //TODO: add try catch

          onReceiptReceive(receipt, gasToUse);
        }
      } catch (e) {
        console.log(e);
      }
    },
    [
      addRecentTransaction,
      address,
      chainId,
      closeConfirmInWalletAlert,
      openConfirmInWalletAlert,
      publicClient,
      t,
      walletClient,
    ],
  );

  return { handleRunStep };
}
