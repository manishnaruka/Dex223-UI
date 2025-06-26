import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";

export default function useOrderDeposit({
  orderId,
  amount,
  currency,
}: {
  orderId: number;
  currency: Currency;
  amount: string;
}) {
  const { setStatus } = useDepositOrderStatusStore();
  const chainId = useCurrentChainId();
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient();

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
      if (!walletClient || !publicClient) {
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
        setStatus(OrderDepositStatus.PENDING_APPROVE);
        const approveResult = await approveA({
          customAmount: parseUnits(amountToApprove, currency.decimals ?? 18),
          // customGasSettings: gasSettings,
        });

        if (!approveResult?.success) {
          setStatus(OrderDepositStatus.ERROR_APPROVE);
          return;
        }

        setStatus(OrderDepositStatus.LOADING_APPROVE);

        const approveReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveResult.hash,
        });

        if (approveReceipt.status !== "success") {
          setStatus(OrderDepositStatus.ERROR_APPROVE);
          return;
        }

        setStatus(OrderDepositStatus.PENDING_DEPOSIT);

        const depositOrderHash = await walletClient.writeContract({
          abi: MARGIN_MODULE_ABI,
          address: MARGIN_TRADING_ADDRESS[chainId],
          functionName: "orderDepositToken",
          args: [BigInt(orderId), parseUnits(amount, currency.decimals ?? 18)],
          account: undefined,
        });
        setStatus(OrderDepositStatus.LOADING_DEPOSIT);

        const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });

        if (receipt.status === "success") {
          setStatus(OrderDepositStatus.SUCCESS);
        } else {
          setStatus(OrderDepositStatus.ERROR_DEPOSIT);
        }
        console.log(receipt);
      }
      //
      // await sleep(1000);
      // setStatus(OrderDepositStatus.LOADING_APPROVE);
      // await sleep(4000);
      //
      // setStatus(OrderDepositStatus.PENDING_DEPOSIT);
      // await sleep(4000);
      //
      // setStatus(OrderDepositStatus.LOADING_DEPOSIT);
      // await sleep(4000);
      //
      // setStatus(OrderDepositStatus.SUCCESS);

      return;
    },
    [
      amount,
      approveA,
      chainId,
      currency.decimals,
      currency.isNative,
      currency.wrapped.address0,
      orderId,
      publicClient,
      setStatus,
      walletClient,
    ],
  );

  return { handleOrderDeposit };
}
