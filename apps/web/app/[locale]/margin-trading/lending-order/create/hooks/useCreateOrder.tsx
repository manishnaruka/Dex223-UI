import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStatus,
  useCreateOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStatusStore";
import {
  useCreateOrderGasLimitStore,
  useCreateOrderGasPriceStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useSwapGasSettingsStore";
import { SwapError } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { getGasSettings } from "@/functions/gasSettings";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import sleep from "@/functions/sleep";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useFees } from "@/hooks/useFees";
import addToast from "@/other/toast";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Standard } from "@/sdk_bi/standard";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";
import {
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

function useCreateOrderParams() {
  const { firstStepValues, secondStepValues, thirdStepValues } = useCreateOrderConfigStore();

  return {
    ...firstStepValues,
    ...secondStepValues,
    ...thirdStepValues,
  };
}

export default function useCreateOrder() {
  const t = useTranslations("Swap");
  const { data: walletClient } = useWalletClient();
  const params = useCreateOrderParams();
  const publicClient = usePublicClient();
  const chainId = useCurrentChainId();
  const { address } = useAccount();

  const { openConfirmInWalletAlert, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();
  const { setStatus, setApproveHash, setDepositHash, setConfirmOrderHash, setErrorType } =
    useCreateOrderStatusStore();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    updateAllowance,
  } = useStoreAllowance({
    token: params.loanToken,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: parseUnits(params.loanAmount, params.loanToken?.decimals ?? 18),
  });

  const { customGasLimit } = useCreateOrderGasLimitStore();
  const { gasPriceOption, gasPriceSettings } = useCreateOrderGasPriceStore();
  const { baseFee, priorityFee, gasPrice } = useFees();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const gasSettings = useMemo(() => {
    return getGasSettings({
      baseFee,
      chainId,
      gasPrice,
      priorityFee,
      gasPriceOption,
      gasPriceSettings,
    });
  }, [baseFee, chainId, gasPrice, priorityFee, gasPriceOption, gasPriceSettings]);

  const handleCreateOrder = useCallback(
    async (amountToApprove: string) => {
      // setStatus(CreateOrderStatus.PENDING_APPROVE);
      // await sleep(1000);
      // setStatus(CreateOrderStatus.LOADING_APPROVE);
      // await sleep(4000);
      //
      // setStatus(CreateOrderStatus.PENDING_CONFIRM_ORDER);
      // await sleep(4000);
      //
      // setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);
      // await sleep(4000);
      //
      // setStatus(CreateOrderStatus.PENDING_DEPOSIT);
      // await sleep(4000);
      //
      // setStatus(CreateOrderStatus.LOADING_DEPOSIT);
      // await sleep(4000);
      //
      // setStatus(CreateOrderStatus.SUCCESS);
      //
      // return;

      if (!publicClient || !params.loanToken) {
        return;
      }

      if (!isAllowedA && params.loanTokenStandard === Standard.ERC20 && params.loanToken.isToken) {
        openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

        setStatus(CreateOrderStatus.PENDING_APPROVE);
        const result = await approveA({
          customAmount: parseUnits(amountToApprove, params.loanToken.decimals ?? 18),
          customGasSettings: gasSettings,
        });

        if (!result?.success) {
          setStatus(CreateOrderStatus.INITIAL);
          closeConfirmInWalletAlert();
          return;
        } else {
          setApproveHash(result.hash);
          setStatus(CreateOrderStatus.LOADING_APPROVE);
          closeConfirmInWalletAlert();

          const approveReceipt = await publicClient.waitForTransactionReceipt({
            hash: result.hash,
          });

          if (approveReceipt.status === "reverted") {
            setStatus(CreateOrderStatus.ERROR_APPROVE);
            return;
          }
        }
      }

      if (
        !walletClient ||
        !address
        // !tokenA ||
        // !tokenB ||
        // (!tokenA.equals(tokenB) && (!trade || !chainId)) ||
        // !swapParams ||
        // typeof output == null
        // !estimatedGas
      ) {
        console.log({
          walletClient,
          address,
          // tokenA,
          // tokenB,
          // trade,
          // output,
          publicClient,
          chainId,
          // swapParams,
        });
        return;
      }

      setStatus(CreateOrderStatus.PENDING_CONFIRM_ORDER);
      openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

      let confirmOrderHash;

      try {
        const estimatedGas = await publicClient.estimateContractGas({
          account: address,
          ...params,
        } as any);

        const gasToUse = customGasLimit ? customGasLimit : estimatedGas + BigInt(30000); // set custom gas here if user changed it

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

        confirmOrderHash = await walletClient.writeContract({
          ..._request,
          account: undefined,
        });

        closeConfirmInWalletAlert();

        if (!confirmOrderHash) {
          setStatus(CreateOrderStatus.INITIAL);
          return;
        }

        setConfirmOrderHash(confirmOrderHash);
        setStatus(CreateOrderStatus.LOADING_CONFIRM_ORDER);

        const transaction = await getTransactionWithRetries({
          hash: confirmOrderHash,
          publicClient,
        });
        if (transaction) {
          const nonce = transaction.nonce;

          addRecentTransaction(
            {
              hash: confirmOrderHash,
              nonce,
              chainId,
              gas: {
                ...stringifyObject({ ...gasSettings, model: gasPriceSettings.model }),
                gas: gasToUse.toString(),
              },
              params: {
                ...stringifyObject(params),
                abi: [
                  // getAbiItem({
                  //   name: swapParams.functionName,
                  //   abi: swapParams.abi,
                  //   args: swapParams.args as any,
                  // }),
                ],
              },
              title: {
                symbol: params.loanToken.symbol!,
                template: RecentTransactionTitleTemplate.CONVERT,
                amount: params.loanAmount,
                logoURI: params.loanToken?.logoURI || "/images/tokens/placeholder.svg",
                standard: params.loanTokenStandard,
              },
            },
            address,
          );

          const receipt = await publicClient.waitForTransactionReceipt({
            hash: confirmOrderHash,
          }); //TODO: add try catch
          updateAllowance();

          if (receipt.status === "reverted") {
            setStatus(CreateOrderStatus.ERROR_CONFIRM_ORDER);

            const ninetyEightPercent = (gasToUse * BigInt(98)) / BigInt(100);

            if (receipt.gasUsed >= ninetyEightPercent && receipt.gasUsed <= gasToUse) {
              setErrorType(SwapError.OUT_OF_GAS);
            } else {
              setErrorType(SwapError.UNKNOWN);
            }
            return;
          }

          // DEPOSITING
          setStatus(CreateOrderStatus.PENDING_DEPOSIT);
          openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

          let depositHash;

          try {
            const estimatedGas = await publicClient.estimateContractGas({
              account: address,
              ...params,
            } as any);

            const gasToUse = customGasLimit ? customGasLimit : estimatedGas + BigInt(30000); // set custom gas here if user changed it

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

            depositHash = await walletClient.writeContract({
              ..._request,
              account: undefined,
            });

            closeConfirmInWalletAlert();

            if (!depositHash) {
              setStatus(CreateOrderStatus.INITIAL);
              return;
            }

            setDepositHash(depositHash);
            setStatus(CreateOrderStatus.LOADING_DEPOSIT);

            const transaction = await getTransactionWithRetries({
              hash: confirmOrderHash,
              publicClient,
            });
            if (transaction) {
              const nonce = transaction.nonce;

              addRecentTransaction(
                {
                  hash: depositHash,
                  nonce,
                  chainId,
                  gas: {
                    ...stringifyObject({ ...gasSettings, model: gasPriceSettings.model }),
                    gas: gasToUse.toString(),
                  },
                  params: {
                    ...stringifyObject(params),
                    abi: [
                      // getAbiItem({
                      //   name: swapParams.functionName,
                      //   abi: swapParams.abi,
                      //   args: swapParams.args as any,
                      // }),
                    ],
                  },
                  title: {
                    symbol: params.loanToken.symbol!,
                    template: RecentTransactionTitleTemplate.CONVERT,
                    amount: params.loanAmount,
                    logoURI: params.loanToken?.logoURI || "/images/tokens/placeholder.svg",
                    standard: params.loanTokenStandard,
                  },
                },
                address,
              );

              const receipt = await publicClient.waitForTransactionReceipt({
                hash: depositHash,
              }); //TODO: add try catch
              updateAllowance();

              if (receipt.status === "reverted") {
                setStatus(CreateOrderStatus.ERROR_DEPOSIT);

                const ninetyEightPercent = (gasToUse * BigInt(98)) / BigInt(100);

                if (receipt.gasUsed >= ninetyEightPercent && receipt.gasUsed <= gasToUse) {
                  setErrorType(SwapError.OUT_OF_GAS);
                } else {
                  setErrorType(SwapError.UNKNOWN);
                }
              }
            }
          } catch (e) {
            console.log(e);
            addToast("Error while executing contract", "error");
            closeConfirmInWalletAlert();
            setStatus(CreateOrderStatus.INITIAL);
          }
        }
      } catch (e) {
        console.log(e);
        addToast("Error while executing contract", "error");
        closeConfirmInWalletAlert();
        setStatus(CreateOrderStatus.INITIAL);
      }
    },
    [
      publicClient,
      params,
      isAllowedA,
      walletClient,
      address,
      setStatus,
      openConfirmInWalletAlert,
      t,
      approveA,
      gasSettings,
      closeConfirmInWalletAlert,
      setApproveHash,
      chainId,
      customGasLimit,
      setConfirmOrderHash,
      addRecentTransaction,
      gasPriceSettings.model,
      updateAllowance,
      setErrorType,
      setDepositHash,
    ],
  );

  return { handleCreateOrder };
}
