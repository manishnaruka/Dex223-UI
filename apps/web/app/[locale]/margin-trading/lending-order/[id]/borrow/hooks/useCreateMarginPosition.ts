import { useCallback } from "react";

import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import sleep from "@/functions/sleep";

export default function useCreateMarginPosition() {
  const { setStatus } = useCreateMarginPositionStatusStore();

  const handleCreateMarginPosition = useCallback(async () => {
    setStatus(CreateMarginPositionStatus.PENDING_APPROVE_BORROW);

    await sleep(5000);
    setStatus(CreateMarginPositionStatus.LOADING_APPROVE_BORROW);
    await sleep(5000);
    setStatus(CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE);
    await sleep(5000);
    setStatus(CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE);
    await sleep(6000);
    setStatus(CreateMarginPositionStatus.PENDING_BORROW);
    await sleep(5000);
    setStatus(CreateMarginPositionStatus.LOADING_BORROW);
    await sleep(5000);
    setStatus(CreateMarginPositionStatus.SUCCESS);
  }, [setStatus]);

  return { handleCreateMarginPosition };
}
