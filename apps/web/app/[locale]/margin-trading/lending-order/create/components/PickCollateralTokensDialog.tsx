import React from "react";

import PickMultipleTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickMultipleTokensDialog";
import { useCollateralTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCollateralTokensDialogOpened";
import { Currency } from "@/sdk_bi/entities/currency";

export default function PickCollateralTokensDialog({
  handlePick,
  collateralTokens,
}: {
  handlePick: (tokens: Currency[]) => void;
  collateralTokens: Currency[];
}) {
  const { isOpen, setIsOpen } = useCollateralTokensDialogOpenedStore();

  return (
    <PickMultipleTokensDialog
      handlePick={handlePick}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      selectedTokens={collateralTokens}
    />
  );
}
