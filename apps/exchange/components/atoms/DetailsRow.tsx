import Tooltip from "@repo/ui/tooltip";
import React, { ReactNode } from "react";

export default function DetailsRow({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | ReactNode;
  tooltipText: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-1 items-center text-secondary-text">
        <Tooltip iconSize={20} text={tooltipText} />
        {title}
      </div>
      <span>{value}</span>
    </div>
  );
}
