import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Link from "next/link";
import React, { ReactNode, useMemo } from "react";

import PositionProgressBar from "@/app/[locale]/margin-trading/components/PositionProgressBar";
import { LendingOrder, MarginPosition } from "@/app/[locale]/margin-trading/hooks/useOrder";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";

import PositionAsset from "./widgets/PositionAsset";

enum DangerStatus {
  STABLE,
  RISKY,
  DANGEROUS,
}

type MarginPositionCardBg =
  | "assets"
  | "borrowed"
  | "collateral"
  | "currency"
  | "deadline"
  | "frozen"
  | "initiate_liquidation"
  | "leverage"
  | "liquidation"
  | "liquidation_cost"
  | "liquidation_date"
  | "liquidation_fee"
  | "liquidation_price_source"
  | "ltv"
  | "margin_positions_duration"
  | "margin_trading"
  | "margin_trading_outline"
  | "margin_trading_outline_mobile"
  | "mpd"
  | "percentage"
  | "profit"
  | "reward"
  | "tokens_allowed_for_trading"
  | "closed";

export type PositionInfoCardProps = {
  title: string;
  tooltipText: string;
  value: string | ReactNode;
  bg: MarginPositionCardBg;
};

const bgMap: Record<MarginPositionCardBg, string> = {
  assets: "bg-[url(/images/card-bg/assets.svg)]",
  borrowed: "bg-[url(/images/card-bg/borrowed.svg)]",
  collateral: "bg-[url(/images/card-bg/collateral.svg)]",
  currency: "bg-[url(/images/card-bg/currency.svg)]",
  deadline: "bg-[url(/images/card-bg/deadline.svg)]",
  frozen: "bg-[url(/images/card-bg/frozen.svg)]",
  initiate_liquidation: "bg-[url(/images/card-bg/initiate_liquidation.svg)]",
  leverage: "bg-[url(/images/card-bg/leverage.svg)]",
  liquidation: "bg-[url(/images/card-bg/liquidation.svg)]",
  liquidation_cost: "bg-[url(/images/card-bg/liquidation_cost.svg)]",
  liquidation_date: "bg-[url(/images/card-bg/liquidation_date.svg)]",
  liquidation_fee: "bg-[url(/images/card-bg/liquidation_fee.svg)]",
  liquidation_price_source: "bg-[url(/images/card-bg/liquidation_price_source.svg)]",
  ltv: "bg-[url(/images/card-bg/ltv.svg)]",
  margin_positions_duration: "bg-[url(/images/card-bg/margin_positions_duration.svg)]",
  margin_trading: "bg-[url(/images/card-bg/margin_trading.svg)]",
  margin_trading_outline: "bg-[url(/images/card-bg/margin_trading_outline.svg)]",
  margin_trading_outline_mobile: "bg-[url(/images/card-bg/margin_trading_outline_mobile.svg)]",
  mpd: "bg-[url(/images/card-bg/mpd.svg)]",
  percentage: "bg-[url(/images/card-bg/percentage.svg)]",
  profit: "bg-[url(/images/card-bg/profit.svg)]",
  reward: "bg-[url(/images/card-bg/reward.svg)]",
  tokens_allowed_for_trading: "bg-[url(/images/card-bg/tokens_allowed_for_trading.svg)]",
  closed: "bg-[url(/images/card-bg/closed.svg)]",
};

export function OrderInfoCard({ title, tooltipText, value, bg }: PositionInfoCardProps) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-center px-5 bg-tertiary-bg rounded-3 py-3 bg-right-top bg-no-repeat bg-[length:120px_80px]",
        bgMap[bg],
      )}
    >
      <div className="flex items-center gap-1">
        <span className="text-14 flex items-center gap-1 text-tertiary-text">
          {title}
          <Tooltip text={tooltipText} />
        </span>
      </div>
      <div className="relative flex gap-1 font-medium text-20 text-secondary-text">{value}</div>
    </div>
  );
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
}: {
  totalBalance: number;
  expectedBalance: number;
  balanceStatus: DangerStatus;
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
        USDT
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
}: {
  label: string;
  value: number;
  liquidationFeeStatus: DangerStatus;
}) {
  return (
    <div className="border-l-4 border-tertiary-bg rounded-1 pl-4 min-w-[185px]">
      <div className="flex items-center gap-2">
        {label} <Tooltip text="Tooltip text" />
      </div>
      <p className="relative -top-1 flex gap-1 items-center text-20 font-medium">
        <span className={liquidationInfoTextColorMap[liquidationFeeStatus]}>{value}</span>
        <span className="">USDT</span>
      </p>
    </div>
  );
}

