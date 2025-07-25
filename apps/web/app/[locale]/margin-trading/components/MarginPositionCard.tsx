import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import React, { ReactNode, useMemo, useState } from "react";
import { formatUnits } from "viem";

import PositionProgressBar from "@/app/[locale]/margin-trading/components/PositionProgressBar";
import { OrderInfoCard } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import PositionDetailCard from "@/app/[locale]/margin-trading/components/widgets/PositionDetailCard";
import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import PositionCloseDialog from "@/app/[locale]/margin-trading/position/[id]/components/PositionCloseDialog";
import PositionDepositDialog from "@/app/[locale]/margin-trading/position/[id]/components/PositionDepositDialog";
import usePositionStatus from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionStatus";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { useNativeCurrency } from "@/hooks/useNativeCurrency";
import { Link } from "@/i18n/routing";

import PositionAsset from "./widgets/PositionAsset";

enum DangerStatus {
  STABLE,
  RISKY,
  DANGEROUS,
}

const balanceCardBackgroundMap: Record<DangerStatus, CardGradient> = {
  [DangerStatus.STABLE]: CardGradient.GREEN_LIGHT,
  [DangerStatus.RISKY]: CardGradient.YELLOW_LIGHT,
  [DangerStatus.DANGEROUS]: CardGradient.RED_LIGHT,
};

const balanceCardTextColorMap: Record<DangerStatus, string> = {
  [DangerStatus.STABLE]: "text-green",
  [DangerStatus.RISKY]: "text-yellow-light",
  [DangerStatus.DANGEROUS]: "text-red-light",
};

function MarginPositionBalanceCard({
  totalBalance,
  expectedBalance,
  balanceStatus,
  symbol = "Unknown",
}: {
  totalBalance: string;
  expectedBalance: string;
  balanceStatus: DangerStatus;
  symbol?: string;
}) {
  return (
    <GradientCard className="pt-1.5 pb-0.5 px-5" gradient={balanceCardBackgroundMap[balanceStatus]}>
      <div className="flex items-center gap-1 relative">
        <span className="text-16">Balance</span>{" "}
        <span className="text-14 flex items-center gap-1 text-secondary-text">
          Total / Expected
          <Tooltip text="Tooltip text" />
        </span>
      </div>
      <div className="relative -top-1 text-20 flex gap-1 font-medium">
        <span className={balanceCardTextColorMap[balanceStatus]}>{totalBalance}</span>
        {"/"}
        <span className={balanceCardTextColorMap[balanceStatus]}>{expectedBalance}</span>
        {symbol}
      </div>
    </GradientCard>
  );
}

const liquidationInfoTextColorMap: Record<DangerStatus, string> = {
  [DangerStatus.STABLE]: "text-green",
  [DangerStatus.RISKY]: "text-yellow-light",
  [DangerStatus.DANGEROUS]: "text-red-light",
};

function LiquidationInfo({
  label,
  value,
  liquidationFeeStatus,
  symbol,
}: {
  label: string;
  value: string;
  liquidationFeeStatus: DangerStatus;
  symbol: string;
}) {
  return (
    <div className="border-l-4 border-tertiary-bg rounded-1 pl-4 min-w-[185px]">
      <div className="flex items-center gap-2">
        {label} <Tooltip text="Tooltip text" />
      </div>
      <p className="relative -top-1 flex gap-1 items-center text-20 font-medium">
        <span className={liquidationInfoTextColorMap[liquidationFeeStatus]}>{value}</span>
        <span className="">{symbol}</span>
      </p>
    </div>
  );
}

interface Props {
  position: MarginPosition;
}

const dangerIconsMap: Record<Exclude<DangerStatus, DangerStatus.STABLE>, ReactNode> = {
  [DangerStatus.RISKY]: (
    <div className="w-10 h-10 flex justify-center items-center text-yellow-light rounded-2.5 border-yellow-light border relative before:absolute before:w-4 before:h-4 before:rounded-full before:blur-[9px] before:bg-yellow-light">
      <Svg iconName="warning" />
    </div>
  ),
  [DangerStatus.DANGEROUS]: (
    <div className="w-10 h-10 flex justify-center items-center text-red-light rounded-2.5 border-red-light border relative before:absolute before:w-4 before:h-4 before:rounded-full before:blur-[9px] before:bg-red-light">
      <Svg iconName="warning" />
    </div>
  ),
};

