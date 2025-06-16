import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import React, { PropsWithChildren, useEffect } from "react";

import useCreateMarginPosition from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/hooks/useCreateMarginPosition";
import { useConfirmCreateMarginPositionDialogStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useConfirmCreateMarginPositionDialogOpened";
import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
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
  pending: CreateMarginPositionStatus;
  loading: CreateMarginPositionStatus;
  error: CreateMarginPositionStatus;
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

const marginSteps: OperationStepConfig[] = [
  {
    iconName: "done",
    pending: CreateMarginPositionStatus.PENDING_APPROVE_BORROW,
    loading: CreateMarginPositionStatus.LOADING_APPROVE_BORROW,
    error: CreateMarginPositionStatus.ERROR_APPROVE_BORROW,
    textMap: getApproveTextMap("USDT"),
  },
  {
    iconName: "done",
    pending: CreateMarginPositionStatus.PENDING_APPROVE_LIQUIDATION_FEE,
    loading: CreateMarginPositionStatus.LOADING_APPROVE_LIQUIDATION_FEE,
    error: CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE,
    textMap: getApproveTextMap("DAI"),
  },
  {
    iconName: "borrow",
    pending: CreateMarginPositionStatus.PENDING_BORROW,
    loading: CreateMarginPositionStatus.LOADING_BORROW,
    error: CreateMarginPositionStatus.ERROR_BORROW,
    textMap: {
      [OperationStepStatus.IDLE]: "Borrow",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Borrow",
      [OperationStepStatus.LOADING]: "Borrowing",
      [OperationStepStatus.STEP_COMPLETED]: "Successfully borrowed",
      [OperationStepStatus.STEP_FAILED]: "Borrow failed",
      [OperationStepStatus.OPERATION_COMPLETED]: "Successfully borrowed",
    },
  },
  // Repeat for other steps
];

function CreateMarginPositionActionButton() {
  const { handleCreateMarginPosition } = useCreateMarginPosition();
  const { status, setStatus, approveBorrowHash, approveLiquidationFeeHash, borrowHash } =
    useCreateMarginPositionStatusStore();

  const orderedHashes = [approveBorrowHash, approveBorrowHash, borrowHash];

  if (status !== CreateMarginPositionStatus.INITIAL) {
    return (
      <Rows>
        {marginSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={orderedHashes[index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: marginSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: CreateMarginPositionStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </Rows>
    );
  }
  return <Button onClick={handleCreateMarginPosition}>Confirm borrow</Button>;
}

export default function ReviewBorrowDialog() {
  const { isOpen, setIsOpen } = useConfirmCreateMarginPositionDialogStore();
  const { values, setValues } = useCreateMarginPositionConfigStore();
  const { status, setStatus, approveBorrowHash, approveLiquidationFeeHash, borrowHash } =
    useCreateMarginPositionStatusStore();
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);

  useEffect(() => {
    if (
      (status === CreateMarginPositionStatus.ERROR_APPROVE_BORROW ||
        status === CreateMarginPositionStatus.ERROR_APPROVE_LIQUIDATION_FEE ||
        status === CreateMarginPositionStatus.ERROR_BORROW ||
        status === CreateMarginPositionStatus.SUCCESS) &&
      !isOpen
    ) {
      setTimeout(() => {
        setStatus(CreateMarginPositionStatus.INITIAL);
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
        {status === CreateMarginPositionStatus.INITIAL && (
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

        <CreateMarginPositionActionButton />
      </div>
    </DrawerDialog>
  );
}
