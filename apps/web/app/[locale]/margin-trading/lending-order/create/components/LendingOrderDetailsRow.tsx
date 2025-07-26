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
    <div className="flex justify-between gap-3">
      <div className="flex gap-1 pt-0.5 text-14 text-secondary-text flex-shrink-0">
        {tooltipText && <Tooltip iconSize={20} text={tooltipText} />}
        {title}
      </div>
      {value}
    </div>
  );
}
