import Checkbox from "@repo/ui/checkbox";
import { useState } from "react";

import SelectButton from "@/components/atoms/SelectButton";
import { useTokens } from "@/hooks/useTokenLists";
import { Currency } from "@/sdk_bi/entities/currency";

export default function TokensMultiselect({
  selectedTokens,
  setSelectedTokens,
}: {
  selectedTokens: Currency[];
  setSelectedTokens: (selectedTokens: Currency[]) => void;
}) {
  const tokens = useTokens();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className="relative">
      <SelectButton onClick={() => setIsPopoverOpen(!isPopoverOpen)}>All tokens</SelectButton>
    </div>
  );
}
