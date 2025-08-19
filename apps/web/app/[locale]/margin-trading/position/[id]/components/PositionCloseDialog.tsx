import Alert from "@repo/ui/alert";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { formatEther, formatGwei, formatUnits, isAddress } from "viem";

import { SimpleInfoBlock } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import usePositionClose from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionClose";
import usePositionStatus from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionStatus";
import {
  PositionCloseStatus,
  usePositionCloseStatusStore,
} from "@/app/[locale]/margin-trading/position/[id]/stores/usePositionCloseStatusStore";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import SwapDetailsRow from "@/app/[locale]/swap/components/SwapDetailsRow";
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
import { Link } from "@/i18n/routing";

type StepTextMap = {
  [key in OperationStepStatus]: string;
};

type OperationStepConfig = {
  iconName: IconName;
  textMap: StepTextMap;
  pending: PositionCloseStatus;
  loading: PositionCloseStatus;
  error: PositionCloseStatus;
};

const closePositionSteps: OperationStepConfig[] = [
  {
    iconName: "closed",
    pending: PositionCloseStatus.PENDING_CLOSE,
    loading: PositionCloseStatus.LOADING_CLOSE,
    error: PositionCloseStatus.ERROR_CLOSE,
    textMap: {
      [OperationStepStatus.IDLE]: "Close margin position",
      [OperationStepStatus.AWAITING_SIGNATURE]: "Close margin position",
      [OperationStepStatus.LOADING]: "Closing margin position",
      [OperationStepStatus.STEP_COMPLETED]: "Margin position closed successfully",
      [OperationStepStatus.STEP_FAILED]: "Failed to close margin position",
      [OperationStepStatus.OPERATION_COMPLETED]: "Withdrawn funds",
    },
  },
];

function PositionCloseActionButton({ position }: { position: MarginPosition }) {
  const { handlePositionClose } = usePositionClose({
    position,
  });

  const { status, positionCloseHash } = usePositionCloseStatusStore();

  if (status !== PositionCloseStatus.INITIAL) {
    return (
      <OperationRows>
        {closePositionSteps.map((step, index) => (
          <OperationStepRow
            key={index}
            iconName={step.iconName}
            hash={[positionCloseHash][index]}
            statusTextMap={step.textMap}
            status={operationStatusToStepStatus({
              currentStatus: status,
              orderedSteps: closePositionSteps.flatMap((s) => [s.pending, s.loading, s.error]),
              stepIndex: index,
              pendingStep: step.pending,
              loadingStep: step.loading,
              errorStep: step.error,
              successStep: PositionCloseStatus.SUCCESS,
            })}
            isFirstStep={index === 0}
          />
        ))}
      </OperationRows>
    );
  }

  return (
    <Button onClick={() => handlePositionClose()} fullWidth>
      Close margin position
    </Button>
  );
}

enum ActionWithAssets {
  RETURN_TO_CONTRACT,
  SEND_TO_ADDRESS,
}

