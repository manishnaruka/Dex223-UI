import { isZeroAddress } from "@ethereumjs/util";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import { getAbiItem } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useAutoListingContract } from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useConfirmListTokenDialogStore } from "@/app/[locale]/token-listing/add/stores/useConfirmListTokenDialogOpened";
import { useListTokensStore } from "@/app/[locale]/token-listing/add/stores/useListTokensStore";
import {
  ListError,
  ListTokenStatus,
  useListTokenStatusStore,
} from "@/app/[locale]/token-listing/add/stores/useListTokenStatusStore";
import { usePaymentTokenStore } from "@/app/[locale]/token-listing/add/stores/usePaymentTokenStore";
import { AUTO_LISTING_ABI } from "@/config/abis/autolisting";
import { ROUTER_ABI } from "@/config/abis/router";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Token } from "@/sdk_hybrid/entities/token";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useListToken() {
  const t = useTranslations("Swap");

  const { tokenA, tokenB } = useListTokensStore();
  const { autoListingContract } = useAutoListingContractStore();
  const { isOpen: confirmDialogOpened } = useConfirmListTokenDialogStore();

  const autoListing = useAutoListingContract(autoListingContract);
  const { openConfirmInWalletAlert, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { poolAddress, poolAddressLoading } = useComputePoolAddressDex({
    tokenA,
    tokenB,
    tier: FeeAmount.MEDIUM,
  });

  const isFree = useMemo(() => {
    return !autoListing?.pricesDetail.length;
  }, [autoListing]);

  console.log(autoListing, "autoListing");

  const { data: walletClient } = useWalletClient();
  const { paymentToken, setPaymentToken } = usePaymentTokenStore();

  const _paymentToken = useMemo(() => {
    if (paymentToken && autoListing) {
      return autoListing.pricesDetail.find(
        (o: any) => o.feeTokenAddress.id.toLowerCase() === paymentToken?.token?.toLowerCase(),
      );
    }

    return;
  }, [autoListing, paymentToken]);

  const {
    status: listTokenStatus,
    setStatus: setListTokenStatus,
    setApproveHash,
    errorType,
    setErrorType,
    setListTokenHash,
  } = useListTokenStatusStore();
  const chainId = useCurrentChainId();
  const { addRecentTransaction } = useRecentTransactionsStore();

  console.log("Payment token");
  console.log(paymentToken);

  const listParams = useMemo(() => {
    if (!poolAddress) {
      return;
    }

    const common = {
      address: autoListingContract,
      abi: AUTO_LISTING_ABI,
      functionName: "list",
      args: [poolAddress, FeeAmount.MEDIUM],
    };

    if (isFree) {
      return { ...common, args: [...common.args, poolAddress] };
    } else {
      if (!paymentToken) {
        return;
      }

      if (isZeroAddress(paymentToken.token)) {
        return { ...common, args: [...common.args, paymentToken.token], value: paymentToken.price };
      }

      return { ...common, args: [...common.args, paymentToken.token] };
    }
  }, [autoListingContract, isFree, paymentToken, poolAddress]);

  useEffect(() => {
    if (
      (listTokenStatus === ListTokenStatus.SUCCESS ||
        listTokenStatus === ListTokenStatus.ERROR ||
        listTokenStatus === ListTokenStatus.APPROVE_ERROR) &&
      !confirmDialogOpened
    ) {
      setTimeout(() => {
        setListTokenStatus(ListTokenStatus.INITIAL);
      }, 400);
    }
  }, [confirmDialogOpened, setListTokenStatus, listTokenStatus]);

  console.log(paymentToken);

  const { isAllowed, writeTokenApprove, updateAllowance } = useStoreAllowance({
    token:
      _paymentToken && !isFree
        ? new Token(
            DexChainId.SEPOLIA,
            _paymentToken.feeTokenAddress.id,
            _paymentToken.feeTokenAddress.id,
            +_paymentToken.feeTokenAddress.decimals,
            _paymentToken.feeTokenAddress.symbol,
          )
        : undefined,
    contractAddress: autoListingContract,
    amountToCheck: paymentToken ? paymentToken.price * BigInt(2) : null,
  });

  const handleList = useCallback(async () => {
    console.log(!paymentToken && !isFree);

    if (!poolAddress || !walletClient || (!paymentToken && !isFree) || !publicClient) {
      return;
    }

    if (!isAllowed && !isFree && paymentToken && !isZeroAddress(paymentToken.token)) {
      openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

      setListTokenStatus(ListTokenStatus.PENDING_APPROVE);
      const result = await writeTokenApprove();

      if (!result?.success) {
        setListTokenStatus(ListTokenStatus.INITIAL);
        closeConfirmInWalletAlert();
        return;
      } else {
        setApproveHash(result.hash);
        setListTokenStatus(ListTokenStatus.LOADING_APPROVE);
        closeConfirmInWalletAlert();

        const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: result.hash });

        if (approveReceipt.status === "reverted") {
          setListTokenStatus(ListTokenStatus.APPROVE_ERROR);
          return;
        }
      }
    }

    if (!tokenA || !tokenB || !address || !listParams) {
      return;
    }

    setListTokenStatus(ListTokenStatus.PENDING);
    openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

    let hash;

    let gasPriceFormatted = {};

    // if (gasPriceOption !== GasOption.CUSTOM) {
    //   const multiplier = baseFeeMultipliers[chainId][gasPriceOption];
    //   switch (gasPriceSettings.model) {
    //     case GasFeeModel.EIP1559:
    //       if (priorityFee && baseFee) {
    //         gasPriceFormatted = {
    //           maxPriorityFeePerGas: (priorityFee * multiplier) / SCALING_FACTOR,
    //           maxFeePerGas: (baseFee * multiplier) / SCALING_FACTOR,
    //         };
    //       }
    //       break;
    //
    //     case GasFeeModel.LEGACY:
    //       if (gasPrice) {
    //         gasPriceFormatted = {
    //           gasPrice: (gasPrice * multiplier) / SCALING_FACTOR,
    //         };
    //       }
    //       break;
    //   }
    // } else {
    //   switch (gasPriceSettings.model) {
    //     case GasFeeModel.EIP1559:
    //       gasPriceFormatted = {
    //         maxPriorityFeePerGas: gasPriceSettings.maxPriorityFeePerGas,
    //         maxFeePerGas: gasPriceSettings.maxFeePerGas,
    //       };
    //       break;
    //
    //     case GasFeeModel.LEGACY:
    //       gasPriceFormatted = { gasPrice: gasPriceSettings.gasPrice };
    //       break;
    //   }
    // }

    console.log(listParams);

    try {
      const estimatedGas = await publicClient.estimateContractGas({
        account: address,
        ...listParams,
      } as any);

      const gasToUse = estimatedGas + BigInt(30000); // set custom gas here if user changed it
      // const gasToUse = customGasLimit ? customGasLimit : estimatedGas + BigInt(30000); // set custom gas here if user changed it

      console.log(gasToUse);

      const { request } = await publicClient.simulateContract({
        ...listParams,
        account: address,
        ...gasPriceFormatted,
        gas: gasToUse,
      } as any);

      hash = await walletClient.writeContract({ ...request, account: undefined }); // TODO: remove any

      closeConfirmInWalletAlert();

      if (hash) {
        setListTokenHash(hash);
        const transaction = await publicClient.getTransaction({
          hash,
        });

        const nonce = transaction.nonce;
        setListTokenStatus(ListTokenStatus.LOADING);
        addRecentTransaction(
          {
            hash,
            nonce,
            chainId,
            gas: {
              ...stringifyObject({ ...gasPriceFormatted, model: GasFeeModel.EIP1559 }),
              // gas: gasLimit.toString(),
            },
            params: {
              ...stringifyObject(listParams),
              abi: [getAbiItem({ name: "exactInputSingle", abi: ROUTER_ABI })],
            },
            title: {
              symbol: tokenA.symbol!,
              template: RecentTransactionTitleTemplate.LIST_SINGLE,
              logoURI: tokenA?.logoURI || "/tokens/placeholder.svg",
              autoListing: autoListing.name,
            },
          },
          address,
        );

        const receipt = await publicClient.waitForTransactionReceipt({ hash }); //TODO: add try catch
        updateAllowance();
        if (receipt.status === "success") {
          setListTokenStatus(ListTokenStatus.SUCCESS);
        }

        if (receipt.status === "reverted") {
          setListTokenStatus(ListTokenStatus.ERROR);

          const ninetyEightPercent = (gasToUse * BigInt(98)) / BigInt(100);

          if (receipt.gasUsed >= ninetyEightPercent && receipt.gasUsed <= gasToUse) {
            setErrorType(ListError.OUT_OF_GAS);
          } else {
            setErrorType(ListError.UNKNOWN);
          }
        }
      } else {
        setListTokenStatus(ListTokenStatus.INITIAL);
      }
    } catch (e) {
      console.log(e);
      setListTokenStatus(ListTokenStatus.INITIAL);
    }
  }, [
    addRecentTransaction,
    address,
    autoListing?.name,
    chainId,
    closeConfirmInWalletAlert,
    isAllowed,
    isFree,
    listParams,
    openConfirmInWalletAlert,
    paymentToken,
    poolAddress,
    publicClient,
    setApproveHash,
    setErrorType,
    setListTokenHash,
    setListTokenStatus,
    t,
    tokenA,
    tokenB,
    updateAllowance,
    walletClient,
    writeTokenApprove,
  ]);

  return { handleList };
}
