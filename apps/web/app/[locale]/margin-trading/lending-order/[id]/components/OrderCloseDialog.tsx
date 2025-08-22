import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import { formatEther, formatGwei, formatUnits } from "viem";

import timestampToDateString from "@/app/[locale]/margin-trading/helpers/timestampToDateString";
import calculateTotalOrderBalance from "@/app/[locale]/margin-trading/lending-order/[id]/helpers/calculateTotalOrderBalance";
import useOrderClose from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderClose";
import {
  OrderCloseStatus,
  useCloseOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/stores/useCloseOrderStatusStore";
import { LendingOrder } from "@/app/[locale]/margin-trading/types";
import SwapDetailsRow from "@/app/[locale]/swap/components/SwapDetailsRow";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { IconName } from "@/config/types/IconName";
import { formatFloat } from "@/functions/formatFloat";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: OrderCloseStatus;
  loading: OrderCloseStatus;
  error: OrderCloseStatus;
};

function composeDepositOrderSteps(): OperationStepConfig[] {
  return [
    {
      iconName: "closed",
      pending: OrderCloseStatus.PENDING_CLOSE_ORDER,
      loading: OrderCloseStatus.LOADING_CLOSE_ORDER,
      error: OrderCloseStatus.ERROR_CLOSE_ORDER,
      textMap: {
        [OperationStepStatus.IDLE]: "Close lending order",
        [OperationStepStatus.AWAITING_SIGNATURE]: "Close lending order",
        [OperationStepStatus.LOADING]: "Closing lending order",
        [OperationStepStatus.STEP_COMPLETED]: "Lending order closed successfully",
        [OperationStepStatus.STEP_FAILED]: "Failed to close lending order",
        [OperationStepStatus.OPERATION_COMPLETED]: "Lending order closed successfully",
      },
    },
  ];
}

