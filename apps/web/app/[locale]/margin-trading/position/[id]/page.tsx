"use client";
import ExternalTextLink from "@repo/ui/external-text-link";
import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SimpleBar from "simplebar-react";

import { HeaderItem } from "@/app/[locale]/borrow-market/components/BorrowMarketTable";
import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
  SortingType,
} from "@/components/buttons/IconButton";

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

function OrderInfoBlock() {
  return (
    <div>
      <h3 className="text-20 font-medium mb-3">Parameters</h3>
      <div className="grid gap-3">
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
      </div>
    </div>
  );
}

function LiquidateOrderInfoBlock() {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-20 font-medium mb-3">Liquidation detais</h3>
      <div className="flex flex-col gap-3 flex-grow">
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
        <div className="flex-grow flex items-end">
          <Button fullWidth>Liquidate</Button>
        </div>
      </div>
    </div>
  );
}

function TokenBadge() {
  return (
    <div className="bg-quaternary-bg text-tertiary-text px-2 py-1 rounded-2 flex gap-1 items-center">
      <span className="text-secondary-text">122</span>USDT
    </div>
  );
}

export default function MarginPosition() {
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
            Owner: <ExternalTextLink text="0x53D8...3BC52B" href="#" />
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Margin position ID: <span className="text-secondary-text">287342379</span>
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Lending order ID: <ExternalTextLink text="287342379" href="#" />
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GradientCard gradient={CardGradient.BLUE_LIGHT} className="px-5 py-3">
              <div className="">
                <div className="items-center flex gap-1 text-tertiary-text">
                  Total balance
                  <Tooltip text="Tooltip text" />
                </div>

                <p className="font-medium text-20">
                  1000.34 <span className="text-secondary-text">AAVE</span>
                </p>
              </div>
            </GradientCard>
            <GradientCard className=" px-5 py-3 ">
              <div className="">
                <div className="items-center flex gap-1 text-tertiary-text">
                  Expected balance
                  <Tooltip text="Tooltip text" />
                </div>

                <p className="font-medium text-20">
                  2233.34 <span className="text-secondary-text">AAVE</span>
                </p>
              </div>
            </GradientCard>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
            <OrderInfoBlock />
          </div>
          <div className="rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
            <LiquidateOrderInfoBlock />
          </div>
        </div>

        <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
          <h3 className="text-20 text-secondary-text font-medium">Time frame</h3>
          <div className="grid grid-cols-2 gap-3">
            <MarginPositionInfoCard />
            <MarginPositionInfoCard />
          </div>
          <div className="mt-2">
            <div className="grid grid-cols-3 mb-1">
              <div className="text-secondary-text">04.05.2024 08:20:00 AM</div>
              <div className="text-center text-18 ">37%</div>
              <div className="text-secondary-text text-right">04.05.2024 08:20:00 AM</div>
            </div>
            <div className="bg-secondary-bg h-5 relative">
              <div
                className={clsx("absolute h-full left-0 top-0 bg-gradient-progress-bar-green")}
                style={{ width: "33%" }}
              />
            </div>
          </div>
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
                <span className="text-20 font-medium text-secondary-text">4/16 tokens</span>
              </div>
              <div>
                <SearchInput placeholder="Token name" className="bg-primary-bg" />
              </div>
            </div>

            <SimpleBar style={{ maxHeight: 216 }}>
              <div className="flex gap-1 flex-wrap">
                {[...Array(4)].map((v, index) => {
                  return <TokenBadge key={index} />;
                })}
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
    </div>
  );
}
