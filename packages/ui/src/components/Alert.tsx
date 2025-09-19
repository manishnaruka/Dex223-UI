import clsx from "clsx";
import { ReactNode } from "react";

import { clsxMerge } from "../functions/clsxMerge";
import InfoIcon from "../icons/InfoIcon";
import WarningIcon from "../icons/WarningIcon";
import SuccessIcon from "../icons/SuccessIcon";

export type AlertType = "success" | "info" | "error" | "warning" | "info-border";

interface Props {
  text: string | ReactNode;
  withIcon?: boolean;
  type?: AlertType;
  className?: string;
}

const iconsMap: Record<AlertType, ReactNode> = {
  success: <SuccessIcon className="ui-flex-shrink-0" />,
  info: <InfoIcon className="ui-flex-shrink-0" />,
  error: <WarningIcon className="ui-flex-shrink-0" />,
  warning: <WarningIcon className="ui-flex-shrink-0" />,
  "info-border": <InfoIcon className="ui-flex-shrink-0"/>,
};

export default function Alert({ text, type = "success", withIcon = true, className = "" }: Props) {
  return (
    <div
      className={clsxMerge(
        `
        ui-relative
        ui-flex
        ui-outline
        ui-rounded-2
        ui-gap-2
        ui-px-4
        ui-md:px-5
        ui-py-2
        ui-overflow-hidden
        ui-group
        ui-text-14
        ui-text-secondary-text
        `,
        type === "success" && "ui-outline-green ui-bg-green-bg ui-outline-1",
        type === "error" && "ui-outline-red-light ui-bg-red-bg ui-outline-1",
        type === "warning" && "ui-outline-orange ui-bg-orange-bg ui-outline-1",
        type === "info" && "ui-outline-blue ui-bg-blue-bg ui-outline-1",
        type === "info-border" && "ui-border-l-4 ui-border-l-blue ui-outline-0 ui-bg-primary-bg ui-pl-4",
        className
      )}
    >
      {withIcon && (
        <div
          className={clsx(
            "ui-flex ui-justify-center ui-flex-shrink-0 ui-items-stretch",
            type === "success" && "ui-text-green",
            type === "error" && "ui-text-red-light",
            type === "warning" && "ui-text-orange",
            type === "info" && "ui-text-blue",
            type === "info-border" && "ui-text-blue",
          )}
        >
          {iconsMap[type]}
        </div>
      )}
      <div className="ui-flex ui-items-center">{text}</div>
    </div>
  );
}
