import React from "react";

import PositionProgressBar from "@/app/[locale]/margin-trading/components/PositionProgressBar";
import { OrderInfoCard } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import timestampToDateString from "@/app/[locale]/margin-trading/helpers/timestampToDateString";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";

export default function ActivePositionTimeframeBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
      <h3 className="text-20 text-secondary-text font-medium">Time frame</h3>
      <div className="grid grid-cols-2 gap-3">
        <OrderInfoCard
          value={`${(position.deadline - position.createdAt) / 60 / 60 / 24} days`}
          title="Margin position duration"
          tooltipText={"Tooltip text"}
          bg="margin_positions_duration"
        />
        <OrderInfoCard
          value={timestampToDateString(position.deadline, { withUTC: false, withSeconds: true })}
          title="Margin position deadline"
          tooltipText={"Tooltip text"}
          bg="deadline"
        />
      </div>
      <PositionProgressBar position={position} />
    </div>
  );
}
