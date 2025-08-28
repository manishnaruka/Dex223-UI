import Image from "next/image";
import React from "react";
import { formatUnits } from "viem";

import { OrderInfoCard } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import timestampToDateString from "@/app/[locale]/margin-trading/helpers/timestampToDateString";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import Svg from "@/components/atoms/Svg";
import { formatFloat } from "@/functions/formatFloat";

export default function LiquidatedPositionInfoBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="flex flex-col gap-5 px-10 py-5 bg-primary-bg rounded-5">
      <div className="flex items-center gap-2">
        <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
        <span className="text-secondary-text text-18 font-bold">{position.loanAsset.name}</span>
        <div className="flex items-center gap-3 text-tertiary-text">
          Liquidated
          <Svg iconName="liquidated" />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-4">
        <OrderInfoCard
          value={formatFloat(formatUnits(position.loanAmount, position.loanAsset.decimals))}
          title={"Borrowed"}
          tooltipText="tooltip text"
          bg="borrowed"
        />
        <OrderInfoCard
          value={100}
          title={"Initial collateral"}
          tooltipText="tooltip text"
          bg="collateral"
        />
        <OrderInfoCard
          value={timestampToDateString(position.liquidatedAt, { withUTC: false })}
          title={"Liquidation date"}
          tooltipText="tooltip text"
          bg="leverage"
        />
        <OrderInfoCard
          value={position.initialLeverage}
          title={"Initial leverage"}
          tooltipText="tooltip text"
          bg="leverage"
        />
      </div>
    </div>
  );
}
