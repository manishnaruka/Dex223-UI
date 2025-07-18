import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";

import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import useOrderDeposit from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderDeposit";
import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import { OrderWithdrawStatus } from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useWithdrawOrderStatusStore";
import usePositionDeposit from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionDeposit";
import {
  PositionDepositStatus,
  useDepositPositionStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionDepositStatusStore";
import { PositionWithdrawStatus } from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionWithdrawStatusStore";
import { ReadonlyTokenAmountCard } from "@/app/[locale]/swap/components/ConfirmConvertDialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import TokenInput from "@/components/common/TokenInput";
import { IconName } from "@/config/types/IconName";
import { formatFloat } from "@/functions/formatFloat";
import useTokenBalances from "@/hooks/useTokenBalances";
import { Standard } from "@/sdk_bi/standard";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: PositionDepositStatus;
  loading: PositionDepositStatus;
  error: PositionDepositStatus;
};

function getApproveTextMap(tokenSymbol: string): Record<OperationStepStatus, string> {
  return {
    [OperationStepStatus.IDLE]: `Approve ${tokenSymbol}`,
    [OperationStepStatus.AWAITING_SIGNATURE]: `Approve ${tokenSymbol}`,
    [OperationStepStatus.LOADING]: `Approving ${tokenSymbol}`,
    [OperationStepStatus.STEP_COMPLETED]: `Approved ${tokenSymbol}`,
    [OperationStepStatus.STEP_FAILED]: `Approve ${tokenSymbol} failed`,
    [OperationStepStatus.OPERATION_COMPLETED]: `Approved ${tokenSymbol}`,
  };
}

const depositOrderSteps: OperationStepConfig[] = [
  {
    iconName: "done",
    pending: PositionDepositStatus.PENDING_APPROVE,
    loading: PositionDepositStatus.LOADING_APPROVE,
    error: PositionDepositStatus.ERROR_APPROVE,
    textMap: getApproveTextMap("DAI"),
  },
  {
    iconName: "deposit",
    pending: PositionDepositStatus.PENDING_DEPOSIT,
    loading: PositionDepositStatus.LOADING_DEPOSIT,
    error: PositionDepositStatus.ERROR_DEPOSIT,
    textMap: {
      [OperationStepStatus.IDLE]: "Deposit funds",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Deposit funds",
      [OperationStepStatus.LOADING]: "Executing deposit",
      [OperationStepStatus.STEP_COMPLETED]: "Deposited funds",
      [OperationStepStatus.STEP_FAILED]: "Failed to deposit funds",
      [OperationStepStatus.OPERATION_COMPLETED]: "Deposited funds",
    },
  },
];