const marginPositionCardBorderMap: Record<DangerStatus, string> = {
  [DangerStatus.STABLE]: "border border-transparent",
  [DangerStatus.RISKY]: "border border-yellow-light shadow shadow-yellow-light/60",
  [DangerStatus.DANGEROUS]: "border border-red-light shadow shadow-red-light/60",
};

export function InactiveMarginPositionCard({ position }: Props) {
  return (
    <div className="bg-primary-bg rounded-3 px-5 pt-3 pb-5">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/margin-trading/position/${position.id}`}>View summary</Link>
        <div className="flex items-center gap-2 text-secondary-text">
          <Svg iconName="closed" />
          Executed
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <PositionDetailCard title={"Borrowed / Profit"} tooltipText={"Tooltip text"} value="" />
        <PositionDetailCard
          title={"Initial collateral / Earning"}
          tooltipText={"Tooltip text"}
          value="0"
        />
        <PositionDetailCard title={"Leverage"} tooltipText={"Tooltip text"} value="" />
      </div>

      <div className="grid grid-cols-3">
        <LiquidationInfo
          label={"Closing date"}
          value={position.deadline.toString()}
          liquidationFeeStatus={DangerStatus.STABLE}
          symbol={"USTD"}
        />
      </div>
    </div>
  );
}

export default function MarginPositionCard({ position }: Props) {
  const liquidationFee = useMemo(() => {
    return formatUnits(position.liquidationRewardAmount, position.liquidationRewardAsset.decimals);
  }, [position.liquidationRewardAmount, position.liquidationRewardAsset.decimals]);

  const [positionToClose, setPositionToClose] = useState<MarginPosition | undefined>();
  const [positionToDeposit, setPositionToDeposit] = useState<MarginPosition | undefined>();

  console.log("POSITION", position);

  const { expectedBalance, actualBalance } = usePositionStatus(position);

  const nativeCurrency = useNativeCurrency();

  const balanceStatus: DangerStatus = useMemo(() => {
    if (actualBalance != null && expectedBalance != null && actualBalance <= expectedBalance) {
      return DangerStatus.DANGEROUS;
    }

    if (
      actualBalance != null &&
      expectedBalance != null &&
      actualBalance * BigInt(10) < expectedBalance * BigInt(11)
    ) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [actualBalance, expectedBalance]);

  const liquidationFeeStatus: DangerStatus = useMemo(() => {
    // if (+liquidationCost > +liquidationFee) {
    //   return DangerStatus.DANGEROUS;
    // }
    //
    // if (+liquidationCost * 1.1 > +liquidationFee) {
    //   return DangerStatus.RISKY;
    // }

    return DangerStatus.STABLE;
  }, []);

  const cardStatus: DangerStatus = useMemo(() => {
    if (
      // liquidationFeeStatus === DangerStatus.DANGEROUS ||
      balanceStatus === DangerStatus.DANGEROUS
    ) {
      return DangerStatus.DANGEROUS;
    }

    if (balanceStatus === DangerStatus.RISKY) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [balanceStatus, liquidationFeeStatus]);

  const buttonsColor: ButtonColor = useMemo(() => {
    if (cardStatus === DangerStatus.DANGEROUS) {
      return ButtonColor.LIGHT_RED;
    }

    if (cardStatus === DangerStatus.RISKY) {
      return ButtonColor.LIGHT_YELLOW;
    }

    return ButtonColor.LIGHT_GREEN;
  }, [cardStatus]);

  return (
    <div
      className={clsx(
        "rounded-3 bg-primary-bg pb-5 pt-3 px-5",
        marginPositionCardBorderMap[cardStatus],
      )}
    >
      <div className="flex justify-between mb-3 min-h-10 items-center">
        <Link className="flex items-center gap-2" href={`/margin-trading/position/${position.id}`}>
          View margin position details
          <Svg iconName="next" />
        </Link>
        <span className="text-green flex items-center gap-3 ">
          {balanceStatus !== DangerStatus.STABLE && dangerIconsMap[balanceStatus]}
          {liquidationFeeStatus !== DangerStatus.STABLE && dangerIconsMap[liquidationFeeStatus]}

          <div className="min-w-[115px] text-green flex items-center gap-2 justify-end">
            Active
            <span className="block w-2 h-2 rounded-2 bg-green" />
          </div>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <MarginPositionBalanceCard
          balanceStatus={balanceStatus}
          totalBalance={
            actualBalance != null
              ? formatFloat(formatUnits(actualBalance, position.loanAsset.decimals))
              : "Loading..."
          }
          expectedBalance={
            expectedBalance != null
              ? formatFloat(formatUnits(expectedBalance, position.loanAsset.decimals))
              : "Loading..."
          }
          symbol={position.loanAsset.symbol}
        />
      </div>

      <div className="px-5 pb-5 bg-tertiary-bg rounded-3 mb-5">
        <div className="flex justify-between">
          <span className="text-tertiary-text flex items-center gap-2">
            Assets: {position.assets.length} / {position.currencyLimit} tokens
            <Tooltip text="Tooltip text" />
          </span>
          <span className="flex items-center gap-2 py-2 text-secondary-text">
            Transactions history
            <Svg iconName="history" />
          </span>
        </div>

        <div className="flex gap-2">
          {position.assetsWithBalances.map(({ asset, balance }, index) => (
            <PositionAsset
              amount={formatUnits(balance, asset.decimals)}
              symbol={asset.symbol || "Unknown"}
              key={index}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex items-center justify-between mb-5 w-full">
        <div className="grid grid-cols-3">
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liquidation fee"
            value={liquidationFee}
            symbol={position.liquidationRewardAsset.symbol || "Unknown"}
          />
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liqudation cost"
            value={"0"}
            symbol={nativeCurrency.symbol || "Unknown"}
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Link href={"/margin-swap"}>
            <Button fullWidth colorScheme={buttonsColor}>
              Trade
            </Button>
          </Link>
          <Button
            onClick={() => setPositionToDeposit(position)}
            fullWidth
            colorScheme={buttonsColor}
          >
            Deposit
          </Button>
          <Button disabled fullWidth colorScheme={buttonsColor}>
            Withdraw
          </Button>
          <Button onClick={() => setPositionToClose(position)} fullWidth colorScheme={buttonsColor}>
            Close
          </Button>
        </div>
      </div>

      <PositionProgressBar position={position} />

      {positionToClose && (
        <PositionCloseDialog
          isOpen={!!positionToClose}
          position={positionToClose}
          setIsOpen={() => setPositionToClose(undefined)}
        />
      )}
      {positionToDeposit && (
        <PositionDepositDialog
          isOpen={!!positionToDeposit}
          position={positionToDeposit}
          setIsOpen={() => setPositionToDeposit(undefined)}
        />
      )}
    </div>
  );
}

export function LendingPositionCard({ position, order }: Props & { order: LendingOrder }) {
  const liquidationFee = useMemo(() => {
    return formatUnits(order.liquidationRewardAmount, order.liquidationRewardAsset.decimals);
  }, [order.liquidationRewardAmount, order.liquidationRewardAsset.decimals]);

  console.log(position);

  const { expectedBalance, actualBalance } = usePositionStatus(position);

  const nativeCurrency = useNativeCurrency();

  const balanceStatus: DangerStatus = useMemo(() => {
    if (actualBalance != null && expectedBalance != null && actualBalance <= expectedBalance) {
      return DangerStatus.DANGEROUS;
    }

    if (
      actualBalance != null &&
      expectedBalance != null &&
      actualBalance * BigInt(10) < expectedBalance * BigInt(11)
    ) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [actualBalance, expectedBalance]);

  const liquidationFeeStatus: DangerStatus = useMemo(() => {
    // if (+liquidationCost > +liquidationFee) {
    //   return DangerStatus.DANGEROUS;
    // }
    //
    // if (+liquidationCost * 1.1 > +liquidationFee) {
    //   return DangerStatus.RISKY;
    // }

    return DangerStatus.STABLE;
  }, []);

  const cardStatus: DangerStatus = useMemo(() => {
    if (
      // liquidationFeeStatus === DangerStatus.DANGEROUS ||
      balanceStatus === DangerStatus.DANGEROUS
    ) {
      return DangerStatus.DANGEROUS;
    }

    if (balanceStatus === DangerStatus.RISKY) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [balanceStatus, liquidationFeeStatus]);

  const buttonsColor: ButtonColor = useMemo(() => {
    if (cardStatus === DangerStatus.DANGEROUS) {
      return ButtonColor.LIGHT_RED;
    }

    if (cardStatus === DangerStatus.RISKY) {
      return ButtonColor.LIGHT_YELLOW;
    }

    return ButtonColor.LIGHT_GREEN;
  }, [cardStatus]);

  return (
    <div
      className={clsx(
        "rounded-3 bg-primary-bg pb-5 pt-3 px-5",
        marginPositionCardBorderMap[cardStatus],
      )}
    >
      <div className="flex justify-between mb-3 min-h-10 items-center">
        <Link className="flex items-center gap-2" href={`/margin-trading/position/${position.id}`}>
          View margin position details
          <Svg iconName="next" />
        </Link>
        <span className="text-green flex items-center gap-3 ">
          {balanceStatus !== DangerStatus.STABLE && dangerIconsMap[balanceStatus]}
          {liquidationFeeStatus !== DangerStatus.STABLE && dangerIconsMap[liquidationFeeStatus]}

          <div className="min-w-[115px] text-green flex items-center gap-2 justify-end">
            Active
            <span className="block w-2 h-2 rounded-2 bg-green" />
          </div>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <MarginPositionBalanceCard
          balanceStatus={balanceStatus}
          totalBalance={
            actualBalance != null
              ? formatFloat(formatUnits(actualBalance, position.loanAsset.decimals))
              : "Loading..."
          }
          expectedBalance={
            expectedBalance != null
              ? formatFloat(formatUnits(expectedBalance, position.loanAsset.decimals))
              : "Loading..."
          }
          symbol={order.baseAsset.symbol}
        />
      </div>

      <div className="px-5 pb-5 bg-tertiary-bg rounded-3 mb-5">
        <div className="flex justify-between">
          <span className="text-tertiary-text flex items-center gap-2">
            Assets: {position.assets.length} / {order.currencyLimit}
            <Tooltip text="Tooltip text" />
          </span>
          <span className="flex items-center gap-2 py-2 text-secondary-text">
            Transactions history
            <Svg iconName="history" />
          </span>
        </div>

        <div className="flex gap-2">
          {position.assetsWithBalances?.map(({ asset, balance }) => (
            <PositionAsset
              key={asset.wrapped.address0}
              amount={formatUnits(balance, asset.decimals)}
              symbol={asset.symbol || "Unknown"}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex items-center justify-between mb-5">
        <div className="grid grid-cols-3">
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liquidation fee"
            value={liquidationFee}
            symbol={order.liquidationRewardAsset.symbol || "Unknown"}
          />
          <div></div>
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liqudation cost"
            value={"0"}
            symbol={nativeCurrency.symbol || "Unknown"}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div />
          <div />
          <Link href={`/margin-trading/position/${position.id}/liquidate`}>
            <Button
              disabled={
                actualBalance != null && expectedBalance != null && actualBalance > expectedBalance
              }
              fullWidth
              colorScheme={ButtonColor.RED}
            >
              Liquidate
            </Button>
          </Link>
        </div>
      </div>

      <PositionProgressBar dangerStatus={cardStatus} position={position} />
    </div>
  );
}