function OrderCloseActionButton({ order }: { order: LendingOrder }) {
  const { status, closeOrderHash } = useCloseOrderStatusStore();
  const { handleOrderClose } = useOrderClose({ order });

  if (status !== OrderCloseStatus.INITIAL) {
    return (
      <OperationRows>
        {composeDepositOrderSteps().map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[closeOrderHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: composeDepositOrderSteps().flatMap((s) => [
                s.pending,
                s.loading,
                s.error,
              ]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: OrderCloseStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handleOrderClose(order.id)} fullWidth>
      Close order
    </Button>
  );
}

export default function OrderCloseDialog({
  isOpen,
  setIsOpen,
  order,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: LendingOrder | undefined;
}) {
  const { status, setStatus } = useCloseOrderStatusStore();
  const isInitialStatus = useMemo(() => status === OrderCloseStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === OrderCloseStatus.SUCCESS || status === OrderCloseStatus.ERROR_CLOSE_ORDER,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  useEffect(() => {
    if (
      (status === OrderCloseStatus.ERROR_CLOSE_ORDER || status === OrderCloseStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(OrderCloseStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Close lending order" />
      {order ? (
        <div className="card-spacing-x card-spacing-b min-w-[600px]">
          {isInitialStatus && (
            <>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
                  <span className="text-secondary-text text-18 font-bold">
                    {order.baseAsset.name}
                  </span>
                  <div className="flex items-center gap-3 text-green">
                    Active
                    <div className="w-2 h-2 rounded-full bg-green"></div>
                  </div>
                </div>
                <div className="text-secondary-text text-12 py-2 px-4 rounded-2 bg-tertiary-bg">
                  <span className="text-tertiary-text">ID: </span>
                  {order.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GradientCard
                  gradient={CardGradient.BLUE_LIGHT}
                  className="flex px-5 py-3 justify-between "
                >
                  <div className="">
                    <div className="items-center flex gap-1 text-tertiary-text">
                      Available balance
                      <Tooltip text="Tooltip text" />
                    </div>

                    <p className="font-medium text-20">
                      {formatUnits(order.balance, order.baseAsset.decimals ?? 18)}{" "}
                      <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                    </p>
                  </div>
                </GradientCard>

                <GradientCard className=" px-5 py-3 ">
                  <div className="">
                    <div className="items-center flex gap-1 text-tertiary-text">
                      Total balance
                      <Tooltip text="Tooltip text" />
                    </div>

                    <p className="font-medium text-20">
                      {formatFloat(
                        formatUnits(calculateTotalOrderBalance(order), order.baseAsset.decimals),
                      )}{" "}
                      <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                    </p>
                  </div>
                </GradientCard>
              </div>

              <div className="flex flex-col gap-2 my-4">
                <SwapDetailsRow
                  tooltipText="Tooltip text"
                  title="Max leverage"
                  value={`${order.leverage}x`}
                />
                <SwapDetailsRow
                  tooltipText="Tooltip text"
                  title="Interest rate per month"
                  value={`${order.interestRate / 100}%`}
                />
                <SwapDetailsRow
                  tooltipText="Tooltip text"
                  title="Deadline"
                  value={`${timestampToDateString(order.deadline)}`}
                />
              </div>
              <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
                <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas price:</span>
                    <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
                  </p>

                  <p className="flex flex-col text-tertiary-text">
                    <span>Gas limit:</span>
                    <span>{100000}</span>
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
                    size={false ? ButtonSize.SMALL : ButtonSize.EXTRA_SMALL}
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
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
                  <span className="text-secondary-text text-18 font-bold">
                    {order.baseAsset.name}
                  </span>
                  <div className="flex items-center gap-3 text-green">
                    Active
                    <div className="w-2 h-2 rounded-full bg-green"></div>
                  </div>
                </div>
                <div className="text-secondary-text text-12 py-2 px-4 rounded-2 bg-tertiary-bg">
                  <span className="text-tertiary-text">ID: </span>
                  {order.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <GradientCard
                  gradient={CardGradient.BLUE_LIGHT}
                  className="flex px-5 py-3 justify-between "
                >
                  <div className="">
                    <div className="items-center flex gap-1 text-tertiary-text">
                      Available balance
                      <Tooltip text="Tooltip text" />
                    </div>

                    <p className="font-medium text-20">
                      {formatUnits(order.balance, order.baseAsset.decimals ?? 18)}{" "}
                      <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                    </p>
                  </div>
                </GradientCard>

                <GradientCard className=" px-5 py-3 ">
                  <div className="">
                    <div className="items-center flex gap-1 text-tertiary-text">
                      Total balance
                      <Tooltip text="Tooltip text" />
                    </div>

                    <p className="font-medium text-20">
                      {formatFloat(
                        formatUnits(calculateTotalOrderBalance(order), order.baseAsset.decimals),
                      )}{" "}
                      <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                    </p>
                  </div>
                </GradientCard>
              </div>
              <div className="my-4 border-b border-secondary-border w-full" />
            </>
          )}
          {isFinalStatus && (
            <div className="pb-1">
              <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                {status === OrderCloseStatus.ERROR_CLOSE_ORDER && (
                  <EmptyStateIcon iconName="warning" />
                )}

                {status === OrderCloseStatus.SUCCESS && (
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

              {status === OrderCloseStatus.SUCCESS && (
                <div>
                  <h2 className="text-center mb-1 font-bold text-20 ">
                    Lending order closed successfully
                  </h2>
                  <p className="text-center mb-1">
                    {order.baseAsset.symbol}{" "}
                    <span className="text-tertiary-text">(ID: {order.id})</span>
                  </p>
                </div>
              )}
              {status === OrderCloseStatus.ERROR_CLOSE_ORDER && (
                <div>
                  <h2 className="text-center mb-1 font-bold text-20 text-red-light">
                    Failed to close lending order
                  </h2>
                  <p className="text-center mb-1">
                    {order.baseAsset.symbol}{" "}
                    <span className="text-tertiary-text">(ID: {order.id})</span>
                  </p>
                </div>
              )}
              <div className="my-4 border-b border-secondary-border w-full" />
            </div>
          )}

          <OrderCloseActionButton order={order} />
        </div>
      ) : (
        <div>No order provided</div>
      )}
    </DrawerDialog>
  );
}
