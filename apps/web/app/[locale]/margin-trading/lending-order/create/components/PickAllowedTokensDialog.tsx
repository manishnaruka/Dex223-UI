import React from "react";

import PickMultipleTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickMultipleTokensDialog";
import { useAllowedTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { Currency } from "@/sdk_bi/entities/currency";

export default function PickCollateralTokensDialog({
  handlePick,
  allowedTokens,
  restrictDisable,
}: {
  handlePick: (tokens: Currency[]) => void;
  allowedTokens: Currency[];
  restrictDisable?: Currency | undefined;
}) {
  const { isOpen, setIsOpen } = useAllowedTokensDialogOpenedStore();

  return (
    <PickMultipleTokensDialog
      handlePick={handlePick}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      selectedTokens={allowedTokens}
      restrictDisable={restrictDisable}
    />
  );
}
