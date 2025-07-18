import React, { useEffect, useMemo, useState } from "react";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import useEditOrder, {
  useEditOrderParams,
} from "@/app/[locale]/margin-trading/lending-order/[id]/edit/hooks/useEditOrder";
import {
  EditOrderStatus,
  useEditOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderStatusStore";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import Button from "@/components/buttons/Button";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { IconName } from "@/config/types/IconName";
import useCurrentChainId from "@/hooks/useCurrentChainId";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: EditOrderStatus;
  loading: EditOrderStatus;
  error: EditOrderStatus;
};

function createOrderSteps(): OperationStepConfig[] {
  return [
    {
      iconName: "edit",
      pending: EditOrderStatus.PENDING_MODIFY,
      loading: EditOrderStatus.LOADING_MODIFY,
      error: EditOrderStatus.ERROR_MODIFY,
      textMap: {
        [OperationStepStatus.IDLE]: "Edit lending order",
        [OperationStepStatus.AWAITING_SIGNATURE]: "Edit lending order",
        [OperationStepStatus.LOADING]: "Editing lending order",
        [OperationStepStatus.STEP_COMPLETED]: "Lending order edited successfully",
        [OperationStepStatus.STEP_FAILED]: "Failed to edit a lending order",
        [OperationStepStatus.OPERATION_COMPLETED]: "Lending order edited successfully",
      },
    },
  ];
}

function EditOrderActionButton({
  amountToApprove,
  order,
  disabled,
}: {
  amountToApprove: string;
  order: LendingOrder;
  disabled?: boolean;
}) {
  const { handleEditOrder } = useEditOrder();

  const { status, modifyOrderHash } = useEditOrderStatusStore();
  const { loanToken } = useEditOrderParams();

  if (status !== EditOrderStatus.INITIAL) {
    return (
      <OperationRows>
        {createOrderSteps().map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[modifyOrderHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: createOrderSteps().flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: EditOrderStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button disabled={disabled} onClick={() => handleEditOrder(amountToApprove, order)} fullWidth>
      {disabled ? "No changes were made" : "Save changes"}
    </Button>
  );
}

export default function ReviewEditOrderDialog({
  isOpen,
  setIsOpen,
  order,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: LendingOrder;
}) {
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);

  const { status, setStatus } = useEditOrderStatusStore();

  useEffect(() => {
    if (
      (status === EditOrderStatus.ERROR_MODIFY || status === EditOrderStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(EditOrderStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);

  const isInitialStatus = useMemo(() => status === EditOrderStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === EditOrderStatus.SUCCESS || status === EditOrderStatus.ERROR_MODIFY,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  const {
    tradingTokens,
    loanToken,
    loanTokenStandard,
    collateralTokens,
    loanAmount,
    includeERC223Collateral,
    liquidationFeeToken,
    liquidationFeeForLiquidator,
    liquidationFeeForLender,
    liquidationMode,
    minimumBorrowingAmount,
    orderCurrencyLimit,
    period,
    interestRatePerMonth,
    leverage,
    priceSource,
  } = useEditOrderParams();

  const modifiedOrderProperties = useMemo(() => {
    const _temp: Array<{ oldValue: string | number; newValue: string | number; label: string }> =
      [];
    if (leverage != order.leverage) {
      _temp.push({ oldValue: order.leverage, newValue: leverage, label: "Leverage" });
    } else {
      _temp.filter((i) => i.label === "Leverage");
    }

    return _temp;
  }, [leverage, order.leverage]);

  const [amountToApprove, setAmountToApprove] = useState(loanAmount);

  useEffect(() => {
    if (loanAmount) {
      setAmountToApprove(loanAmount);
    }
  }, [loanAmount]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title={"Review changes"} />

      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        {isFinalStatus && (
          <div className="pb-3 border-b border-secondary-border mb-4">
            <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
              {status === EditOrderStatus.ERROR_MODIFY && <EmptyStateIcon iconName="warning" />}

              {status === EditOrderStatus.SUCCESS && (
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

            {status === EditOrderStatus.SUCCESS && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 ">
                  Lending order edited successfully
                </h2>
                <p className="text-center mb-1">
                  {order.baseAsset.symbol}{" "}
                  <span className="text-tertiary-text">(ID: {order.id})</span>
                </p>
              </div>
            )}
          </div>
        )}
        {(isInitialStatus || isLoadingStatus) && (
          <>
            <div className="flex flex-col gap-2 mb-5">
              {modifiedOrderProperties.map((modifiedOrderProperty: any) => {
                return (
                  <LendingOrderDetailsRow
                    key={modifiedOrderProperty.label}
                    title="Leverage"
                    value={
                      <span className="flex items-center gap-1">
                        {modifiedOrderProperty.oldValue}{" "}
                        <Svg className="text-tertiary-text" size={20} iconName="next" />{" "}
                        {modifiedOrderProperty.newValue}
                      </span>
                    }
                    tooltipText="Tooltip text"
                  />
                );
              })}
            </div>
            <div className="my-4 border-b border-secondary-border w-full" />
          </>
        )}

        <EditOrderActionButton
          disabled={!modifiedOrderProperties.length}
          order={order}
          amountToApprove={amountToApprove}
        />
      </div>
    </DrawerDialog>
  );
}
