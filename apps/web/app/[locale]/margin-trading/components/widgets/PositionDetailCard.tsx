import Tooltip from "@repo/ui/tooltip";
import React, { ReactNode } from "react";

export default function PositionDetailCard({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | number | ReactNode;
  tooltipText?: string;
}) {
  return (
    <div className="flex-grow bg-tertiary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-10 text-tertiary-text">
      {tooltipText && <Tooltip text={tooltipText} />}
      {title}: <span className="text-secondary-text">{value}</span>
    </div>
  );
}

export function PositionDetailCardDialog({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | number | ReactNode;
  tooltipText?: string;
}) {
  return (
    <div className="flex-grow bg-quaternary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-10 text-tertiary-text">
      {tooltipText && <Tooltip text={tooltipText} />}
      {title}: <span className="text-secondary-text">{value}</span>
    </div>
  );
}