export default function PositionCloseDialog({
  isOpen,
  setIsOpen,
  position,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: MarginPosition;
}) {
  const { status } = usePositionCloseStatusStore();

  const isInitialStatus = useMemo(() => status === PositionCloseStatus.INITIAL, [status]);
  const isFinalStatus = useMemo(
    () => status === PositionCloseStatus.SUCCESS || status === PositionCloseStatus.ERROR_CLOSE,
    [status],
  );
  const isLoadingStatus = useMemo(
    () => !isInitialStatus && !isFinalStatus,
    [isFinalStatus, isInitialStatus],
  );

  const [actionWithAssets, setActionWithAssets] = useState(ActionWithAssets.SEND_TO_ADDRESS);
  const [addressForAssets, setAddressForAssets] = useState<string>(position.owner);
  const { expectedBalance, actualBalance } = usePositionStatus(position);

  const positionOwnerReceive = useMemo(() => {
    const result: typeof position.assetsWithBalances = [];

    if (!expectedBalance) {
      return;
    }

    for (const item of position.assetsWithBalances) {
      const isLenderToken = item.asset.equals(position.order.baseAsset);
      const isFeeToken = item.asset.equals(position.order.liquidationRewardAsset);

      let balance = BigInt(item?.balance ?? 0n);

      if (isLenderToken) {
        balance -= expectedBalance;
      }

      if (isFeeToken) {
        balance += position.order.liquidationRewardAmount.value;
      }

      result.push({ asset: item.asset, balance });
    }

    const hasFeeToken = result.some((item) =>
      item.asset.equals(position.order.liquidationRewardAsset),
    );

    if (!hasFeeToken && position.order.liquidationRewardAsset) {
      result.push({
        asset: position.order.liquidationRewardAsset,
        balance: position.order.liquidationRewardAmount.value,
      });
    }

    return result;
  }, [position, expectedBalance]);

  const baseAssetAmount = useMemo(() => {
    const assetWithBalance = position.assetsWithBalances.find((asset) =>
      asset.asset.equals(position.order.baseAsset),
    );
    return assetWithBalance?.balance;
  }, [position.assetsWithBalances, position.order.baseAsset]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Close margin position" />
      <div className={clsx(" card-spacing-x card-spacing-b w-[600px]")}>
        {!!baseAssetAmount && !!expectedBalance && baseAssetAmount > expectedBalance ? (
          <>
            <div>
              {isFinalStatus && (
                <>
                  <div className="pb-1">
                    <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                      {status === PositionCloseStatus.ERROR_CLOSE && (
                        <EmptyStateIcon iconName="warning" />
                      )}

                      {status === PositionCloseStatus.SUCCESS && (
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

                    {status === PositionCloseStatus.SUCCESS && (
                      <div>
                        <h2 className="text-center mb-1 font-bold text-20 ">
                          Margin position closed successfully
                        </h2>
                        <p className="text-center mb-1">
                          {position.loanAsset.symbol}{" "}
                          <span className="text-secondary-text">(ID: {position.id})</span>
                        </p>
                      </div>
                    )}
                    <div className="my-4 border-b border-secondary-border w-full" />
                  </div>
                </>
              )}
              {!isFinalStatus && (
                <>
                  <div className="flex flex-col">
                    <div className="pt-4 px-5 pb-5 bg-tertiary-bg rounded-3">
                      <InputLabel
                        label="You will receive"
                        inputSize={InputSize.LARGE}
                        tooltipText={"Tooltip text"}
                      />
                      <div className="flex flex-wrap gap-2 bg-quaternary-bg rounded-3 p-2">
                        {positionOwnerReceive?.map(({ asset, balance }, index) => (
                          <div
                            key={asset.wrapped.address0}
                            className="border border-primary-border py-1 px-2 rounded-2"
                          >
                            <span className="text-primary-text">
                              {balance
                                ? formatFloat(formatUnits(balance, asset.decimals))
                                : "Loading..."}
                            </span>{" "}
                            {asset.symbol}
                          </div>
                        ))}
                      </div>
                    </div>

                    {isInitialStatus && (
                      <div className="px-5 py-4 bg-tertiary-bg rounded-3 flex-grow mt-5">
                        <InputLabel inputSize={InputSize.LARGE} label="Action with assets" />
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            ActionWithAssets.RETURN_TO_CONTRACT,
                            ActionWithAssets.SEND_TO_ADDRESS,
                          ].map((action) => {
                            return (
                              <RadioButton
                                key={action}
                                className="w-full h-10 py-2 min-h-10"
                                isActive={actionWithAssets === action}
                                onClick={() => setActionWithAssets(action)}
                                disabled={action === ActionWithAssets.RETURN_TO_CONTRACT}
                              >
                                {
                                  {
                                    [ActionWithAssets.RETURN_TO_CONTRACT]: "Return to contract",
                                    [ActionWithAssets.SEND_TO_ADDRESS]: "Send to address",
                                  }[action]
                                }
                              </RadioButton>
                            );
                          })}
                        </div>
                        {actionWithAssets === ActionWithAssets.SEND_TO_ADDRESS && (
                          <div className="mt-4">
                            <TextField
                              disabled
                              value={addressForAssets}
                              onChange={(e) => {
                                setAddressForAssets(e.target.value);
                              }}
                              inputSize={InputSize.LARGE}
                              label="Address to send assets"
                              tooltipText="TOOLTIP_TEXT"
                              placeholder="0x..."
                              error={isAddress(addressForAssets) ? undefined : "Invalid address"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="my-4">
                    <SwapDetailsRow
                      tooltipText="Tooltip text"
                      title={"Will be paid back to lender"}
                      value={`${formatFloat(formatUnits(expectedBalance || BigInt(0), position.order.baseAsset.decimals))} ${position.loanAsset.symbol}`}
                    />
                  </div>
                  {isInitialStatus && (
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
                  )}
                </>
              )}

              {!isInitialStatus && !isFinalStatus && (
                <div className="my-4 h-px bg-secondary-border w-full" />
              )}
              <PositionCloseActionButton position={position} />
            </div>
            {isFinalStatus && (
              <>
                <div className="pt-4 px-5 pb-5 bg-tertiary-bg rounded-3 mt-4">
                  <InputLabel
                    label="You received"
                    inputSize={InputSize.LARGE}
                    tooltipText={"Tooltip text"}
                  />
                  <div className="flex flex-wrap gap-2 bg-quaternary-bg rounded-3 p-2">
                    {positionOwnerReceive?.map(({ asset, balance }, index) => (
                      <div
                        key={asset.wrapped.address0}
                        className="border border-primary-border py-1 px-2 rounded-2"
                      >
                        <span className="text-primary-text">
                          {balance
                            ? formatFloat(formatUnits(balance, asset.decimals))
                            : "Loading..."}
                        </span>{" "}
                        {asset.symbol}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <SwapDetailsRow
                    tooltipText="Tooltip text"
                    title={"Paid back to lender"}
                    value={`${formatFloat(formatUnits(expectedBalance || BigInt(0), position.order.baseAsset.decimals))} ${position.loanAsset.symbol}`}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4 text-secondary-text">
            You do not have enough loaned asset to close margin position
            <div className="grid grid-cols-2 gap-3 mb-1">
              <SimpleInfoBlock
                title={"Expected balance"}
                tooltipText={"Tooltip text"}
                value={`${formatFloat(
                  formatUnits(expectedBalance || BigInt(0), position.order.baseAsset.decimals),
                )} ${position.loanAsset.symbol}`}
              />
              <SimpleInfoBlock
                title={"Loaned currency balance"}
                tooltipText={"Tooltip text"}
                value={`${formatFloat(
                  formatUnits(baseAssetAmount || BigInt(0), position.order.baseAsset.decimals),
                )} ${position.loanAsset.symbol}`}
              />
            </div>
            <Alert
              type={"info"}
              text={`Go to Margin swap and exchange your assets for ${formatFloat(
                formatUnits(
                  BigInt(expectedBalance || 0) - BigInt(baseAssetAmount || 0),
                  position.order.baseAsset.decimals,
                ),
              )} ${position.loanAsset.symbol}`}
            />
            <div className="mt-1">
              <Link href="/margin-swap">
                <Button fullWidth>Go to margin swap</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DrawerDialog>
  );
}
