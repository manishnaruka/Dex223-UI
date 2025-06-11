import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { PropsWithChildren, useEffect, useMemo } from "react";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import useCreateOrder from "@/app/[locale]/margin-trading/lending-order/create/hooks/useCreateOrder";
import {
  CreateOrderStatus,
  useCreateOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStatusStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input from "@/components/atoms/Input";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import OperationStepRow, {
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { IconName } from "@/config/types/IconName";
import { Standard } from "@/sdk_bi/standard";

function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: CreateOrderStatus;
  loading: CreateOrderStatus;
  error: CreateOrderStatus;
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

const createOrderSteps: OperationStepConfig[] = [
  {
    iconName: "lending",
    pending: CreateOrderStatus.PENDING_CONFIRM_ORDER,
    loading: CreateOrderStatus.LOADING_CONFIRM_ORDER,
    error: CreateOrderStatus.ERROR_CONFIRM_ORDER,
    textMap: {
      [OperationStepStatus.IDLE]: "Confirm lending order",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Confirm lending order",
      [OperationStepStatus.LOADING]: "Executing lending order",
      [OperationStepStatus.STEP_COMPLETED]: "Lending order confirmed",
      [OperationStepStatus.STEP_FAILED]: "Failed to confirm a lending order",
      [OperationStepStatus.OPERATION_COMPLETED]: "Lending order confirmed",
    },
  },
  {
    iconName: "done",
    pending: CreateOrderStatus.PENDING_APPROVE,
    loading: CreateOrderStatus.LOADING_APPROVE,
    error: CreateOrderStatus.ERROR_APPROVE,
    textMap: getApproveTextMap("DAI"),
  },
  {
    iconName: "deposit",
    pending: CreateOrderStatus.PENDING_DEPOSIT,
    loading: CreateOrderStatus.LOADING_DEPOSIT,
    error: CreateOrderStatus.ERROR_DEPOSIT,
    textMap: {
      [OperationStepStatus.IDLE]: "Deposit funds",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Deposit funds",
      [OperationStepStatus.LOADING]: "Executing deposit",
      [OperationStepStatus.STEP_COMPLETED]: "Deposited funds",
      [OperationStepStatus.STEP_FAILED]: "Failed to deposit funds",
      [OperationStepStatus.OPERATION_COMPLETED]: "Deposited funds",
    },
  },
  // Repeat for other steps
];

function CreateOrderActionButton() {
  const t = useTranslations("Swap");

  const { handleCreateOrder } = useCreateOrder();

  const { status, approveHash, depositHash, confirmOrderHash } = useCreateOrderStatusStore();

  if (status !== CreateOrderStatus.INITIAL) {
    return (
      <Rows>
        {createOrderSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[confirmOrderHash, approveHash, depositHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: createOrderSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: CreateOrderStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </Rows>
    );
  }

  return (
    <Button onClick={() => handleCreateOrder("1")} fullWidth>
      Create lending order
    </Button>
  );
}

export default function ReviewLendingOrderDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);

  const { status, setStatus } = useCreateOrderStatusStore();

  useEffect(() => {
    if (
      (status === CreateOrderStatus.ERROR_APPROVE ||
        status === CreateOrderStatus.ERROR_DEPOSIT ||
        status === CreateOrderStatus.ERROR_CONFIRM_ORDER ||
        status === CreateOrderStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(CreateOrderStatus.INITIAL);
      }, 400);
    }
  }, [isOpen, setStatus, status]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title={"Review lending order"} />

      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
          <p className="text-secondary-text text-14">Loan amount</p>
          <div className="flex justify-between items-center my-1">
            <span className="font-medium text-20">1000</span>
            <span className="flex items-center gap-2">
              <Image src={"/images/tokens/placeholder.svg"} alt={"USDT"} width={32} height={32} />
              <span>USDT</span>
              <Badge variant={BadgeVariant.STANDARD} standard={Standard.ERC20} />
            </span>
          </div>
          <p className="text-tertiary-text text-14">$1,000.00</p>
        </div>
        {status === CreateOrderStatus.INITIAL && (
          <>
            <div className="flex flex-col gap-2 mb-5">
              <LendingOrderDetailsRow
                title="Margin positions duration"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Lending order deadline"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Interest rate per month"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Interest rate for the entire period"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="You will receive for the entire period"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Leverage"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow title="LTV" value={"30 days"} tooltipText="Tooltip text" />
              <LendingOrderDetailsRow
                title="Accepted collateral tokens"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Tokens allowed for trading"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Minimum borrowing amount"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Order currency limit"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="May initiate liquidation"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Pays the liquidation deposit"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation fee (for liquidator)"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation fee (for lender)"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation price source"
                value={"30 days"}
                tooltipText="Tooltip text"
              />
            </div>
            <div
              className={clsx(
                "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5 mb-5",
                // parseUnits(amountToApprove, paymentToken.token.decimals) <
                //   paymentToken.price * BigInt(tokensToList.length) && "pb-[26px]",
              )}
            >
              <div className="flex items-center gap-1 text-secondary-text whitespace-nowrap">
                <Tooltip
                  iconSize={20}
                  text={
                    " In order to make a swap with ERC-20 token you need to give the DEX contract permission to withdraw your tokens. All DEX'es require this operation. Here you are specifying the amount of tokens that you allow the contract to transfer on your behalf. Note that this amount never expires."
                  }
                />
                <span className="text-14">Approve amount</span>
              </div>
              <div className="flex items-center gap-2 flex-grow justify-end">
                {!isEditApproveActive ? (
                  <span className="text-14">
                    {1000} {"USDT"}
                  </span>
                ) : (
                  <div className="flex-grow">
                    <div className="relative w-full flex-grow">
                      <Input
                        // isError={
                        //   parseUnits(amountToApprove, paymentToken.token.decimals) <
                        //   paymentToken.price * BigInt(tokensToList.length)
                        // }
                        className="h-8 pl-3"
                        // value={amountToApprove}
                        // onChange={(e) => setAmountToApprove(e.target.value)}
                        type="text"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                        {"USDT"}
                      </span>
                    </div>
                    {/*{parseUnits(amountToApprove, paymentToken.token.decimals) <*/}
                    {/*  paymentToken.price * BigInt(tokensToList.length) && (*/}
                    {/*  <span className="text-red-light absolute text-12 translate-y-0.5">*/}
                    {/*    Must be higher or equal{" "}*/}
                    {/*    {formatUnits(*/}
                    {/*      paymentToken.price * BigInt(tokensToList.length),*/}
                    {/*      paymentToken.token.decimals,*/}
                    {/*    )}*/}
                    {/*  </span>*/}
                    {/*)}*/}
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
                    // disabled={
                    //   parseUnits(amountToApprove, paymentToken.token.decimals) <
                    //   paymentToken.price * BigInt(tokensToList.length)
                    // }
                    size={ButtonSize.EXTRA_SMALL}
                    colorScheme={ButtonColor.LIGHT_GREEN}
                    onClick={() => setEditApproveActive(false)}
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>{" "}
          </>
        )}

        <CreateOrderActionButton />
      </div>
    </DrawerDialog>
  );
}
