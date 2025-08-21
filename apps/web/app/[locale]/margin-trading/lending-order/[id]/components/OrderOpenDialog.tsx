import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import { formatEther, formatGwei, formatUnits } from "viem";

import calculateTotalOrderBalance from "@/app/[locale]/margin-trading/lending-order/[id]/helpers/calculateTotalOrderBalance";
import useOrderOpen from "@/app/[locale]/margin-trading/lending-order/[id]/hooks/useOrderOpen";
import { LendingOrder } from "@/app/[locale]/margin-trading/types";
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
import { IconName } from "@/config/types/IconName";
import { formatFloat } from "@/functions/formatFloat";

import { OpenOrderStatus, useOpenOrderStatusStore } from "../stores/useOpenOrderStatusStore";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: OpenOrderStatus;
  loading: OpenOrderStatus;
  error: OpenOrderStatus;
};

function composeOpenOrderSteps(): OperationStepConfig[] {
  return [
    {
      iconName: "open-order",
      pending: OpenOrderStatus.PENDING_OPEN_ORDER,
      loading: OpenOrderStatus.LOADING_OPEN_ORDER,
      error: OpenOrderStatus.ERROR_OPEN_ORDER,
      textMap: {
        [OperationStepStatus.IDLE]: "Open lending order",
        [OperationStepStatus.AWAITING_SIGNATURE]: "Open lending order",
        [OperationStepStatus.LOADING]: "Opening lending order",
        [OperationStepStatus.STEP_COMPLETED]: "Lending order opened successfully",
        [OperationStepStatus.STEP_FAILED]: "Failed to open lending order",
        [OperationStepStatus.OPERATION_COMPLETED]: "Lending order opened successfully",
      },
    },
  ];
}

function OrderCloseActionButton({ order }: { order: LendingOrder }) {
  const { status, openOrderHash } = useOpenOrderStatusStore();
  const { handleOrderOpen } = useOrderOpen({ order });

  if (status !== OpenOrderStatus.INITIAL) {
    return (
      <OperationRows>
        {composeOpenOrderSteps().map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[openOrderHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: composeOpenOrderSteps().flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: OpenOrderStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={async () => await handleOrderOpen(order.id)} fullWidth>
      Open order
    </Button>
  );
}

export default function OrderOpenDialog({
  isOpen,
  setIsOpen,
  order,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: LendingOrder | undefined;
}) {
  const { status, setStatus } = useOpenOrderStatusStore();

  const isInitialStatus = useMemo(() => status === OpenOrderStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === OpenOrderStatus.SUCCESS || status === OpenOrderStatus.ERROR_OPEN_ORDER,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  useEffect(() => {
    if (isFinalStatus && !isOpen) {
      setTimeout(() => {
        setStatus(OpenOrderStatus.INITIAL);
      }, 400);
    }
  }, [isFinalStatus, isOpen, setStatus]);

  if (!order) {
    return "No order provided";
  }

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Open lending order" />
      <div className="card-spacing-x card-spacing-b w-[600px]">
        {isInitialStatus && (
          <>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
                <span className="text-secondary-text text-18 font-bold">
                  {order.baseAsset.name}
                </span>
                <div className="flex items-center gap-1 text-tertiary-text">
                  Closed
                  <Svg iconName="closed" />
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

            <div className="flex flex-col gap-2 my-4 text-secondary-text">
              By confirming this action, you will reactivate the lending order, allowing it to
              continue its terms as initially agreed. Please ensure that you review the details
              before proceeding
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
                <div className="flex items-center gap-1 text-tertiary-text">
                  Closed
                  <Svg iconName="closed" />
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
              {status === OpenOrderStatus.ERROR_OPEN_ORDER && <EmptyStateIcon iconName="warning" />}

              {status === OpenOrderStatus.SUCCESS && (
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

            {status === OpenOrderStatus.SUCCESS && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 ">
                  Lending order opened successfully
                </h2>
                <p className="text-center mb-1">
                  {order.baseAsset.symbol}{" "}
                  <span className="text-tertiary-text">(ID: {order.id})</span>
                </p>
              </div>
            )}
            {status === OpenOrderStatus.ERROR_OPEN_ORDER && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 text-red-light">
                  Failed to open lending order
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
    </DrawerDialog>
  );
}
