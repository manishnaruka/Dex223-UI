import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import React, { useMemo } from "react";
import SimpleBar from "simplebar-react";
import { formatEther, formatGwei, formatUnits } from "viem";

import usePositionClose from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionClose";
import {
  PositionCloseStatus,
  usePositionCloseStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionCloseStatusStore";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { InputSize } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import RadioButton from "@/components/buttons/RadioButton";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { IconName } from "@/config/types/IconName";
import { formatFloat } from "@/functions/formatFloat";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: PositionCloseStatus;
  loading: PositionCloseStatus;
  error: PositionCloseStatus;
};

const closePositionSteps: OperationStepConfig[] = [
  {
    iconName: "closed",
    pending: PositionCloseStatus.PENDING_CLOSE,
    loading: PositionCloseStatus.LOADING_CLOSE,
    error: PositionCloseStatus.ERROR_CLOSE,
    textMap: {
      [OperationStepStatus.IDLE]: "Close margin position",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Close margin position",
      [OperationStepStatus.LOADING]: "Closing margin position",
      [OperationStepStatus.STEP_COMPLETED]: "Margin position closed successfully",
      [OperationStepStatus.STEP_FAILED]: "Failed to close margin position",
      [OperationStepStatus.OPERATION_COMPLETED]: "Withdrawn funds",
    },
  },
];

