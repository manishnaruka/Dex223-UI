import ExternalTextLink from "@repo/ui/external-text-link";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { parseUnits } from "viem";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import useCreateOrder, {
  useCreateOrderParams,
} from "@/app/[locale]/margin-trading/lending-order/create/hooks/useCreateOrder";
import { TradingTokensInputMode } from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import {
  CreateOrderStatus,
  useCreateOrderStatusStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStatusStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import OperationStepRow, {
  OperationRows,
  operationStatusToStepStatus,
  OperationStepStatus,
} from "@/components/common/OperationStepRow";
import { IconName } from "@/config/types/IconName";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { ORACLE_ADDRESS, ZERO_ADDRESS } from "@/sdk_bi/addresses";

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

function createOrderSteps(approveSymbol: string, isNative: boolean): OperationStepConfig[] {
  if (!isNative)
    return [
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
        textMap: getApproveTextMap(approveSymbol),
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
    ];

  return [
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
  ];
}

function CreateOrderActionButton({ amountToApprove }: { amountToApprove: string }) {
  const t = useTranslations("Swap");

  const { handleCreateOrder } = useCreateOrder();

  const { status, approveHash, depositHash, confirmOrderHash } = useCreateOrderStatusStore();
  const { loanToken } = useCreateOrderParams();

  if (status !== CreateOrderStatus.INITIAL) {
    return (
      <OperationRows>
        {createOrderSteps(loanToken?.symbol || "", !!loanToken?.isNative).map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[confirmOrderHash, approveHash, depositHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: createOrderSteps(
                loanToken?.symbol || "",
                !!loanToken?.isNative,
              ).flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: CreateOrderStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handleCreateOrder(amountToApprove)} fullWidth>
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
  } = useCreateOrderParams();

  const chainId = useCurrentChainId();

  const [amountToApprove, setAmountToApprove] = useState(loanAmount);

  useEffect(() => {
    if (loanAmount) {
      setAmountToApprove(loanAmount);
    }
  }, [loanAmount]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title={"Create lending order"} />

      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        {status !== CreateOrderStatus.ERROR_CONFIRM_ORDER &&
          status !== CreateOrderStatus.ERROR_APPROVE &&
          status !== CreateOrderStatus.SUCCESS && (
            <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
              <p className="text-secondary-text text-14">Loan amount</p>
              <div className="flex justify-between items-center my-1">
                <span className="font-medium text-20">{loanAmount}</span>
                <span className="flex items-center gap-2">
                  <Image
                    src={"/images/tokens/placeholder.svg"}
                    alt={"USDT"}
                    width={32}
                    height={32}
                  />
                  <span>{loanToken?.symbol}</span>
                  <Badge variant={BadgeVariant.STANDARD} standard={loanTokenStandard} />
                </span>
              </div>
              <p className="text-tertiary-text text-14">$0.00</p>
            </div>
          )}
        {(status === CreateOrderStatus.SUCCESS ||
          status === CreateOrderStatus.ERROR_DEPOSIT ||
          status === CreateOrderStatus.ERROR_CONFIRM_ORDER) && (
          <div className="pb-3 border-b border-secondary-border mb-4">
            <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
              {(status === CreateOrderStatus.ERROR_DEPOSIT ||
                status === CreateOrderStatus.ERROR_CONFIRM_ORDER) && (
                <EmptyStateIcon iconName="warning" />
              )}

              {status === CreateOrderStatus.SUCCESS && (
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

            {status === CreateOrderStatus.SUCCESS && (
              <div>
                <h2 className="text-center mb-1 font-bold text-20 ">
                  Lending order successfully created
                </h2>
                <p className="text-center mb-1">
                  {loanAmount} {loanToken?.symbol}
                </p>
                <div className="flex justify-center">
                  <ExternalTextLink text="View my order" href={"#"} />
                </div>
              </div>
            )}
          </div>
        )}
        {status === CreateOrderStatus.INITIAL && (
          <>
            <div className="flex flex-col gap-2 mb-5">
              <LendingOrderDetailsRow
                title="Margin positions duration"
                value={`${period.positionDuration} days`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Lending order deadline"
                value={new Date(period.lendingOrderDeadline)
                  .toLocaleDateString("en-GB")
                  .split("/")
                  .join(".")}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Interest rate per month"
                value={`${interestRatePerMonth}%`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Interest rate for the entire period"
                value={<span className="text-red">TODO</span>}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="You will receive for the entire period"
                value={<span className="text-red">TODO</span>}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Leverage"
                value={`${leverage}x`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="LTV"
                value={<span className="text-red">TODO</span>}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Accepted collateral tokens"
                value={
                  <span className="flex gap-2">
                    {collateralTokens.length > 2 ? (
                      <>
                        {collateralTokens.slice(0, 2).map((token) => (
                          <span
                            key={token.wrapped.address0}
                            className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
                          >
                            <Image
                              width={16}
                              height={16}
                              src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
                              alt={""}
                            />
                            {token.symbol}
                          </span>
                        ))}
                        <span className="p-0.5 text-14">{"..."}</span>

                        <span className="rounded-1 border border-secondary-border text-14 font-medium py-0.5 px-1 min-w-6 flex items-center justify-center">
                          {collateralTokens.length - 2}
                        </span>
                      </>
                    ) : (
                      collateralTokens.map((token) => (
                        <span
                          key={token.wrapped.address0}
                          className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
                        >
                          <Image
                            width={16}
                            height={16}
                            src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
                            alt={""}
                          />
                          {token.symbol}
                        </span>
                      ))
                    )}
                  </span>
                }
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Tokens allowed for trading"
                value={
                  tradingTokens.inputMode === TradingTokensInputMode.MANUAL ? (
                    <span className="flex gap-2">
                      {tradingTokens.allowedTokens.length > 2 ? (
                        <>
                          {tradingTokens.allowedTokens.slice(0, 2).map((token) => (
                            <span
                              key={token.wrapped.address0}
                              className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
                            >
                              <Image
                                width={16}
                                height={16}
                                src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
                                alt={""}
                              />
                              {token.symbol}
                            </span>
                          ))}
                          <span className="p-0.5 text-14">{"..."}</span>

                          <span className="rounded-1 border border-secondary-border text-14 font-medium py-0.5 px-1 min-w-6 flex items-center justify-center">
                            {tradingTokens.allowedTokens.length - 2}
                          </span>
                        </>
                      ) : (
                        tradingTokens.allowedTokens.map((token) => (
                          <span
                            key={token.wrapped.address0}
                            className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
                          >
                            <Image
                              width={16}
                              height={16}
                              src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
                              alt={""}
                            />
                            {token.symbol}
                          </span>
                        ))
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Autolisting{" "}
                      <ExternalTextLink
                        text="DEX223 Market"
                        href={getExplorerLink(
                          ExplorerLinkType.ADDRESS,
                          tradingTokens.tradingTokensAutoListing?.id || ZERO_ADDRESS,
                          chainId,
                        )}
                      />
                    </span>
                  )
                }
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Minimum borrowing amount"
                value={`${minimumBorrowingAmount} ${loanToken?.symbol}`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Order currency limit"
                value={orderCurrencyLimit}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="May initiate liquidation"
                value={"Anyone"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Pays the liquidation deposit"
                value={"Borrower"}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation fee (for liquidator)"
                value={`${liquidationFeeForLiquidator} ${liquidationFeeToken?.symbol}`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation fee (for lender)"
                value={`${liquidationFeeForLender} ${liquidationFeeToken?.symbol}`}
                tooltipText="Tooltip text"
              />
              <LendingOrderDetailsRow
                title="Liquidation price source"
                value={
                  <ExternalTextLink
                    text="DEX223 Market"
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
            <div
              className={clsx(
                "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5 mb-5",
                parseUnits(amountToApprove, loanToken?.decimals ?? 18) <
                  parseUnits(loanAmount, loanToken?.decimals ?? 18) && "pb-[26px]",
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
                    {loanAmount} {loanToken?.symbol}
                  </span>
                ) : (
                  <div className="flex-grow">
                    <div className="relative w-full flex-grow">
                      <Input
                        isError={
                          parseUnits(amountToApprove, loanToken?.decimals ?? 18) <
                          parseUnits(loanAmount, loanToken?.decimals ?? 18)
                        }
                        className="h-8 pl-3"
                        value={amountToApprove}
                        onChange={(e) => setAmountToApprove(e.target.value)}
                        type="text"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                        {"USDT"}
                      </span>
                    </div>
                    {parseUnits(amountToApprove, loanToken?.decimals ?? 18) <
                      parseUnits(loanAmount, loanToken?.decimals ?? 18) && (
                      <span className="text-red-light absolute text-12 translate-y-0.5">
                        Must be higher or equal {loanAmount}
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
                      parseUnits(amountToApprove, loanToken?.decimals ?? 18) <
                      parseUnits(loanAmount, loanToken?.decimals ?? 18)
                    }
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

        <CreateOrderActionButton amountToApprove={amountToApprove} />
      </div>
    </DrawerDialog>
  );
}
