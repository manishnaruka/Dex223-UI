import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Link from "next/link";
import { formatUnits } from "viem";

import MarginPositionCard, {
  LendingPositionCard,
} from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";

function LendingOrderInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-center px-5 bg-tertiary-bg rounded-3 py-2.5">
      <div className="flex items-center gap-1">
        <span className="text-14 flex items-center gap-1 text-tertiary-text">
          {label}
          <Tooltip text="Tooltip text" />
        </span>
      </div>
      <div className="text-16 font-medium text-secondary-text whitespace-nowrap">{value}</div>
    </div>
  );
}

function LiquidationInfo({
  label,
  feeForLiquidator,
  feeForLender,
  symbol,
}: {
  label: string;
  feeForLiquidator: string;
  feeForLender: string;
  symbol: string;
}) {
  return (
    <div className="border-l-4 border-tertiary-bg rounded-1 pl-4 min-w-[185px]">
      <div className="flex items-center gap-2 whitespace-nowrap">
        {label} <Tooltip text="Tooltip text" />
      </div>
      <p className="relative -top-1 flex gap-1 whitespace-nowrap items-center font-medium">
        <span className="text-secondary-text">{feeForLiquidator}</span>
        <span className="">{symbol}</span>
      </p>
    </div>
  );
}

export default function LendingOrderCard({
  order,
  setOrderToDeposit,
  setOrderToWithdraw,
}: {
  order: LendingOrder;
  setOrderToDeposit: (order: LendingOrder) => void;
  setOrderToWithdraw: (order: LendingOrder) => void;
}) {
  console.log(order);

  return (
    <>
      <div className="border-4 border-green-bg rounded-5 pt-3 px-5 pb-5 bg-primary-bg">
        <div className="flex justify-between mb-3 min-h-10 items-center">
          <Link
            className="flex items-center gap-2"
            href={`/margin-trading/lending-order/${order.id}`}
          >
            View lending order details
            <Svg iconName="next" />
          </Link>
          <span className="text-green flex items-center gap-3 ">
            <div className="min-w-[115px] text-green flex items-center gap-2 justify-end">
              Active
              <span className="block w-2 h-2 rounded-2 bg-green" />
            </div>
          </span>
        </div>
        <div className="grid grid-cols-[5fr_5fr] gap-3">
          <div className="grid grid-cols-[auto_min-content] gap-3">
            <div
              className={clsx(
                "z-10 relative  before:w-[calc(100%_+_2px)] before:h-[calc(100%_+_2px)] before:-top-px before:-left-px before:rounded-3 before:absolute",
                "before:bg-gradient-card-green-dark-border",
              )}
            >
              <div
                style={{
                  backgroundImage:
                    "url('/images/lending-balance-bg.svg'), linear-gradient(90deg, #1F2020 0%, #3C4B4A 100%)",
                }}
                className="p-5 rounded-3 bg-right-top bg-no-repeat relative"
              >
                <p className="text-20 font-medium">Balance</p>
                <span className="text-14 flex items-center gap-1 text-secondary-text">
                  Available / Total
                  <Tooltip text="Tooltip text" />
                </span>
                <p className="text-20">
                  1000 / 500 <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <LendingOrderInfoCard
                label="Deadline"
                value={`${new Date(order.deadline * 1000)
                  .toLocaleDateString("en-GB")
                  .split("/")
                  .join(".")} ${new Date(order.deadline * 1000).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}`}
              />

              <LiquidationInfo
                symbol={order.liquidationRewardAsset.symbol || "Unknown"}
                feeForLiquidator={formatUnits(
                  order.liquidationRewardAmount,
                  order.liquidationRewardAsset.decimals,
                )}
                feeForLender={formatUnits(
                  order.liquidationRewardAmount,
                  order.liquidationRewardAsset.decimals,
                )}
                label="Fee for liquidator"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <LendingOrderInfoCard
                label={"Duration"}
                value={`${order.positionDuration / 24 / 60 / 60} days`}
              />
              <LendingOrderInfoCard label="Max leverage" value={`${order.leverage}x`} />
              <LendingOrderInfoCard
                label="Interest rate"
                value={`${order.interestRate / 100}% per month`}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Button colorScheme={ButtonColor.LIGHT_GREEN}>Close</Button>
              <Button
                onClick={() => setOrderToDeposit(order)}
                colorScheme={ButtonColor.LIGHT_GREEN}
              >
                Deposit
              </Button>
              <Button
                onClick={() => setOrderToWithdraw(order)}
                colorScheme={ButtonColor.LIGHT_GREEN}
              >
                Withdraw
              </Button>
              <Button colorScheme={ButtonColor.LIGHT_GREEN}>Edit</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-5 grid-cols-[80px_1fr]">
        {!!order.positions?.length &&
          order.positions.map((position, index) => (
            <>
              <div
                className={clsx(
                  "relative -top-[68px]",
                  index !== order.positions!.length - 1 &&
                    "before:w-1 before:absolute before:bg-green-bg before:left-0 before:h-full before:top-[68px]",
                )}
              >
                <svg
                  width="80"
                  height="112"
                  viewBox="0 0 80 112"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M80 100L60 88.453V111.547L80 100ZM0 0V92H4V0H0ZM10 102H62V98H10V102ZM0 92C0 97.5229 4.47715 102 10 102V98C6.68629 98 4 95.3137 4 92H0Z"
                    fill="#3C4C4A"
                  />
                </svg>
              </div>

              <LendingPositionCard
                totalBalance={2}
                expectedBalance={10}
                liquidationFee={2}
                liquidationCost={10}
                position={position}
              />
            </>
          ))}
      </div>
    </>
  );
}
