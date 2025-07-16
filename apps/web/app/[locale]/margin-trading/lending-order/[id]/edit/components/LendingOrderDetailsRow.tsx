import Tooltip from "@repo/ui/tooltip";
import React, { ReactNode } from "react";

export default function LendingOrderDetailsRow({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | ReactNode;
  tooltipText?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-1 items-center text-14 text-secondary-text">
        {tooltipText && <Tooltip iconSize={20} text={tooltipText} />}
        {title}
      </div>
      <span>{value}</span>
    </div>
  );
}
