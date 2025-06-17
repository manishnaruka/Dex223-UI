import { useCallback } from "react";
import { parseUnits } from "viem";

import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import {
  OrderWithdrawStatus,
  useWithdrawOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useWithdrawOrderStatusStore";
import sleep from "@/functions/sleep";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";

export default function useOrderWithdraw({ orderId }: { orderId: number }) {
  const { setStatus } = useWithdrawOrderStatusStore();
  const chainId = useCurrentChainId();

  // const {
  //   isAllowed: isAllowedA,
  //   writeTokenApprove: approveA,
  //   updateAllowance,
  // } = useStoreAllowance({
  //   token: params.loanToken,
  //   contractAddress: MARGIN_TRADING_ADDRESS[chainId],
  //   amountToCheck: parseUnits(params.loanAmount, params.loanToken?.decimals ?? 18),
  // });

  const handleOrderWithdraw = useCallback(async () => {
    console.log(orderId);
    setStatus(OrderWithdrawStatus.PENDING_WITHDRAW);
    await sleep(1000);
    setStatus(OrderWithdrawStatus.LOADING_WITHDRAW);
    await sleep(4000);

    setStatus(OrderWithdrawStatus.SUCCESS);

    return;
  }, [orderId, setStatus]);

  return { handleOrderWithdraw };
}
