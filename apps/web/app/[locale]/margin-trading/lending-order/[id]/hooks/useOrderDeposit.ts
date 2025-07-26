import { useCallback } from "react";
import { formatUnits, getAbiItem, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import { ERC223_ABI } from "@/config/abis/erc223";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { getTransactionWithRetries } from "@/functions/getTransactionWithRetries";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useOrderDeposit({
  orderId,
  amount,
  currency,
}: {
  orderId: number;
  currency: Currency;
  amount: string;
}) {
  const { setStatus, setDepositHash, setApproveHash } = useDepositOrderStatusStore();
  const chainId = useCurrentChainId();
  const { data: walletClient } = useWalletClient();

  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    updateAllowance,
  } = useStoreAllowance({
    token: currency,
    contractAddress: MARGIN_TRADING_ADDRESS[chainId],
    amountToCheck: parseUnits(amount, currency?.decimals ?? 18),
  });

  const handleOrderDeposit = useCallback(
    async (amountToApprove: string) => {
      if (!walletClient || !publicClient || !address) {
        return;
      }

      if (currency.isNative) {
        setStatus(OrderDepositStatus.PENDING_DEPOSIT);

        const depositOrderHash = await walletClient.writeContract({
          abi: MARGIN_MODULE_ABI,
          address: MARGIN_TRADING_ADDRESS[chainId],
          functionName: "orderDepositWETH9",
          args: [BigInt(orderId), currency.wrapped.address0],
          value: parseUnits(amount, currency.decimals ?? 18),
          account: undefined,
        });

        setStatus(OrderDepositStatus.LOADING_DEPOSIT);

        const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });

        if (receipt.status === "success") {
          setStatus(OrderDepositStatus.SUCCESS);
        } else {
          setStatus(OrderDepositStatus.ERROR_DEPOSIT);
        }
      } else {
        if (!isAllowedA) {
          setStatus(OrderDepositStatus.PENDING_APPROVE);
          const approveResult = await approveA({
            customAmount: parseUnits(amountToApprove, currency.decimals ?? 18),
            // customGasSettings: gasSettings,
          });

          if (!approveResult?.success) {
            setStatus(OrderDepositStatus.ERROR_APPROVE);
            return;
          }

          setApproveHash(approveResult.hash);
          setStatus(OrderDepositStatus.LOADING_APPROVE);

          const approveReceipt = await publicClient.waitForTransactionReceipt({
            hash: approveResult.hash,
          });

          if (approveReceipt.status !== "success") {
            setStatus(OrderDepositStatus.ERROR_APPROVE);
            return;
          }
        }

        setStatus(OrderDepositStatus.PENDING_DEPOSIT);

        const params = {
          abi: MARGIN_MODULE_ABI,
          address: MARGIN_TRADING_ADDRESS[chainId],
          functionName: "orderDepositToken" as const,
          args: [BigInt(orderId), parseUnits(amount, currency.decimals ?? 18)] as const,
        };

        try {
          const depositOrderHash = await walletClient.writeContract({
            ...params,
            account: undefined,
          });
          setStatus(OrderDepositStatus.LOADING_DEPOSIT);

          setDepositHash(depositOrderHash);

          const transaction = await getTransactionWithRetries({
            hash: depositOrderHash,
            publicClient,
          });

          const nonce = transaction.nonce;

          addRecentTransaction(
            {
              hash: depositOrderHash,
              nonce,
              chainId,
              gas: {
                model: GasFeeModel.EIP1559,
                gas: "0",
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
              },
              params: {
                ...stringifyObject(params),
                abi: [getAbiItem({ name: "orderDepositToken", abi: MARGIN_MODULE_ABI })],
              },
              title: {
                symbol: currency.symbol!,
                template: RecentTransactionTitleTemplate.DEPOSIT,
                amount: amount,
                logoURI: currency?.logoURI || "/images/tokens/placeholder.svg",
              },
            },
            address,
          );
          const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });
          if (receipt.status === "success") {
            setStatus(OrderDepositStatus.SUCCESS);
          } else {
            setStatus(OrderDepositStatus.ERROR_DEPOSIT);
          }
          console.log(receipt);
        } catch (e) {
          setStatus(OrderDepositStatus.ERROR_DEPOSIT);
        }
      }

      return;
    },
    [
      addRecentTransaction,
      address,
      amount,
      approveA,
      chainId,
      currency.decimals,
      currency.isNative,
      currency?.logoURI,
      currency.symbol,
      currency.wrapped.address0,
      isAllowedA,
      orderId,
      publicClient,
      setApproveHash,
      setDepositHash,
      setStatus,
      walletClient,
    ],
  );

  return { handleOrderDeposit };
}
