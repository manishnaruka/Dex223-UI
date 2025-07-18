import React, { useEffect, useMemo, useState } from "react";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import useOrderDeposit from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderDeposit";
import useOrderWithdraw from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderWithdraw";
import { OrderCloseStatus } from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useCloseOrderStatusStore";
import {
  OrderWithdrawStatus,
  useWithdrawOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useWithdrawOrderStatusStore";
import { ReadonlyTokenAmountCard } from "@/app/[locale]/swap/components/ConfirmConvertDialog";
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

function OrderWithdrawActionButton({
  orderId,
  order,
  amountToWithdraw,
  disabled = false,
}: {
  orderId: number;
  order: LendingOrder;
  amountToWithdraw: string;
  disabled?: boolean;
}) {
  const { handleOrderWithdraw } = useOrderWithdraw({
    orderId,
    amountToWithdraw,
    currency: order.baseAsset,
  });

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
    <Button disabled={disabled} onClick={() => handleOrderWithdraw()} fullWidth>
      Withdraw
    </Button>
  );
}

export default function OrderWithdrawDialog({
  isOpen,
  setIsOpen,
  orderId,
  order,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  orderId: number;
  order: LendingOrder;
}) {
  const { status, setStatus } = useWithdrawOrderStatusStore();

  const [amountToWithdraw, setAmountToWithdraw] = useState<string>("");

  const isInitialStatus = useMemo(() => status === OrderWithdrawStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === OrderWithdrawStatus.SUCCESS || status === OrderWithdrawStatus.ERROR_WITHDRAW,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

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

  const error = useMemo(() => {
    if (parseUnits(amountToWithdraw, order.baseAsset.decimals) > order.balance)
      return `Maximum withdraw amount: ${formatUnits(order.balance, order.baseAsset.decimals)}`;
  }, [amountToWithdraw, order.balance, order.baseAsset.decimals]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Deposit" />
      <div className="w-[600px] card-spacing-x card-spacing-b">
        {isInitialStatus && (
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
              value={amountToWithdraw}
              onChange={(e) => setAmountToWithdraw(e.target.value)}
              helperText={`Maximum withdraw amount: ${formatUnits(order.balance, order.baseAsset.decimals)}`}
              error={error}
            />

            <div className="mt-3" />
            <InputLabel
              inputSize={InputSize.LARGE}
              label="Withdraw limit"
              tooltipText="Tooltip text"
            />
            <div className="pt-4 pb-5 px-5 rounded-4 bg-tertiary-bg mb-4">
              <p className="mb-2">
                No limit
                {/*1000 / 1200 <span className="text-secondary-text">USDT</span>*/}
              </p>
              <div className="rounded-20 h-3 bg-secondary-bg w-full">
                <div
                  className="rounded-20 h-3 bg-gradient-progress-bar-green"
                  style={{ width: `${100}%` }}
                />
              </div>
            </div>

            <div className="mb-5 ">
              <InputLabel
                inputSize={InputSize.LARGE}
                label="Standard for USDT"
                tooltipText="Tooltip text"
              />
              <div className="grid grid-cols-2 gap-3">
                <RadioButton className="min-h-10 py-2" isActive>
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
        )}
        {isFinalStatus && (
          <div className="pb-1">
            <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
              {status === OrderWithdrawStatus.ERROR_WITHDRAW && (
                <EmptyStateIcon iconName="warning" />
              )}

              {status === OrderWithdrawStatus.SUCCESS && (
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

            {status === OrderWithdrawStatus.SUCCESS && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 ">Successfully withdrawn</h2>
                <p className="text-center mb-1">
                  {amountToWithdraw} {order.baseAsset.symbol}
                </p>
              </div>
            )}
            <div className="my-4 border-b border-secondary-border w-full" />
          </div>
        )}
        {isLoadingStatus && (
          <>
            <ReadonlyTokenAmountCard
              token={order.baseAsset}
              amount={amountToWithdraw}
              amountUSD={"0"}
              standard={Standard.ERC20}
              title={"Withdraw amount"}
            />
            <div className="h-px bg-secondary-border my-4" />
          </>
        )}
        <OrderWithdrawActionButton
          disabled={!!error}
          orderId={orderId}
          order={order}
          amountToWithdraw={amountToWithdraw}
        />
      </div>
    </DrawerDialog>
  );
}
