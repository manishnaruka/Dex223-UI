import { useCallback } from "react";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  PositionDepositStatus,
  useDepositPositionStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionDepositStatusStore";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { Currency } from "@/sdk_bi/entities/currency";

export default function usePositionDeposit({
  position,
  amount,
  currency,
}: {
  position: MarginPosition;
  currency: Currency;
  amount: string;
}) {
  const { setStatus } = useDepositPositionStatusStore();
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

  const handlePositionDeposit = useCallback(
    async (amountToApprove: string) => {
      if (!walletClient || !publicClient) {
        return;
      }

      setStatus(PositionDepositStatus.PENDING_APPROVE);
      const approveResult = await approveA({
        customAmount: parseUnits(amountToApprove, currency.decimals ?? 18),
        // customGasSettings: gasSettings,
      });

      if (!approveResult?.success) {
        setStatus(PositionDepositStatus.ERROR_APPROVE);
        return;
      }

      setStatus(PositionDepositStatus.LOADING_APPROVE);

      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveResult.hash,
      });

      if (approveReceipt.status !== "success") {
        setStatus(PositionDepositStatus.ERROR_APPROVE);
        return;
      }

      setStatus(PositionDepositStatus.PENDING_DEPOSIT);

      const depositOrderHash = await walletClient.writeContract({
        abi: MARGIN_MODULE_ABI,
        address: MARGIN_TRADING_ADDRESS[chainId],
        functionName: "positionDeposit",
        args: [
          BigInt(position.id),
          currency.wrapped.address0,
          BigInt(
            position.assetAddresses.findIndex(
              (asset) => asset.address.toLowerCase() === currency.wrapped.address0.toLowerCase(),
            ),
          ),
          parseUnits(amount, currency.decimals ?? 18),
        ],
        account: undefined,
      });
      setStatus(PositionDepositStatus.LOADING_DEPOSIT);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositOrderHash });

      if (receipt.status === "success") {
        setStatus(PositionDepositStatus.SUCCESS);
      } else {
        setStatus(PositionDepositStatus.ERROR_DEPOSIT);
      }
      console.log(receipt);

      return;
    },
    [
      amount,
      approveA,
      chainId,
      currency.decimals,
      currency.wrapped.address0,
      position.assetAddresses,
      position.id,
      publicClient,
      setStatus,
      walletClient,
    ],
  );

  return { handlePositionDeposit };
}
