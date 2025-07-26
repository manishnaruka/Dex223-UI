"use client";
import ExternalTextLink from "@repo/ui/external-text-link";
import GradientCard from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { use, useState } from "react";
import SimpleBar from "simplebar-react";
import { formatUnits } from "viem";

import PositionProgressBar from "@/app/[locale]/margin-trading/components/PositionProgressBar";
import {
  OrderInfoBlock,
  OrderInfoCard,
} from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import PositionAsset from "@/app/[locale]/margin-trading/components/widgets/PositionAsset";
import useMarginPositionById from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import PositionCloseDialog from "@/app/[locale]/margin-trading/position/[id]/components/PositionCloseDialog";
import PositionDepositDialog from "@/app/[locale]/margin-trading/position/[id]/components/PositionDepositDialog";
import PositionWithdrawDialog from "@/app/[locale]/margin-trading/position/[id]/components/PositionWithdrawDialog";
import usePositionStatus from "@/app/[locale]/margin-trading/position/[id]/hooks/usePositionStatus";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import truncateMiddle from "@/functions/truncateMiddle";

function MarginPositionInfoCard() {
  return (
    <div className="flex flex-col justify-center px-5 bg-tertiary-bg rounded-3 py-3">
      <div className="flex items-center gap-1">
        <span className="text-14 flex items-center gap-1 text-secondary-text">
          Borrowed
          <Tooltip text="Tooltip text" />
        </span>
      </div>
      <div className="relative flex gap-1">
        <span>100</span> USDT
      </div>
    </div>
  );
}

type Order = {
  token: {
    minAmount: number;
    maxAmount: number;
    name: string;
  };
  interest: number;
  leverage: number;
  limit: number;
  collateralTokens: number;
  tradableTokens: number;
  period: number | [number, number];
};

const testData: Order[] = [
  {
    token: { name: "AAVE", minAmount: 100, maxAmount: 1000 },
    interest: 5,
    leverage: 2,
    limit: 6,
    collateralTokens: 3,
    tradableTokens: 22,
    period: 4,
  },
  {
    token: { name: "DOGE", minAmount: 1000, maxAmount: 10000 },
    interest: 51,
    leverage: 6,
    limit: 4,
    collateralTokens: 32,
    tradableTokens: 6,
    period: [3, 5],
  },
  {
    token: { name: "SOL", minAmount: 52, maxAmount: 88 },
    interest: 10,
    leverage: 10,
    limit: 4,
    collateralTokens: 2421,
    tradableTokens: 67,
    period: [2, 8],
  },
  {
    token: { name: "XDAI", minAmount: 667, maxAmount: 8823 },
    interest: 25,
    leverage: 6,
    limit: 3,
    collateralTokens: 144,
    tradableTokens: 24,
    period: 34,
  },
  {
    token: { name: "RADIX", minAmount: 76.4, maxAmount: 817.23 },
    interest: 15,
    leverage: 14,
    limit: 4,
    collateralTokens: 1414,
    tradableTokens: 357,
    period: [30, 48],
  },
  {
    token: { name: "SHIBDOGE", minAmount: 25, maxAmount: 182 },
    interest: 5,
    leverage: 12,
    limit: 5,
    collateralTokens: 175,
    tradableTokens: 100356,
    period: 30,
  },
  {
    token: { name: "BTTC", minAmount: 2671.2, maxAmount: 827.5 },
    interest: 8,
    leverage: 10,
    limit: 5,
    collateralTokens: 26,
    tradableTokens: 2,
    period: 1,
  },
  {
    token: { name: "AVAX", minAmount: 782, maxAmount: 2893 },
    interest: 10,
    leverage: 16,
    limit: 8,
    collateralTokens: 88,
    tradableTokens: 33,
    period: 13,
  },
  {
    token: { name: "ONE", minAmount: 238, maxAmount: 2993 },
    interest: 13,
    leverage: 2,
    limit: 4,
    collateralTokens: 35,
    tradableTokens: 234,
    period: 15,
  },
  {
    token: { name: "GLMR", minAmount: 782, maxAmount: 1456 },
    interest: 5,
    leverage: 10,
    limit: 6,
    collateralTokens: 1,
    tradableTokens: 124,
    period: [1, 3],
  },
];

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

