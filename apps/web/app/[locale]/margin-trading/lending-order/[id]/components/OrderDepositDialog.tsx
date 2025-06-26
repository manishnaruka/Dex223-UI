import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import useOrderDeposit from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderDeposit";
import {
  OrderDepositStatus,
  useDepositOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useDepositOrderStatusStore";
import { ReadonlyTokenAmountCard } from "@/app/[locale]/swap/components/ConfirmConvertDialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input from "@/components/atoms/Input";
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
  pending: OrderDepositStatus;
  loading: OrderDepositStatus;
  error: OrderDepositStatus;
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
    pending: OrderDepositStatus.PENDING_APPROVE,
    loading: OrderDepositStatus.LOADING_APPROVE,
    error: OrderDepositStatus.ERROR_APPROVE,
    textMap: getApproveTextMap("DAI"),
  },
  {
    iconName: "deposit",
    pending: OrderDepositStatus.PENDING_DEPOSIT,
    loading: OrderDepositStatus.LOADING_DEPOSIT,
    error: OrderDepositStatus.ERROR_DEPOSIT,
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

function OrderDepositActionButton({
  orderId,
  order,
  amountToApprove,
  amountToDeposit,
}: {
  orderId: number;
  order: LendingOrder;
  amountToApprove: string;
  amountToDeposit: string;
}) {
  const { handleOrderDeposit } = useOrderDeposit({
    orderId,
    currency: order.baseAsset,
    amount: amountToDeposit,
  });

  const { status, approveHash, depositHash } = useDepositOrderStatusStore();

  if (status !== OrderDepositStatus.INITIAL) {
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
              successStep: OrderDepositStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handleOrderDeposit(amountToApprove)} fullWidth>
      Deposit {order.baseAsset.symbol}
    </Button>
  );
}

export default function OrderDepositDialog({
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
  const [isEditApproveActive, setEditApproveActive] = useState(false);
  const {
    balance: { erc20Balance: tokenA0Balance, erc223Balance: tokenA1Balance },
    refetch: refetchABalance,
  } = useTokenBalances(order.baseAsset);

  const { status, setStatus } = useDepositOrderStatusStore();
  const [amountToDeposit, setAmountToDeposit] = useState("");

  const [amountToApprove, setAmountToApprove] = useState("");

  const [isAmountToApproveModified, setAmountToApproveModified] = useState(false);
  // useEffect(() => {
  //   if (
  //     parseUnits(amountToApprove, order.baseAsset.decimals) <
  //     parseUnits(amountToDeposit, order.baseAsset.decimals)
  //   ) {
  //     setAmountToApprove(amountToDeposit);
  //   }
  // }, [amountToApprove, amountToDeposit, order.baseAsset.decimals]);

  useEffect(() => {
    if (
      (status === OrderDepositStatus.ERROR_APPROVE ||
        status === OrderDepositStatus.ERROR_DEPOSIT ||
        status === OrderDepositStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(OrderDepositStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);
  console.log(order);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Deposit" />
      <div className="w-[600px] card-spacing-x card-spacing-b">
        {status === OrderDepositStatus.INITIAL ? (
          <>
            <p className="text-secondary-text mb-4">
              You will increase the available balance of your lending order by making a deposit
            </p>
            <InputLabel label="Deposit amount" tooltipText="Tooltip text" />
            <TokenInput
              handleClick={() => null}
              token={order.baseAsset}
              value={amountToDeposit}
              onInputChange={(value) => {
                setAmountToDeposit(value);
                if (
                  parseUnits(value, order.baseAsset.decimals) >
                    parseUnits(amountToApprove, order.baseAsset.decimals) ||
                  !isAmountToApproveModified
                ) {
                  setAmountToApprove(value);
                  setAmountToApproveModified(false);
                }
              }}
              balance0={
                tokenA0Balance && Boolean(tokenA0Balance.value)
                  ? formatFloat(tokenA0Balance.formatted)
                  : "0"
              }
              balance1={
                tokenA1Balance && Boolean(tokenA1Balance.value)
                  ? formatFloat(tokenA1Balance.formatted)
                  : "0"
              }
              standard={Standard.ERC20}
              setStandard={() => null}
            />

            {order.baseAsset.isToken ? (
              <div
                className={clsx(
                  "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5",
                  parseUnits(amountToApprove, order.baseAsset.decimals) <
                    parseUnits(amountToDeposit, order.baseAsset.decimals) && "pb-[26px]",
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
                      {amountToApprove ? `${amountToApprove} ${order.baseAsset.symbol}` : "—"}
                    </span>
                  ) : (
                    <div className="flex-grow">
                      <div className="relative w-full flex-grow">
                        <Input
                          isError={
                            parseUnits(amountToApprove, order.baseAsset.decimals) <
                            parseUnits(amountToDeposit, order.baseAsset.decimals)
                          }
                          className="h-8 pl-3"
                          value={amountToApprove}
                          onChange={(e) => setAmountToApprove(e.target.value)}
                          type="text"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                          {order.baseAsset.symbol}
                        </span>
                      </div>
                      {parseUnits(amountToApprove, order.baseAsset.decimals) <
                        parseUnits(amountToDeposit, order.baseAsset.decimals) && (
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
                        parseUnits(amountToApprove, order.baseAsset.decimals) <
                        parseUnits(amountToDeposit, order.baseAsset.decimals)
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

        <OrderDepositActionButton
          orderId={orderId}
          order={order}
          amountToApprove={amountToApprove}
          amountToDeposit={amountToDeposit}
        />
      </div>
    </DrawerDialog>
  );
}
