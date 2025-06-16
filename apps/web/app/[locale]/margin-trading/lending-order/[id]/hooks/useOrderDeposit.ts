import { useCallback } from "react";

import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import sleep from "@/functions/sleep";

export default function useOrderDeposit() {
  const { setStatus } = useDepositOrderStatusStore();

  const handleOrderDeposit = useCallback(async () => {
    setStatus(OrderDepositStatus.PENDING_APPROVE);
    await sleep(1000);
    setStatus(OrderDepositStatus.LOADING_APPROVE);
    await sleep(4000);

    setStatus(OrderDepositStatus.PENDING_DEPOSIT);
    await sleep(4000);

    setStatus(OrderDepositStatus.LOADING_DEPOSIT);
    await sleep(4000);

    setStatus(OrderDepositStatus.SUCCESS);

    return;
  }, [setStatus]);

  return { handleOrderDeposit };
}
