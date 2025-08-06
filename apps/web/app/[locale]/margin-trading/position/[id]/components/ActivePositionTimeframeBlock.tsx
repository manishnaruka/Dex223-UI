import React from "react";

import PositionProgressBar from "@/app/[locale]/margin-trading/components/PositionProgressBar";
import { OrderInfoCard } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";

export default function ActivePositionTimeframeBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
      <h3 className="text-20 text-secondary-text font-medium">Time frame</h3>
      <div className="grid grid-cols-2 gap-3">
        <OrderInfoCard
          value={"7 days"}
          title="Margin position duration"
          tooltipText={"Tooltip text"}
          bg="margin_positions_duration"
        />
        <OrderInfoCard
          value={new Date(position.deadline * 1000).toLocaleString("en-GB").split("/").join(".")}
          title="Lending order deadline"
          tooltipText={"Tooltip text"}
          bg="deadline"
        />
      </div>
      <PositionProgressBar position={position} />
    </div>
  );
}
