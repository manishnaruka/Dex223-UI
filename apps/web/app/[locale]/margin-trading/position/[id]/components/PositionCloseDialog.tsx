import Image from "next/image";
import React from "react";

import { MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import usePositionClose from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionClose";
import usePositionWithdraw from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionWithdraw";
import {
  PositionCloseStatus,
  usePositionCloseStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionCloseStatusStore";
import {
  PositionWithdrawStatus,
  useWithdrawPositionStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionWithdrawStatusStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Button from "@/components/buttons/Button";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { IconName } from "@/config/types/IconName";

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
  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Close margin position" />
      <div className="w-[1200px] card-spacing-x card-spacing-b">
        <div className="grid gap-5 grid-cols-[1fr_380px]">
          <div>
            <div className="flex items-center gap-2">
              <Image alt="" src="/images/tokens/placeholder.svg" width={32} height={32} />
              {position.loanAsset.symbol}

              <div className="flex items-center gap-3 text-green">
                Completed
                <div className="w-2 h-2 rounded-full bg-green"></div>
              </div>
            </div>
            <PositionCloseActionButton position={position} />
          </div>
          <div className="px-5 py-4 bg-tertiary-bg rounded-3">Action with assets</div>
        </div>
      </div>
    </DrawerDialog>
  );
}
