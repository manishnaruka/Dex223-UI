import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Link from "next/link";
import { ReactNode, useMemo } from "react";

import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";

import PositionAsset from "./widgets/PositionAsset";

enum DangerStatus {
  STABLE,
  RISKY,
  DANGEROUS,
}

type MarginPositionCardBg = "percent" | "deadline" | "margin-trading" | "currency";

export type PositionInfoCardProps = {
  title: string;
  tooltipText: string;
  value: string | ReactNode;
  bg: MarginPositionCardBg;
};

const bgMap: Record<MarginPositionCardBg, string> = {
  percent: "bg-[url(/images/card-bg/mpd.svg)]",
  deadline: "bg-[url(/images/card-bg/mpd.svg)]",
  "margin-trading": "bg-[url(/images/card-bg/mpd.svg)]",
  currency: "bg-[url(/images/card-bg/mpd.svg)]",
};

export function OrderInfoCard({ title, tooltipText, value, bg }: PositionInfoCardProps) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-center px-5 bg-tertiary-bg bg-account-card-pattern rounded-3 py-3 bg-right-top bg-no-repeat",
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

const progressBarBackgroundMap: Record<DangerStatus, string> = {
  [DangerStatus.STABLE]: "bg-gradient-progress-bar-green",
  [DangerStatus.RISKY]: "bg-gradient-progress-bar-yellow",
  [DangerStatus.DANGEROUS]: "bg-gradient-progress-bar-red",
};

export default function MarginPositionCard({
  totalBalance,
  expectedBalance,
  liquidationFee,
  liquidationCost,
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
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
      </div>

      <div className="px-5 pb-5 bg-tertiary-bg rounded-3 mb-5">
        <div className="flex justify-between">
          <span className="text-tertiary-text flex items-center gap-2">
            Assets: 12/16
            <Tooltip text="Tooltip text" />
          </span>
          <span className="flex items-center gap-2 py-2 text-secondary-text">
            Transactions history
            <Svg iconName="history" />
          </span>
        </div>

        <div className="flex gap-2">
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
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

      <div className="grid grid-cols-3 mb-1">
        <div className="text-secondary-text">04.05.2024 08:20:00 AM</div>
        <div className="text-center text-18 ">37%</div>
        <div className="text-secondary-text text-right">04.05.2024 08:20:00 AM</div>
      </div>
      <div className="bg-secondary-bg h-5 relative">
        <div
          className={clsx("absolute h-full left-0 top-0", progressBarBackgroundMap[cardStatus])}
          style={{ width: "33%" }}
        />
      </div>
    </div>
  );
}

export function LendingPositionCard({
  totalBalance,
  expectedBalance,
  liquidationFee,
  liquidationCost,
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
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
      </div>

      <div className="px-5 pb-5 bg-tertiary-bg rounded-3 mb-5">
        <div className="flex justify-between">
          <span className="text-tertiary-text flex items-center gap-2">
            Assets: 12/16
            <Tooltip text="Tooltip text" />
          </span>
          <span className="flex items-center gap-2 py-2 text-secondary-text">
            Transactions history
            <Svg iconName="history" />
          </span>
        </div>

        <div className="flex gap-2">
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
          <PositionAsset amount={12.22} symbol={"USDT"} />
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

      <div className="grid grid-cols-3 mb-1">
        <div className="text-secondary-text">04.05.2024 08:20:00 AM</div>
        <div className="text-center text-18 ">37%</div>
        <div className="text-secondary-text text-right">04.05.2024 08:20:00 AM</div>
      </div>
      <div className="bg-secondary-bg h-5 relative">
        <div
          className={clsx("absolute h-full left-0 top-0", progressBarBackgroundMap[cardStatus])}
          style={{ width: "33%" }}
        />
      </div>
    </div>
  );
}