export default function MarginPositionPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id: positionId } = use(params);

  const { position, loading } = useMarginPositionById({ id: positionId });
  const [isDepositDialogOpened, setIsDepositDialogOpened] = useState(false);
  const [isCloseDialogOpened, setIsCloseDialogOpened] = useState(false);
  const [isWithdrawDialogOpened, setIsWithdrawDialogOpened] = useState(false);
  console.log(position);

  if (loading || !position) {
    return "Loading";
  }

  return (
    <div className="py-10">
      <Container>
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-1">
            <Svg iconName="back" />
            Back to margin positions
          </Link>
        </div>

        <h1 className="text-40 font-medium mb-3">Margin position details</h1>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Owner:{" "}
            <ExternalTextLink
              text={truncateMiddle(position.owner, { charsFromEnd: 6, charsFromStart: 6 })}
              href="#"
            />
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Margin position ID: <span className="text-secondary-text">{position.id}</span>
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Lending order ID: <ExternalTextLink text={position.order.id.toString()} href="#" />
          </div>
        </div>

        <div className="py-5 px-10 bg-primary-bg rounded-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
              <span className="text-secondary-text text-18 font-bold">AAVE Token</span>
              <div className="flex items-center gap-3 text-green">
                Active
                <div className="w-2 h-2 rounded-full bg-green" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button colorScheme={ButtonColor.LIGHT_GREEN}>Trade</Button>
              <Button
                colorScheme={ButtonColor.LIGHT_GREEN}
                onClick={() => setIsDepositDialogOpened(true)}
              >
                Deposit
              </Button>
              <Button
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
                  / 0 <span className="text-secondary-text">ETH</span>
                </p>
              </div>
            </GradientCard>
          </div>
        </div>

        <div className="rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
          <OrderInfoBlock
            title="Parameters"
            cards={[
              {
                title: "Borrowed",
                tooltipText: "Tooltip text",
                value: "5%",
                bg: "borrowed",
              },
              {
                title: "Initial collateral",
                tooltipText: "Tooltip text",
                value: "15%",
                bg: "collateral",
              },
              {
                title: "Leverage",
                tooltipText: "Tooltip text",
                value: "15%",
                bg: "leverage",
              },
            ]}
          />
        </div>

        <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
          <h3 className="text-20 text-secondary-text font-medium">Time frame</h3>
          <div className="grid grid-cols-2 gap-3">
            <OrderInfoCard
              value={"7 days"}
              title="Margin position duration"
              tooltipText={"Tooltip text"}
              bg="margin_positions_duration"
            />
            <OrderInfoCard
              value={new Date(position.deadline * 1000)
                .toLocaleString("en-GB")
                .split("/")
                .join(".")}
              title="Lending order deadline"
              tooltipText={"Tooltip text"}
              bg="deadline"
            />
          </div>
          <PositionProgressBar position={position} />
        </div>

        <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
          <h3 className="text-20 text-secondary-text font-medium">Assets</h3>

          <div className="bg-tertiary-bg rounded-3 px-5 pb-5 pt-2">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-tertiary-text flex items-center gap-1">
                  Assets
                  <Tooltip text="Tooltip text" />
                </h3>
                <span className="text-20 font-medium text-secondary-text">
                  {position.assets.length} / {position.order.currencyLimit} tokens
                </span>
              </div>
              <div>
                <SearchInput placeholder="Token name" className="bg-primary-bg" />
              </div>
            </div>

            <SimpleBar style={{ maxHeight: 216 }}>
              <div className="flex gap-1 flex-wrap">
                {position.assetsWithBalances?.map(({ asset, balance }) => (
                  <PositionAsset
                    key={asset.wrapped.address0}
                    amount={formatFloat(formatUnits(balance || BigInt(0), asset.decimals))}
                    symbol={asset.symbol || "Unknown"}
                  />
                ))}
              </div>
            </SimpleBar>
          </div>
        </div>

        <div className=" bg-primary-bg rounded-5  pt-4 pb-5 mb-5 flex flex-col gap-3">
          <h3 className="text-20 text-secondary-text font-medium px-10">Transactions history</h3>
          <div className="grid rounded-2 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,1.33fr),_minmax(77px,1.33fr),_minmax(87px,1.33fr),_minmax(50px,2.67fr)] pb-2">
            <div className="h-[60px] flex items-center pl-10">Txn hash</div>
            <div className="h-[60px] flex items-center">Age</div>
            <div className="h-[60px] flex items-center">Type</div>
            <div className="h-[60px] flex items-center pr-5">Action</div>

            {testData.map((o, index) => {
              return (
                <React.Fragment key={index}>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center gap-2 pl-10",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <ExternalTextLink text="0x3k435213dsd...sadf" href={"#"} />
                  </div>
                  <div
                    className={clsx(
                      " h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    14 days 45 mins ago
                  </div>
                  <div
                    className={clsx(
                      " h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <Svg iconName="borrow" /> Borrow
                  </div>
                  <div
                    className={clsx(
                      " h-[56px] flex items-center pr-5  ",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    Borrowing 40 USDT
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Container>

      <PositionDepositDialog
        isOpen={isDepositDialogOpened}
        setIsOpen={setIsDepositDialogOpened}
        position={position}
      />

      <PositionWithdrawDialog
        isOpen={isWithdrawDialogOpened}
        setIsOpen={setIsWithdrawDialogOpened}
        position={position}
      />

      <PositionCloseDialog
        isOpen={isCloseDialogOpened}
        position={position}
        setIsOpen={setIsCloseDialogOpened}
      />
    </div>
  );
}