interface Props {
  totalBalance: number;
  expectedBalance: number;
  liquidationFee: number;
  liquidationCost: number;
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

export default function MarginPositionCard({
  totalBalance,
  expectedBalance,
  liquidationFee,
  liquidationCost,
  position,
}: Props) {
  const balanceStatus: DangerStatus = useMemo(() => {
    if (totalBalance < expectedBalance) {
      return DangerStatus.DANGEROUS;
    }

    if (totalBalance < expectedBalance * 1.1) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [expectedBalance, totalBalance]);

  const liquidationFeeStatus: DangerStatus = useMemo(() => {
    if (liquidationCost > liquidationFee) {
      return DangerStatus.DANGEROUS;
    }

    if (liquidationCost * 1.1 > liquidationFee) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [liquidationCost, liquidationFee]);

  const cardStatus: DangerStatus = useMemo(() => {
    if (
      liquidationFeeStatus === DangerStatus.DANGEROUS ||
      balanceStatus === DangerStatus.DANGEROUS
    ) {
      return DangerStatus.DANGEROUS;
    }

    if (liquidationFeeStatus === DangerStatus.RISKY || balanceStatus === DangerStatus.RISKY) {
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
        <Link className="flex items-center gap-2" href="#">
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
          totalBalance={totalBalance}
          expectedBalance={expectedBalance}
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
          {position.assets.map((asset, index) => (
            <PositionAsset amount={0.0} symbol={asset.symbol || "Unknown"} key={index} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex items-center justify-between mb-5">
        <div className="grid grid-cols-3">
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liquidation fee"
            value={liquidationFee}
          />
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liqudation cost"
            value={liquidationCost}
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Button fullWidth colorScheme={buttonsColor}>
            Trade
          </Button>
          <Button fullWidth colorScheme={buttonsColor}>
            Deposit
          </Button>
          <Button fullWidth colorScheme={buttonsColor}>
            Withdraw
          </Button>
          <Button fullWidth colorScheme={buttonsColor}>
            Close
          </Button>
        </div>
      </div>

      <PositionProgressBar position={position} />
    </div>
  );
}

export function LendingPositionCard({
  totalBalance,
  expectedBalance,
  liquidationFee,
  liquidationCost,
  position,
  order,
}: Props & { order: LendingOrder }) {
  const balanceStatus: DangerStatus = useMemo(() => {
    if (totalBalance < expectedBalance) {
      return DangerStatus.DANGEROUS;
    }

    if (totalBalance < expectedBalance * 1.1) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [expectedBalance, totalBalance]);

  const liquidationFeeStatus: DangerStatus = useMemo(() => {
    if (liquidationCost > liquidationFee) {
      return DangerStatus.DANGEROUS;
    }

    if (liquidationCost * 1.1 > liquidationFee) {
      return DangerStatus.RISKY;
    }

    return DangerStatus.STABLE;
  }, [liquidationCost, liquidationFee]);

  const cardStatus: DangerStatus = useMemo(() => {
    if (
      liquidationFeeStatus === DangerStatus.DANGEROUS ||
      balanceStatus === DangerStatus.DANGEROUS
    ) {
      return DangerStatus.DANGEROUS;
    }

    if (liquidationFeeStatus === DangerStatus.RISKY || balanceStatus === DangerStatus.RISKY) {
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
        <Link className="flex items-center gap-2" href="#">
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
          totalBalance={totalBalance}
          expectedBalance={expectedBalance}
        />
        {/*<MarginPositionInfoCard />*/}
        {/*<MarginPositionInfoCard />*/}
        {/*<MarginPositionInfoCard />*/}
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
          {position.assets?.map((asset) => (
            <PositionAsset
              key={asset.wrapped.address0}
              amount={12.22}
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
          />
          <div></div>
          <LiquidationInfo
            liquidationFeeStatus={liquidationFeeStatus}
            label="Liqudation cost"
            value={liquidationCost}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div />
          <div />
          <Button fullWidth colorScheme={ButtonColor.RED}>
            Liquidate
          </Button>
        </div>
      </div>

      <PositionProgressBar dangerStatus={cardStatus} position={position} />
    </div>
  );
}
