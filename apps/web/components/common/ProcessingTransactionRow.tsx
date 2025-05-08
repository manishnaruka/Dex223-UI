import Preloader from "@repo/ui/src/components/Preloader";
import clsx from "clsx";
import React from "react";

import Svg from "@/components/atoms/Svg";
import IconButton from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";

export enum TxStepStatus {
  IDLE,
  PENDING,
  LOADING,
  SUCCESS,
  ERROR,
}

export type TxStep = {
  key: string;
  hash?: string;
  status: TxStepStatus;
  error?: string;
};

export type TxFlow = {
  steps: TxStep[];
  currentStep: number;
};

export function TxStepRow({
  status,
  hash,
  isActive,
}: {
  status: TxStepStatus;
  hash?: string;
  isActive: boolean;
}) {
  const chainId = useCurrentChainId();

  const icon = {
    [TxStepStatus.IDLE]: null,
    [TxStepStatus.PENDING]: (
      <>
        <Preloader type="linear" />
        <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
      </>
    ),
    [TxStepStatus.LOADING]: <Preloader size={20} />,
    [TxStepStatus.SUCCESS]: <Svg className="text-green" iconName="done" size={20} />,
    [TxStepStatus.ERROR]: <Svg className="text-red-light" iconName="warning" size={20} />,
  }[status];

  const text = {
    [TxStepStatus.IDLE]: "Confirm conversion",
    [TxStepStatus.PENDING]: "Confirm conversion",
    [TxStepStatus.LOADING]: "Conversion in progress",
    [TxStepStatus.SUCCESS]: "Conversion failed",
    [TxStepStatus.ERROR]: "Conversion completed",
  };

  return (
    <div className="grid grid-cols-[32px_auto_1fr] gap-2 h-10">
      <div className="flex items-center h-full">
        <div
          className={clsxMerge(
            "p-1 rounded-full h-8 w-8",
            !isActive ? "bg-tertiary-bg" : "bg-green-bg",
            status === TxStepStatus.ERROR && "bg-red-bg",
          )}
        >
          <Svg
            className={clsxMerge(
              !isActive ? "text-tertiary-text" : "text-green",
              status === TxStepStatus.ERROR && "text-red-light",
            )}
            iconName="convert"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={clsx("text-14", !isActive ? "text-tertiary-text" : "text-primary-text")}>
          {text}
        </span>
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a target="_blank" href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, chainId)}>
            <IconButton iconName="forward" />
          </a>
        )}
        {icon}
      </div>
    </div>
  );
}
