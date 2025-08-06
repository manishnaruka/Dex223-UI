import Image from "next/image";
import React from "react";

import { OrderInfoCard } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import Svg from "@/components/atoms/Svg";

export default function ClosedPositionInfoBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="flex flex-col gap-5 px-10 py-5 bg-primary-bg rounded-5">
      <div className="flex items-center gap-2">
        <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
        <span className="text-secondary-text text-18 font-bold">{position.loanAsset.name}</span>
        <div className="flex items-center gap-3 text-tertiary-text">
          Executed
          <Svg iconName="done" />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <OrderInfoCard value={100} title={"Borrowed"} tooltipText="tooltip text" bg="borrowed" />
        <OrderInfoCard value={100} title={"Profit"} tooltipText="tooltip text" bg="borrowed" />
        <OrderInfoCard value={100} title={"Leverage"} tooltipText="tooltip text" bg="borrowed" />
      </div>
    </div>
  );
}
