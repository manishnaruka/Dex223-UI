import GradientCard from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { formatUnits } from "viem";

import PositionHealthStatus from "@/app/[locale]/margin-trading/components/widgets/PositionHealthStatus";
import usePositionLiquidationCost from "@/app/[locale]/margin-trading/hooks/usePositionLiquidationCost";
import usePositionStatus from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionStatus";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import Button, { ButtonColor } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { useNativeCurrency } from "@/hooks/useNativeCurrency";

function BalanceCard({ position }: { position: MarginPosition }) {
  const { expectedBalance, actualBalance } = usePositionStatus(position);

  return (
    <GradientCard className="px-5 py-3">
      <div className="">
        <div className="flex items-center gap-1 text-tertiary-text">
          Total balance
          <Tooltip text="Tooltip text" />
          <span>/</span>
          Expected balance
          <Tooltip text="Tooltip text" />
        </div>

        <p className="font-medium text-20">
          {actualBalance
            ? formatFloat(formatUnits(actualBalance, position.loanAsset.decimals))
            : "Loading..."}{" "}
          /{" "}
          {expectedBalance
            ? formatFloat(formatUnits(expectedBalance, position.loanAsset.decimals))
            : "Loading..."}
          <span className="text-secondary-text"> {position.loanAsset.symbol}</span>
        </p>
      </div>
    </GradientCard>
  );
}

export default function ActivePositionMainInfoBlock({
  position,
  setIsWithdrawDialogOpened,
  setIsCloseDialogOpened,
}: {
  position: MarginPosition;
  setIsWithdrawDialogOpened: (isOpened: boolean) => void;
  setIsCloseDialogOpened: (isOpened: boolean) => void;
}) {
  const { formatted } = usePositionLiquidationCost(position);
  const nativeCurrency = useNativeCurrency();

  const { expectedBalance, actualBalance } = usePositionStatus(position);

  const health = useMemo(() => {
    if (!expectedBalance || !actualBalance) {
      return 1;
    }

    return Number(actualBalance) / Number(expectedBalance);
  }, [actualBalance, expectedBalance]);

  const subjectToLiquidation = useMemo(() => {
    return actualBalance != null && expectedBalance != null && actualBalance <= expectedBalance;
  }, [actualBalance, expectedBalance]);

  return (
    <div className="py-5 px-10 bg-primary-bg rounded-5 mb-5">
      <div className="grid grid-cols-2 items-center mb-3 gap-3">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
            <span className="text-secondary-text text-18 font-bold">{position.loanAsset.name}</span>
            <div className="flex items-center gap-3 text-green">
              Active
              <div className="w-2 h-2 rounded-full bg-green" />
            </div>
          </div>
          <PositionHealthStatus health={health} />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button disabled={subjectToLiquidation} colorScheme={ButtonColor.LIGHT_GREEN}>
            Trade
          </Button>
          <Link href={`/margin-trading/position/${position.id}/deposit`}>
            <Button
              colorScheme={subjectToLiquidation ? ButtonColor.LIGHT_RED : ButtonColor.LIGHT_GREEN}
            >
              Deposit
            </Button>
          </Link>

          {subjectToLiquidation ? (
            <Link href={`/margin-trading/position/${position.id}/liquidate`}>
              <Button colorScheme={ButtonColor.RED}>Liquidate</Button>
            </Link>
          ) : (
            <>
              <Button
                disabled={!position.isClosed}
                colorScheme={ButtonColor.LIGHT_GREEN}
                onClick={() => setIsWithdrawDialogOpened(true)}
              >
                Withdraw
              </Button>
              <Button
                colorScheme={ButtonColor.LIGHT_GREEN}
                onClick={() => setIsCloseDialogOpened(true)}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BalanceCard position={position} />
        <GradientCard className="px-5 py-3">
          <div className="">
            <div className="flex items-center gap-1 text-tertiary-text">
              Liquidation fee
              <Tooltip text="Tooltip text" />
              <span>/</span>
              Liquidation cost
              <Tooltip text="Tooltip text" />
            </div>

            <p className="font-medium text-20">
              {position.order.liquidationRewardAmount.formatted}{" "}
              <span className="text-secondary-text">
                {position.order.liquidationRewardAsset.symbol}
              </span>{" "}
              / {formatted} <span className="text-secondary-text">{nativeCurrency.symbol}</span>
            </p>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