function PositionCloseActionButton({ position }: { position: MarginPosition }) {
  const { handlePositionClose } = usePositionClose({
    position,
  });

  const { status, positionCloseHash } = usePositionCloseStatusStore();

  if (status !== PositionCloseStatus.INITIAL) {
    return (
      <OperationRows>
        {closePositionSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[positionCloseHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: closePositionSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: PositionCloseStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handlePositionClose()} fullWidth>
      Close margin position
    </Button>
  );
}

export default function PositionCloseDialog({
  isOpen,
  setIsOpen,
  position,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: MarginPosition;
}) {
  const { status } = usePositionCloseStatusStore();

  const isInitialStatus = useMemo(() => status === PositionCloseStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === PositionCloseStatus.SUCCESS || status === PositionCloseStatus.ERROR_CLOSE,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Close margin position" />
      <div
        className={clsx(
          " card-spacing-x card-spacing-b",
          isInitialStatus ? "w-[1200px]" : "w-[800px]",
        )}
      >
        <div
          className={clsx("grid gap-5", isInitialStatus ? "grid-cols-[1fr_380px]" : "grid-cols-1")}
        >
          <div>
            <div className="bg-quaternary-bg rounded-3 grid grid-cols-4 text-tertiary-text py-3.5 px-5">
              <div className="py-1">Assets</div>
              <div className="py-1">Action</div>
              <div className="py-1">Description</div>
              <div className="py-1">Will be delivered</div>
            </div>

            <SimpleBar style={{ height: 332 }}>
              <div className="rounded-3 grid grid-cols-4 text-secondary-text py-3.5 px-5">
                <div className="py-1">
                  <span className="text-primary-text">
                    {formatUnits(position.loanAmount, position.loanAsset.decimals)}
                  </span>{" "}
                  {position.loanAsset.symbol}
                </div>
                <div className="py-1">
                  <span className="text-primary-text">
                    {formatUnits(position.loanAmount, position.loanAsset.decimals)}
                  </span>{" "}
                  {position.loanAsset.symbol}
                </div>
                <div className="py-1">Loan, Interest</div>
                <div className="py-1">Lender</div>
              </div>

              <div className="bg-quaternary-bg rounded-3 grid grid-cols-4 text-secondary-text py-3.5 px-5">
                <div className="py-1">
                  <span className="text-primary-text">
                    {position.order.liquidationRewardAmount.formatted}
                  </span>{" "}
                  {position.order.liquidationRewardAsset.symbol}
                </div>
                <div className="py-1">
                  <span className="text-green">
                    {position.order.liquidationRewardAmount.formatted}
                  </span>{" "}
                  {position.order.liquidationRewardAsset.symbol}
                </div>
                <div className="py-1">Fee for liquidator</div>
                <div className="py-1">Your address</div>
              </div>

              {position.assetsWithBalances.map(({ asset, balance }, index) => (
                <div
                  key={asset.wrapped.address0}
                  className={clsx(
                    "rounded-3 grid grid-cols-4 text-secondary-text py-3.5 px-5",
                    index % 2 !== 0 && "bg-quaternary-bg",
                  )}
                >
                  <div className="py-1">
                    <span className="text-primary-text">
                      {balance ? formatUnits(balance, asset.decimals) : "Loading..."}
                    </span>{" "}
                    {asset.symbol}
                  </div>
                  <div className="py-1">
                    <span className="text-green">{0}</span> {asset.symbol}
                  </div>
                  <div className="py-1">Borrower’s earned</div>
                  <div className="py-1">Your address</div>
                </div>
              ))}
            </SimpleBar>

            {/*<div className="flex items-center gap-2">*/}
            {/*  <Image alt="" src="/images/tokens/placeholder.svg" width={32} height={32} />*/}
            {/*  {position.loanAsset.symbol}*/}

            {/*  <div className="flex items-center gap-3 text-green">*/}
            {/*    Completed*/}
            {/*    <div className="w-2 h-2 rounded-full bg-green"></div>*/}
            {/*  </div>*/}
            {/*</div>*/}
            {isInitialStatus && (
              <div className="mt-5 bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
                <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas price:</span>
                    <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
                  </p>

                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas limit:</span>
                    <span>{329000}</span>
                  </p>
                  <p className="flex flex-col">
                    <span className="text-tertiary-text">Network fee:</span>
                    <span>{formatFloat(formatEther(BigInt(0) * BigInt(0), "wei"))} ETH</span>
                  </p>
                </div>
                <div className="grid grid-cols-[auto_1fr] xs:flex xs:items-center gap-2 w-full xs:w-auto mt-2 xs:mt-0">
                  <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border max-xs:h-8">
                    Cheaper
                  </span>
                  <Button
                    colorScheme={ButtonColor.LIGHT_GREEN}
                    size={ButtonSize.EXTRA_SMALL}
                    onClick={() => null}
                    fullWidth={false}
                    className="rounded-5"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}

            {!isInitialStatus && <div className="my-4 h-px bg-secondary-border w-full" />}
            <PositionCloseActionButton position={position} />
          </div>
          {isInitialStatus && (
            <div className="flex flex-col">
              <div className="px-5 py-4 bg-tertiary-bg rounded-3 mb-5">
                <p className="text-tertiary-text flex items-center gap-1">
                  You receive <Tooltip iconSize={20} text="Tooltip text" />
                </p>
                <p className="text-20 font-medium">
                  5000 <span className="text-secondary-text">USDT</span>
                </p>
              </div>

              <div className="px-5 py-4 bg-tertiary-bg rounded-3 flex-grow">
                <div className="mb-4 flex flex-col gap-1">
                  <InputLabel label="Action with assets" />
                  <div className="flex flex-col gap-3">
                    <RadioButton className="w-full h-10 py-2 min-h-10" isActive={true}>
                      Return assets to contract
                    </RadioButton>
                    <RadioButton isActive={false} className="w-full h-10 py-2 min-h-10" disabled>
                      Send to address
                    </RadioButton>
                  </div>
                </div>
                <div className="mb-4 flex flex-col gap-1">
                  <InputLabel label="Send to" />
                  <div className="flex flex-col gap-3">
                    <RadioButton className="w-full h-10 py-2 min-h-10" isActive={true}>
                      Margin position owner&apos;s address
                    </RadioButton>
                    <RadioButton isActive={false} className="w-full h-10 py-2 min-h-10" disabled>
                      Other address
                    </RadioButton>
                  </div>
                </div>
                <TextField
                  inputSize={InputSize.DEFAULT}
                  label="Address to send assets"
                  tooltipText="TOOLTIP_TEXT"
                  placeholder="0x..."
                />
              </div>
            </div>
          )}
          {isFinalStatus && (
            <div className="pb-1">
              <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                {status === PositionCloseStatus.ERROR_CLOSE && (
                  <EmptyStateIcon iconName="warning" />
                )}

                {status === PositionCloseStatus.SUCCESS && (
                  <>
                    <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />
                    <Svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                      iconName={"success"}
                      size={65}
                    />
                  </>
                )}
              </div>

              {status === PositionCloseStatus.SUCCESS && (
                <div>
                  <h2 className="text-center mb-1 font-bold text-20 ">
                    Margin position closed successfully
                  </h2>
                  <p className="text-center mb-1">
                    {position.loanAsset.symbol}{" "}
                    <span className="text-secondary-text">({position.id})</span>
                  </p>
                </div>
              )}
              <div className="my-4 border-b border-secondary-border w-full" />
            </div>
          )}
        </div>
      </div>
    </DrawerDialog>
  );
}
