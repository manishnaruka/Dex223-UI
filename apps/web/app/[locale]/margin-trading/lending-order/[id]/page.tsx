"use client";
import Image from "next/image";
import Link from "next/link";
import SimpleBar from "simplebar-react";

import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import GradientCard, { CardGradient } from "@/components/atoms/GradientCard";
import { SearchInput } from "@/components/atoms/Input";
import ScrollbarContainer from "@/components/atoms/ScrollbarContainer";
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

function TokenBadge() {
  return <div className="bg-quaternary-bg text-secondary-text px-2 py-1 rounded-2">USDT</div>;
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

        <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
          <h3 className="text-20 text-secondary-text font-medium">Trading and collateral tokens</h3>

          <div className="bg-tertiary-bg rounded-3 pl-5 pb-5 pt-2">
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-tertiary-text flex items-center gap-1">
                    Accepted collateral tokens
                    <Tooltip text="Tooltip text" />
                  </h3>
                  <span className="text-20 font-medium">8 tokens</span>
                </div>
                <div className="flex gap-1">
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                  <TokenBadge />
                </div>
              </div>
              <div>
                <svg
                  width="120"
                  height="80"
                  viewBox="0 0 120 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_15277_9969)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M53.4004 68.0235C54.9042 69.586 56.7121 70.3672 58.8239 70.3672H87.6217C88.9016 70.3672 89.8615 69.9517 90.5014 69.1206C91.1414 68.2895 91.4614 67.3752 91.4614 66.3779C91.4614 65.3806 91.1414 64.4664 90.5014 63.6353C89.8615 62.8042 88.9016 62.3886 87.6217 62.3886H58.8239V18.839H104.9V19.8364C104.9 21.1661 105.3 22.1634 106.1 22.8283C106.9 23.4932 107.78 23.8256 108.74 23.8256C109.7 23.8256 110.58 23.4932 111.38 22.8283C112.18 22.1634 112.58 21.1661 112.58 19.8364V18.839C112.58 16.6449 111.828 14.7667 110.324 13.2042C108.82 11.6417 107.012 10.8605 104.9 10.8605H101.061V2.88193C101.061 -2.63657 99.1888 -7.34059 95.4451 -11.2301C91.7014 -15.1197 87.1737 -17.0645 81.8621 -17.0645C76.5505 -17.0645 72.0229 -15.1197 68.2792 -11.2301C64.5355 -7.34059 62.6636 -2.63657 62.6636 2.88193V10.8605H58.8239C56.7121 10.8605 54.9042 11.6417 53.4004 13.2042C51.8965 14.7667 51.1445 16.6449 51.1445 18.839V62.3886C51.1445 64.5828 51.8965 66.461 53.4004 68.0235ZM93.3812 10.8605H70.343V2.88193C70.343 -0.442465 71.4629 -3.2682 73.7028 -5.59528C75.9426 -7.92236 78.6624 -9.0859 81.8621 -9.0859C85.0619 -9.0859 87.7817 -7.92236 90.0215 -5.59528C92.2613 -3.2682 93.3812 -0.442465 93.3812 2.88193V10.8605Z"
                      fill="#2E2F2F"
                    />
                    <path
                      d="M120.235 41.4858C117.54 42.813 114.012 43.4767 109.651 43.4767C105.29 43.4767 101.761 42.813 99.0663 41.4858C96.371 40.1585 95.0234 38.6551 95.0234 36.9757C95.0234 35.2691 96.371 33.759 99.0663 32.4452C101.761 31.1315 105.29 30.4746 109.651 30.4746C114.012 30.4746 117.54 31.1315 120.235 32.4452C122.931 33.759 124.278 35.2691 124.278 36.9757C124.278 38.6551 122.931 40.1585 120.235 41.4858Z"
                      fill="#2E2F2F"
                    />
                    <path
                      d="M114.202 47.1945C112.522 47.4247 111.005 47.5398 109.651 47.5398C108.323 47.5398 106.813 47.4247 105.12 47.1945C103.427 46.9642 101.829 46.5986 100.326 46.0974C98.8225 45.5963 97.5629 44.9597 96.5471 44.1877C95.5313 43.4157 95.0234 42.5015 95.0234 41.4451V45.5083C95.0234 46.5647 95.5313 47.4789 96.5471 48.2509C97.5629 49.0229 98.8225 49.6595 100.326 50.1606C101.829 50.6617 103.427 51.0274 105.12 51.2576C106.813 51.4879 108.323 51.603 109.651 51.603C111.005 51.603 112.522 51.4879 114.202 51.2576C115.881 51.0274 117.472 50.6685 118.976 50.1809C120.479 49.6933 121.739 49.0635 122.754 48.2915C123.77 47.5195 124.278 46.5918 124.278 45.5083V41.4451C124.278 42.5286 123.77 43.4564 122.754 44.2284C121.739 45.0004 120.479 45.6302 118.976 46.1177C117.472 46.6053 115.881 46.9642 114.202 47.1945Z"
                      fill="#2E2F2F"
                    />
                    <path
                      d="M114.202 55.3208C112.522 55.551 111.005 55.6662 109.651 55.6662C108.323 55.6662 106.813 55.551 105.12 55.3208C103.427 55.0905 101.829 54.7249 100.326 54.2237C98.8225 53.7226 97.5629 53.086 96.5471 52.3141C95.5313 51.5421 95.0234 50.6278 95.0234 49.5714V53.6346C95.0234 54.691 95.5313 55.6052 96.5471 56.3772C97.5629 57.1492 98.8225 57.7858 100.326 58.2869C101.829 58.788 103.427 59.1537 105.12 59.3839C106.813 59.6142 108.323 59.7293 109.651 59.7293C111.005 59.7293 112.522 59.6142 114.202 59.3839C115.881 59.1537 117.472 58.7948 118.976 58.3072C120.479 57.8196 121.739 57.1898 122.754 56.4178C123.77 55.6458 124.278 54.7181 124.278 53.6346V49.5714C124.278 50.6549 123.77 51.5827 122.754 52.3547C121.739 53.1267 120.479 53.7565 118.976 54.244C117.472 54.7316 115.881 55.0905 114.202 55.3208Z"
                      fill="#2E2F2F"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_15277_9969">
                      <rect width="120" height="80" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-tertiary-bg rounded-3 px-5 pb-5 pt-2">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-tertiary-text flex items-center gap-1">
                  Accepted collateral tokens
                  <Tooltip text="Tooltip text" />
                </h3>
                <span className="text-20 font-medium">125 tokens</span>
              </div>
              <div>
                <SearchInput placeholder="Token name" className="bg-primary-bg" />
              </div>
            </div>

            <SimpleBar style={{ maxHeight: 216 }}>
              <div className="flex gap-1 flex-wrap">
                {[...Array(125)].map((v, index) => {
                  return <TokenBadge key={index} />;
                })}
              </div>
            </SimpleBar>
          </div>
        </div>

        <div className=" bg-primary-bg rounded-5 px-10 pt-4 pb-5 mb-5 flex flex-col gap-3">
          <h3 className="text-20 text-secondary-text font-medium">Liquidation details</h3>
          <MarginPositionInfoCard />
          <MarginPositionInfoCard />
        </div>
      </Container>
    </div>
  );
}
