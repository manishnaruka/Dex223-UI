import ExternalTextLink from "@repo/ui/external-text-link";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import React, { PropsWithChildren, useEffect, useMemo } from "react";
import { formatUnits } from "viem";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import useCreateMarginPosition, {
  useCreatePositionApproveSteps,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/hooks/useCreateMarginPosition";
import { useConfirmCreateMarginPositionDialogStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useConfirmCreateMarginPositionDialogOpened";
import { useCreateMarginPositionConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionConfigStore";
import {
  CreateMarginPositionStatus,
  useCreateMarginPositionStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/[id]/borrow/stores/useCreateMarginPositionStatusStore";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input, { InputSize } from "@/components/atoms/Input";
import { InputLabel } from "@/components/atoms/TextField";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import OperationStepRow, {
  operationStatusToStepStatus,
} from "@/components/common/OperationStepRow";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { ORACLE_ADDRESS } from "@/sdk_bi/addresses";

function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function CreateMarginPositionActionButton({
  orderId,
  order,
}: {
  orderId: string;
  order: LendingOrder;
}) {
  const { handleCreateMarginPosition } = useCreateMarginPosition(order);
  const { status, setStatus, approveBorrowHash, approveLiquidationFeeHash, borrowHash } =
    useCreateMarginPositionStatusStore();

  const orderedHashes = [approveBorrowHash, approveBorrowHash, borrowHash];

  const { allSteps: marginSteps } = useCreatePositionApproveSteps(order);

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
  return (
    <Button fullWidth onClick={() => handleCreateMarginPosition(orderId)}>
      Confirm borrow
    </Button>
  );
}

export default function ReviewBorrowDialog({
  orderId,
  order,
}: {
  orderId: string;
  order: LendingOrder;
}) {
  const { isOpen, setIsOpen } = useConfirmCreateMarginPositionDialogStore();
  const { values, setValues } = useCreateMarginPositionConfigStore();
  const { status, setStatus, approveBorrowHash, approveLiquidationFeeHash, borrowHash } =
    useCreateMarginPositionStatusStore();
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);
  const chainId = useCurrentChainId();

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
      <DialogHeader onClose={() => setIsOpen(false)} title={"Review borrow"} />

      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        <InputLabel inputSize={InputSize.LARGE} label="You send" />
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4 text-14">
            <p className="text-secondary-text ">Collateral</p>
            <div className="flex items-center gap-1 items-center my-1">
              <Image
                className="mr-1"
                src={"/images/tokens/placeholder.svg"}
                alt={values.collateralToken?.symbol || "Unknown"}
                width={20}
                height={20}
              />
              <span className="">{values.collateralAmount}</span>
              <span className="text-secondary-text">
                {values.collateralToken?.symbol || "Unknown"}
              </span>
              <Badge
                size="small"
                variant={BadgeVariant.STANDARD}
                standard={values.collateralTokenStandard}
              />
            </div>
          </div>
          <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4 text-14">
            <p className="text-secondary-text ">Liquidation fee</p>
            <div className="flex items-center gap-1 items-center my-1">
              <Image
                className="mr-1"
                src={"/images/tokens/placeholder.svg"}
                alt={order.liquidationRewardAsset.symbol || "Unknown"}
                width={20}
                height={20}
              />
              <span className="">
                {formatUnits(order.liquidationRewardAmount, order.liquidationRewardAsset.decimals)}
              </span>
              <span className="text-secondary-text">
                {order.liquidationRewardAsset.symbol || "Unknown"}
              </span>
              <Badge
                size="small"
                variant={BadgeVariant.STANDARD}
                standard={order.liquidationRewardAssetStandard}
              />
            </div>
          </div>
        </div>
        <InputLabel inputSize={InputSize.LARGE} label="You receive" />
        <div className="bg-tertiary-bg rounded-3 py-[14px] px-5 mb-4 text-14 flex items-center justify-between">
          <p className="text-secondary-text ">Borrow</p>
          <div className="flex items-center gap-1 items-center">
            <Image
              className="mr-1"
              src={"/images/tokens/placeholder.svg"}
              alt={order.baseAsset?.symbol || "Unknown"}
              width={20}
              height={20}
            />
            <span className="">{values.borrowAmount}</span>
            <span className="text-secondary-text">{order.baseAsset?.symbol || "Unknown"}</span>
            {/*<Badge*/}
            {/*  size="small"*/}
            {/*  variant={BadgeVariant.STANDARD}*/}
            {/*  standard={values.collateralTokenStandard}*/}
            {/*/>*/}
          </div>
        </div>

        {status === CreateMarginPositionStatus.INITIAL && (
          <>
            <div className="flex flex-col gap-2 mb-5">
              <LendingOrderDetailsRow
                title="Interest rate per month"
                value={`${order.interestRate / 100}%`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Interest rate per entire period"
                value={<span className="text-red">TODO</span>}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Max leverage"
                value={`${order.leverage}x`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Leverage"
                value={`${values.leverage}x`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="LTV"
                value={<span className="text-red">TODO</span>}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Deadline"
                value={new Date(order.deadline).toLocaleDateString("en-GB").split("/").join(".")}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Order currency limit"
                value={order.currencyLimit}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation price source"
                value={
                  <ExternalTextLink
                    text="Dex223 Market"
                    href={getExplorerLink(
                      ExplorerLinkType.ADDRESS,
                      ORACLE_ADDRESS[chainId],
                      chainId,
                    )}
                  />
                }
                tooltipText="Tooltip text"
              />
            </div>
            <span className="text-red my-2 block">TODO: Tokens allowed for trading</span>
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
            </div>
          </>
        )}
        <CreateMarginPositionActionButton orderId={orderId} order={order} />
      </div>
    </DrawerDialog>
  );
}
