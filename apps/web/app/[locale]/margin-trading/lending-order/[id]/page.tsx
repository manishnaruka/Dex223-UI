"use client";
import Image from "next/image";
import Link from "next/link";

import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import GradientCard, { CardGradient } from "@/components/atoms/GradientCard";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonColor } from "@/components/buttons/Button";

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

function OrderInfoBlock() {
  return (
    <div>
      <h3 className="text-20 font-medium mb-3">Interest rate</h3>
      <div className="grid grid-cols-2 gap-3">
        <MarginPositionInfoCard />
        <MarginPositionInfoCard />
      </div>
    </div>
  );
}

export default function LendingOrder() {
  return (
    <div className="py-10">
      <Container>
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-1">
            <Svg iconName="back" />
            Back to lending orders
          </Link>
        </div>

        <h1 className="text-40 font-medium mb-3">Lending order details</h1>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Owner: <ExternalTextLink text="0x53D8...3BC52B" href="#" />
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Lending order ID: <span className="text-secondary-text">287342379</span>
          </div>
        </div>

        <div className="py-5 px-10 bg-primary-bg rounded-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
              <span className="text-secondary-text text-18 font-bold">AAVE Token</span>
              <div className="flex items-center gap-3 text-green">
                Active
                <div className="w-2 h-2 rounded-full bg-green"></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button colorScheme={ButtonColor.LIGHT_GREEN}>Close</Button>
              <Button>Edit</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GradientCard
              gradient={CardGradient.BLUE_LIGHT}
              className="flex px-5 py-3 justify-between "
            >
              <div className="">
                <div className="items-center flex gap-1 text-tertiary-text">
                  Available balance
                  <Tooltip text="Tooltip text" />
                </div>

                <p className="font-medium text-20">
                  1000.34 <span className="text-secondary-text">AAVE</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="border-green" colorScheme={ButtonColor.LIGHT_GREEN}>
                  Deposit
                </Button>
                <Button className="border-green" colorScheme={ButtonColor.LIGHT_GREEN}>
                  Withdraw
                </Button>
              </div>
            </GradientCard>
            <GradientCard className=" px-5 py-3 ">
              <div className="">
                <div className="items-center flex gap-1 text-tertiary-text">
                  Total balance
                  <Tooltip text="Tooltip text" />
                </div>

                <p className="font-medium text-20">
                  2233.34 <span className="text-secondary-text">AAVE</span>
                </p>
              </div>
            </GradientCard>
          </div>
        </div>

        <div className="bg-primary-bg rounded-5 mb-5 py-3 px-10 flex items-center justify-between">
          <div>
            <div className="items-center flex gap-1 text-tertiary-text">
              Number of margin positions
              <Tooltip text="Tooltip text" />
            </div>
            <span className="text-20">5 margin positions</span>
          </div>
          <Button colorScheme={ButtonColor.LIGHT_GREEN} endIcon="next">
            View margin positions
          </Button>
        </div>

        <div className="grid grid-cols-2 rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
          <OrderInfoBlock />
          <OrderInfoBlock />
          <OrderInfoBlock />
          <OrderInfoBlock />
        </div>
      </Container>
    </div>
  );
}