function PositionDepositActionButton({
  position,
  amountToApprove,
  amountToDeposit,
}: {
  position: MarginPosition;
  amountToApprove: string;
  amountToDeposit: string;
}) {
  const { handlePositionDeposit } = usePositionDeposit({
    position: position,
    currency: position.loanAsset,
    amount: amountToDeposit,
  });

  const { status, approveHash, depositHash } = useDepositPositionStatusStore();

  if (status !== PositionDepositStatus.INITIAL) {
    return (
      <OperationRows>
        {depositOrderSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[approveHash, depositHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: depositOrderSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: PositionDepositStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handlePositionDeposit(amountToApprove)} fullWidth>
      Deposit {position.loanAsset.symbol}
    </Button>
  );
}

export default function PositionDepositDialog({
  isOpen,
  setIsOpen,
  position,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: MarginPosition;
}) {
  const [isEditApproveActive, setEditApproveActive] = useState(false);

  const { status, setStatus } = useDepositPositionStatusStore();
  const [amountToDeposit, setAmountToDeposit] = useState("");

  const [amountToApprove, setAmountToApprove] = useState("");

  const [isAmountToApproveModified, setAmountToApproveModified] = useState(false);

  const isInitialStatus = useMemo(() => status === PositionDepositStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () =>
      status === PositionDepositStatus.SUCCESS ||
      status === PositionDepositStatus.ERROR_DEPOSIT ||
      status === PositionDepositStatus.ERROR_APPROVE,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  useEffect(() => {
    if (isFinalStatus && !isOpen) {
      setTimeout(() => {
        setStatus(PositionDepositStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Deposit" />
      <div className="w-[600px] card-spacing-x card-spacing-b">
        {isInitialStatus && (
          <>
            <p className="text-secondary-text mb-4">
              You will increase the available balance of your lending order by making a deposit
            </p>
            <InputLabel label="Deposit amount" tooltipText="Tooltip text" />
            <TokenInput
              handleClick={() => null}
              token={position.loanAsset}
              value={amountToDeposit}
              onInputChange={(value) => {
                setAmountToDeposit(value);
                if (
                  parseUnits(value, position.loanAsset.decimals) >
                    parseUnits(amountToApprove, position.loanAsset.decimals) ||
                  !isAmountToApproveModified
                ) {
                  setAmountToApprove(value);
                  setAmountToApproveModified(false);
                }
              }}
              balance0={"0"}
              balance1={"0"}
              standard={Standard.ERC20}
              setStandard={() => null}
            />

            {position.loanAsset.isToken ? (
              <div
                className={clsx(
                  "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5",
                  parseUnits(amountToApprove, position.loanAsset.decimals) <
                    parseUnits(amountToDeposit, position.loanAsset.decimals) && "pb-[26px]",
                )}
              >
                <div className="flex items-center gap-1 text-secondary-text whitespace-nowrap">
                  <Tooltip
                    iconSize={20}
                    text={
                      "In order to make a swap with ERC-20 token you need to give the DEX contract permission to withdraw your tokens. All DEX'es require this operation. Here you are specifying the amount of tokens that you allow the contract to transfer on your behalf. Note that this amount never expires."
                    }
                  />
                  <span className="text-14">Approve amount</span>
                </div>
                <div className="flex items-center gap-2 flex-grow justify-end">
                  {!isEditApproveActive ? (
                    <span className="text-14">
                      {amountToApprove ? `${amountToApprove} ${position.loanAsset.symbol}` : "—"}
                    </span>
                  ) : (
                    <div className="flex-grow">
                      <div className="relative w-full flex-grow">
                        <Input
                          isError={
                            parseUnits(amountToApprove, position.loanAsset.decimals) <
                            parseUnits(amountToDeposit, position.loanAsset.decimals)
                          }
                          className="h-8 pl-3"
                          value={amountToApprove}
                          onChange={(e) => setAmountToApprove(e.target.value)}
                          type="text"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                          {position.loanAsset.symbol}
                        </span>
                      </div>
                      {parseUnits(amountToApprove, position.loanAsset.decimals) <
                        parseUnits(amountToDeposit, position.loanAsset.decimals) && (
                        <span className="text-red-light absolute text-12 translate-y-0.5">
                          Must be higher or equal {amountToDeposit}
                        </span>
                      )}
                    </div>
                  )}
                  {!isEditApproveActive ? (
                    <Button
                      size={ButtonSize.EXTRA_SMALL}
                      colorScheme={ButtonColor.LIGHT_GREEN}
                      onClick={() => setEditApproveActive(true)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      disabled={
                        parseUnits(amountToApprove, position.loanAsset.decimals) <
                        parseUnits(amountToDeposit, position.loanAsset.decimals)
                      }
                      size={ButtonSize.EXTRA_SMALL}
                      colorScheme={ButtonColor.LIGHT_GREEN}
                      onClick={() => {
                        setEditApproveActive(false);
                        setAmountToApproveModified(true);
                      }}
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
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
          </>
        )}

        {isLoadingStatus && (
          <>
            <ReadonlyTokenAmountCard
              token={position.loanAsset}
              amount={"Unknown"}
              amountUSD={"0"}
              standard={Standard.ERC20}
              title={"Withdraw amount"}
            />
            <div className="h-px bg-secondary-border my-4" />
          </>
        )}

        {isFinalStatus && (
          <div className="pb-1">
            <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
              {status === PositionDepositStatus.ERROR_DEPOSIT && (
                <EmptyStateIcon iconName="warning" />
              )}

              {status === PositionDepositStatus.SUCCESS && (
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

            {status === PositionDepositStatus.SUCCESS && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 ">Successfully deposited</h2>
                <p className="text-center mb-1">
                  {amountToDeposit} {position.loanAsset.symbol}
                </p>
              </div>
            )}
            <div className="my-4 border-b border-secondary-border w-full" />
          </div>
        )}

        <PositionDepositActionButton
          position={position}
          amountToApprove={amountToApprove}
          amountToDeposit={amountToDeposit}
        />
      </div>
    </DrawerDialog>
  );
}
