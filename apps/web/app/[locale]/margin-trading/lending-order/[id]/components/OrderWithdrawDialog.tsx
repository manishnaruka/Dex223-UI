import React, { useEffect } from "react";
import { formatEther, formatGwei } from "viem";

import useOrderDeposit from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderDeposit";
import useOrderWithdraw from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderWithdraw";
import {
  OrderWithdrawStatus,
  useWithdrawOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useWithdrawOrderStatusStore";
import { ReadonlyTokenAmountCard } from "@/app/[locale]/swap/components/ConfirmConvertDialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { InputSize } from "@/components/atoms/Input";
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
import { Standard } from "@/sdk_bi/standard";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: OrderWithdrawStatus;
  loading: OrderWithdrawStatus;
  error: OrderWithdrawStatus;
};

const withdrawOrderSteps: OperationStepConfig[] = [
  {
    iconName: "withdraw",
    pending: OrderWithdrawStatus.PENDING_WITHDRAW,
    loading: OrderWithdrawStatus.LOADING_WITHDRAW,
    error: OrderWithdrawStatus.ERROR_WITHDRAW,
    textMap: {
      [OperationStepStatus.IDLE]: "Withdraw assets",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Confirm withdraw",
      [OperationStepStatus.LOADING]: "Executing withdraw",
      [OperationStepStatus.STEP_COMPLETED]: "Successfully withdrawn",
      [OperationStepStatus.STEP_FAILED]: "Failed to withdraw",
      [OperationStepStatus.OPERATION_COMPLETED]: "Successfully withdrawn",
    },
  },
];

function OrderWithdrawActionButton({ orderId }: { orderId: number }) {
  const { handleOrderWithdraw } = useOrderWithdraw({ orderId });

  const { status, withdrawHash } = useWithdrawOrderStatusStore();

  if (status !== OrderWithdrawStatus.INITIAL) {
    return (
      <OperationRows>
        {withdrawOrderSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[withdrawHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: withdrawOrderSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: OrderWithdrawStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handleOrderWithdraw()} fullWidth>
      Withdraw
    </Button>
  );
}

export default function OrderWithdrawDialog({
  isOpen,
  setIsOpen,
  orderId,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  orderId: number;
}) {
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);

  const { status, setStatus } = useWithdrawOrderStatusStore();

  useEffect(() => {
    if (
      (status === OrderWithdrawStatus.ERROR_WITHDRAW || status === OrderWithdrawStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(OrderWithdrawStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Deposit" />
      <div className="w-[600px] card-spacing-x card-spacing-b">
        {status === OrderWithdrawStatus.INITIAL ? (
          <>
            <p className="text-secondary-text mb-4">
              You are withdrawing funds from your available balance, which decreases the amount that
              new borrowers can borrow
            </p>
            <TextField
              label="Withdraw amount"
              tooltipText="Tooltip text"
              internalText="USDT"
              placeholder="Withdraw amount"
            />

            <InputLabel
              inputSize={InputSize.LARGE}
              label="Withdraw limit"
              tooltipText="Tooltip text"
            />
            <div className="pt-4 pb-5 px-5 rounded-4 bg-tertiary-bg mb-4">
              <p className="mb-2">
                1000 / 1200 <span className="text-secondary-text">USDT</span>
              </p>
              <div className="rounded-20 h-3 bg-secondary-bg w-full">
                <div
                  className="rounded-20 h-3 bg-gradient-progress-bar-yellow"
                  style={{ width: `${30}%` }}
                />
              </div>
            </div>

            <div className="mb-5">
              <InputLabel
                inputSize={InputSize.LARGE}
                label="Standard for USDT"
                tooltipText="Tooltip text"
              />
              <div className="grid grid-cols-2 gap-3">
                <RadioButton className="min-h-10 py-2" isActive={false}>
                  {Standard.ERC20}
                </RadioButton>
                <RadioButton className="min-h-10 py-2" isActive={false}>
                  {Standard.ERC223}
                </RadioButton>
              </div>
            </div>

            <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
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
          </>
        ) : (
          <>
            <ReadonlyTokenAmountCard
              token={undefined}
              amount={"12"}
              amountUSD={""}
              standard={Standard.ERC223}
              title={"Deposit amount"}
            />
            <div className="h-px bg-secondary-border my-4" />
          </>
        )}
        <OrderWithdrawActionButton orderId={orderId} />
      </div>
    </DrawerDialog>
  );
}
