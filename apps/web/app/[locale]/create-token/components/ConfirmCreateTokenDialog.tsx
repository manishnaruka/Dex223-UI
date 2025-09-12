import React, { useEffect, useMemo } from "react";

import useCreateToken from "@/app/[locale]/create-token/hooks/useCreateToken";
import { useCreateTokenDialogStore } from "@/app/[locale]/create-token/hooks/useCreateTokenDialogStore";
import {
  CreateTokenStatus,
  useCreateTokenStatusStore,
} from "@/app/[locale]/create-token/stores/useCreateTokenStatusStore";
import SwapDetailsRow from "@/app/[locale]/swap/components/SwapDetailsRow";
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
  pending: CreateTokenStatus;
  loading: CreateTokenStatus;
  error: CreateTokenStatus;
};

function composeCreateTokensSteps(): OperationStepConfig[] {
  return [
    {
      iconName: "deploy-token",
      pending: CreateTokenStatus.PENDING_CREATE_TOKEN,
      loading: CreateTokenStatus.LOADING_CREATE_TOKEN,
      error: CreateTokenStatus.ERROR_CREATE_TOKEN,
      textMap: {
        [OperationStepStatus.IDLE]: "Create new token",
        [OperationStepStatus.AWAITING_SIGNATURE]: "Confirm token creation",
        [OperationStepStatus.LOADING]: "Executing token creation",
        [OperationStepStatus.STEP_COMPLETED]: "Token created",
        [OperationStepStatus.STEP_FAILED]: "Failed to create token",
        [OperationStepStatus.OPERATION_COMPLETED]: "Token created",
      },
    },
  ];
}

function CreateTokenActionButton({
  handleCreateToken,
}: {
  handleCreateToken: () => Promise<void>;
}) {
  const { status, createTokenHash } = useCreateTokenStatusStore();

  if (status !== CreateTokenStatus.INITIAL) {
    return (
      <OperationRows>
        {composeCreateTokensSteps().map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={createTokenHash}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: composeCreateTokensSteps().flatMap((s) => [
                s.pending,
                s.loading,
                s.error,
              ]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: CreateTokenStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handleCreateToken()} fullWidth>
      Create token
    </Button>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-tertiary-bg rounded-3 flex flex-col gap-1 px-5 py-4 text-14">
      <span className="text-secondary-text">{title}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default function ConfirmCreateTokenDialog({
  createTokenSettings,
}: {
  createTokenSettings: {
    name: string;
    symbol: string;
    totalSupply: string;
    imageURL: string;
    allowMintForOwner: boolean;
    createERC20: boolean;
  };
}) {
  const { isOpen, setIsOpen } = useCreateTokenDialogStore();
  const { status, setStatus } = useCreateTokenStatusStore();
  const { handleCreateToken } = useCreateToken(createTokenSettings);
  const isInitialStatus = useMemo(() => status === CreateTokenStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === CreateTokenStatus.SUCCESS || status === CreateTokenStatus.ERROR_CREATE_TOKEN,
    [status],
  );

  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  useEffect(() => {
    if (isFinalStatus && !isOpen) {
      setTimeout(() => {
        setStatus(CreateTokenStatus.INITIAL);
      }, 400);
    }
  }, [isFinalStatus, isOpen, setStatus, status]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Deposit" />
      <div className="w-[600px] card-spacing-x card-spacing-b">
        {isInitialStatus && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Card title="Name" value={createTokenSettings.name} />
              <Card title="Symbol" value={createTokenSettings.symbol} />
            </div>

            <div className="rounded-3 bg-tertiary-bg px-5 py-4 flex justify-between">
              <span className="text-14 text-secondary-text">Total supply</span>

              <div className="flex items-center gap-1">
                <span>{createTokenSettings.totalSupply}</span>
                <span className="text-14 text-secondary-text">{createTokenSettings.symbol}</span>
              </div>
            </div>

            <SwapDetailsRow
              title="New tokens issuing"
              value={createTokenSettings.allowMintForOwner ? "Allowed" : "Not allowed"}
              tooltipText="Tooltip text"
            />
            <SwapDetailsRow
              title="Make ERC-20 version"
              value={createTokenSettings.createERC20 ? "Yes" : "No"}
              tooltipText="Tooltip text"
            />
          </div>
        )}

        {isLoadingStatus && <>loading state</>}

        {isFinalStatus && <>final state</>}

        <CreateTokenActionButton handleCreateToken={handleCreateToken} />
      </div>
    </DrawerDialog>
  );
}
