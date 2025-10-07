import React from "react";
import { formatUnits } from "viem";

import { OrderInfoBlock } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import usePositionLiquidationCost from "@/app/[locale]/margin-trading/hooks/usePositionLiquidationCost";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import { formatFloat } from "@/functions/formatFloat";
import { useNativeCurrency } from "@/hooks/useNativeCurrency";

export default function ActivePositionParametersBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
      <OrderInfoBlock
        title="Parameters"
        cards={[
          {
            title: "Borrowed",
            tooltipText: "Tooltip text",
            value: `${formatFloat(formatUnits(position.loanAmount, position.loanAsset.decimals))} ${position.loanAsset.symbol}`,
            bg: "borrowed",
          },
          {
            title: "Initial collateral",
            tooltipText: "Tooltip text",
            value: `${formatFloat(formatUnits(position.collateralAmount, position.collateralAsset.decimals))} ${position.collateralAsset.symbol}`,
            bg: "collateral",
          },
          {
            title: "Leverage",
            tooltipText: "Tooltip text",
            value: `${position.initialLeverage}x`,
            bg: "leverage",
          },
        ]}
      />
    </div>
  );
}
