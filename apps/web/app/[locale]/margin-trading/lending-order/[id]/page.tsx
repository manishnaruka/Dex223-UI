"use client";
import ExternalTextLink from "@repo/ui/external-text-link";
import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import React, { use, useMemo, useRef, useState } from "react";
import SimpleBar from "simplebar-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import {
  InactiveMarginPositionCard,
  LendingPositionCard,
} from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import {
  OrderInfoBlock,
  OrderInfoCard,
} from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import { useOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import OrderCloseDialog from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderCloseDialog";
import OrderDepositDialog from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderDepositDialog";
import OrderOpenDialog from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderOpenDialog";
import OrderWithdrawDialog from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderWithdrawDialog";
import { calculatePeriodInterestRate } from "@/app/[locale]/margin-trading/lending-order/[id]/helpers/calculatePeriodInterestRate";
import calculateTotalOrderBalance from "@/app/[locale]/margin-trading/lending-order/[id]/helpers/calculateTotalOrderBalance";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor } from "@/components/buttons/Button";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { filterTokens } from "@/functions/searchTokens";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokenLists } from "@/hooks/useTokenLists";
import { Link } from "@/i18n/routing";
import { ORACLE_ADDRESS } from "@/sdk_bi/addresses";
import { Token } from "@/sdk_bi/entities/token";

export default function LendingOrder({
  params,
}: {
  params: Promise<{
    id: number;
  }>;
}) {
  const [isDepositDialogOpened, setIsDepositDialogOpened] = useState(false);
  const [isCloseDialogOpened, setIsCloseDialogOpened] = useState(false);
  const [isOpenDialogOpened, setIsOpenDialogOpened] = useState(false);
  const [isWithdrawDialogOpened, setIsWithdrawDialogOpened] = useState(false);
  const { id } = use(params);
  const { address } = useAccount();

  const { order, loading, refetch } = useOrder({ id: +id });
  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);
  const chainId = useCurrentChainId();

  const tokenLists = useTokenLists();

  const isOwner = useMemo(() => {
    if (!address || !order) {
      return false;
    }

    return address.toLowerCase() === order?.owner.toLowerCase();
  }, [address, order]);

  console.log(order?.allowedCollateralAssets);
  const requestTimeRef = useRef<number>(Date.now());

  const [searchTradableTokenValue, setSearchTradableTokenValue] = useState("");

  const [filteredTokens, isTokenFilterActive] = useMemo(() => {
    return searchTradableTokenValue
      ? [filterTokens(searchTradableTokenValue, order?.allowedTradingAssets || []), true]
      : [order?.allowedTradingAssets || [], false];
  }, [searchTradableTokenValue, order?.allowedTradingAssets]);

  if (loading || !order) {
    return <div className="text-24 p-5">Order is loading...</div>;
  }

  return (
    <div className="py-10">
      <Container>
        <div className="mb-10">
          <Link href="/margin-trading" className="flex items-center gap-1">
            <Svg iconName="back" />
            Back to lending orders
          </Link>
        </div>

        <h1 className="text-40 font-medium mb-3">Lending order details</h1>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 pl-5 pr-4 py-1 min-h-12 text-tertiary-text">
            Owner:{" "}
            <ExternalTextLink
              text={truncateMiddle(order.owner, { charsFromEnd: 6, charsFromStart: 6 })}
              href={getExplorerLink(ExplorerLinkType.ADDRESS, order.owner, chainId)}
            />
          </div>
          <div className="bg-primary-bg rounded-2 flex items-center gap-1 px-5 py-1 min-h-12 text-tertiary-text">
            Lending order ID: <span className="text-secondary-text">{id}</span>
          </div>
        </div>

        <div className="py-5 px-10 bg-primary-bg rounded-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
              <span className="text-secondary-text text-18 font-bold">{order.baseAsset.name}</span>
              {order.alive ? (
                <div className="flex items-center gap-3 text-green">
                  Active
                  <div className="w-2 h-2 rounded-full bg-green"></div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-tertiary-text">
                  Closed
                  <Svg iconName="closed" />
                </div>
              )}
            </div>

            {isOwner ? (
              <div className="flex items-center gap-3">
                {order.alive ? (
                  <Button
                    onClick={() => setIsCloseDialogOpened(true)}
                    colorScheme={ButtonColor.LIGHT_GREEN}
                  >
                    Close
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsOpenDialogOpened(true)}
                    colorScheme={ButtonColor.LIGHT_GREEN}
                  >
                    Open
                  </Button>
                )}
                <Link href={`/margin-trading/lending-order/${order.id}/edit`}>
                  <Button>Edit</Button>
                </Link>
              </div>
            ) : (
              <>
                {order.alive && (
                  <div className="flex items-center gap-3">
                    <Link
                      className={"flex-shrink-0 pointer-events-none"}
                      href={`/margin-trading/lending-order/${order.id}/borrow`}
                    >
                      <Button disabled colorScheme={ButtonColor.LIGHT_PURPLE}>
                        Margin swap
                      </Button>
                    </Link>
                    <Link
                      className={
                        order.balance < order.minLoan ||
                        requestTimeRef.current / 1000 > order.deadline ||
                        order.allowedTradingAssets.length === 0
                          ? "pointer-events-none"
                          : ""
                      }
                      href={`/margin-trading/lending-order/${order.id}/borrow`}
                    >
                      <Button
                        disabled={
                          order.balance < order.minLoan ||
                          requestTimeRef.current / 1000 > order.deadline ||
                          order.allowedTradingAssets.length === 0
                        }
                      >
                        Borrow
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
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
                  {formatFloat(formatUnits(order.balance, order.baseAsset.decimals ?? 18))}{" "}
                  <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                </p>
              </div>
              {isOwner && (
                <div className="flex items-center gap-3">
                  <Button
                    disabled={!order.alive}
                    onClick={() => setIsDepositDialogOpened(true)}
                    className="border-green disabled:bg-green-bg disabled:opacity-50"
                    colorScheme={ButtonColor.LIGHT_GREEN}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={!order.alive}
                    onClick={() => setIsWithdrawDialogOpened(true)}
                    className="border-green disabled:bg-green-bg disabled:opacity-50"
                    colorScheme={ButtonColor.LIGHT_GREEN}
                  >
                    Withdraw
                  </Button>
                </div>
              )}
            </GradientCard>
            {isOwner ? (
              <GradientCard className=" px-5 py-3 ">
                <div className="">
                  <div className="items-center flex gap-1 text-tertiary-text">
                    Total balance
                    <Tooltip text="Tooltip text" />
                  </div>

                  <p className="font-medium text-20">
                    {formatFloat(
                      formatUnits(calculateTotalOrderBalance(order), order.baseAsset.decimals),
                    )}{" "}
                    <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                  </p>
                </div>
              </GradientCard>
            ) : (
              <GradientCard className=" px-5 py-3 ">
                <div className="">
                  <div className="items-center flex gap-1 text-tertiary-text">
                    Min borrowing
                    <Tooltip text="Tooltip text" />
                  </div>

                  <p className="font-medium text-20">
                    {formatUnits(order.minLoan, order.baseAsset.decimals)}{" "}
                    <span className="text-secondary-text">{order.baseAsset.symbol}</span>
                  </p>
                </div>
              </GradientCard>
            )}
          </div>
        </div>

        <div className="bg-primary-bg rounded-5 mb-5 py-3 px-10 flex items-center justify-between">
          <div>
            <div className="items-center flex gap-1 text-tertiary-text">
              Number of margin positions
              <Tooltip text="Tooltip text" />
            </div>
            <span className="text-20">{order.positions?.length} margin position(s)</span>
          </div>
          {!!order.positions?.length && (
            <Button colorScheme={ButtonColor.LIGHT_GREEN} endIcon="next">
              View margin positions
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
          <OrderInfoBlock
            title="Interest rate"
            cards={[
              {
                title: "Per month",
                tooltipText: "Tooltip text",
                value: `${order.interestRate / 100}%`,
                bg: "percentage",
              },
              {
                title: "Per entire period",
                tooltipText: "Tooltip text",
                value: calculatePeriodInterestRate(order.interestRate, order.positionDuration),
                bg: "percentage",
              },
            ]}
          />
          <OrderInfoBlock
            cards={[
              {
                title: "Margin positions duration",
                tooltipText: "Tooltip text",
                value: `${formatFloat(order.positionDuration / 24 / 60 / 60)} days`,
                bg: "margin_positions_duration",
              },
              {
                title: "Lending order deadline",
                tooltipText: "Tooltip text",
                value: new Date(order.deadline * 1000)
                  .toLocaleDateString("en-GB")
                  .split("/")
                  .join("."),
                bg: "deadline",
              },
            ]}
            title="Time frame"
          />
          <OrderInfoBlock
            cards={[
              {
                title: "Max leverage",
                tooltipText: "Tooltip text",
                value: `${order.leverage}%`,
                bg: "leverage",
              },
              {
                title: "LTV",
                tooltipText: "Tooltip text",
                value: "-",
                bg: "ltv",
              },
            ]}
            title="Financial metrics"
          />
          <OrderInfoBlock
            cards={[
              {
                title: "Liquidation fee",
                tooltipText: "Tooltip text",
                value: `${formatFloat(order.liquidationRewardAmount.formatted)} ${order.liquidationRewardAsset.symbol}`,
                bg: "liquidation_fee",
              },
              {
                title: "Order currency limit",
                tooltipText: "Tooltip text",
                value: `${order.currencyLimit} currencies`,
                bg: "currency",
              },
            ]}
            title="Fee and currency limit"
          />
        </div>

        <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
          <h3 className="text-20 text-secondary-text font-medium">Trading and collateral tokens</h3>

          <div className="bg-tertiary-bg rounded-3 pl-5 pb-5 pt-2 bg-[url(/images/card-bg/collateral.svg)] bg-[length:120px_80px] bg-right-top bg-no-repeat">
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-tertiary-text flex items-center gap-1">
                    Accepted collateral tokens
                    <Tooltip text="Tooltip text" />
                  </h3>
                  <span className="text-20 font-medium">
                    {order.allowedCollateralAssets.length} tokens
                  </span>
                </div>
                <div className="flex gap-1">
                  {order.allowedCollateralAssets.map((collateralToken) => {
                    console.log(collateralToken.wrapped.address0);
                    return collateralToken.isToken ? (
                      <button
                        key={collateralToken.wrapped.address0}
                        onClick={() =>
                          setTokenForPortfolio(
                            new Token(
                              chainId,
                              collateralToken.address0,
                              collateralToken.address1,
                              +collateralToken.decimals,
                              collateralToken.symbol,
                              collateralToken.name,
                              "/images/tokens/placeholder.svg",
                              tokenLists
                                ?.filter((tokenList) => {
                                  return !!tokenList.list.tokens.find(
                                    (t) =>
                                      t.address0.toLowerCase() ===
                                      collateralToken.address0.toLowerCase(),
                                  );
                                })
                                .map((t) => t.id),
                            ),
                          )
                        }
                        className="bg-quaternary-bg text-secondary-text px-2 py-1 rounded-2 hocus:bg-green-bg duration-200"
                      >
                        {collateralToken.symbol}
                      </button>
                    ) : (
                      <div
                        key={collateralToken.wrapped.address0}
                        className="rounded-2 text-secondary-text border border-secondary-border px-2 flex items-center py-1"
                      >
                        {collateralToken.symbol}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-tertiary-bg rounded-3 px-5 pb-5 pt-2">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-tertiary-text flex items-center gap-1">
                  Tokens allowed for trading
                  <Tooltip text="Tooltip text" />
                </h3>
                <span className="text-20 font-medium">
                  {order.allowedTradingAssets.length} tokens
                </span>
              </div>
              <div>
                <SearchInput
                  value={searchTradableTokenValue}
                  onChange={(e) => setSearchTradableTokenValue(e.target.value)}
                  placeholder="Token name"
                  className="bg-primary-bg"
                />
              </div>
            </div>

            {!!filteredTokens.length && (
              <SimpleBar style={{ maxHeight: 216 }}>
                <div className="flex gap-1 flex-wrap">
                  {filteredTokens.map((tradingToken) => {
                    return tradingToken.isToken ? (
                      <button
                        key={tradingToken.address0}
                        onClick={() =>
                          setTokenForPortfolio(
                            new Token(
                              chainId,
                              tradingToken.address0,
                              tradingToken.address1,
                              +tradingToken.decimals,
                              tradingToken.symbol,
                              tradingToken.name,
                              "/images/tokens/placeholder.svg",
                              tokenLists
                                ?.filter((tokenList) => {
                                  return !!tokenList.list.tokens.find(
                                    (t) =>
                                      t.address0.toLowerCase() ===
                                      tradingToken.address0.toLowerCase(),
                                  );
                                })
                                .map((t) => t.id),
                            ),
                          )
                        }
                        className="bg-quaternary-bg text-secondary-text px-2 py-1 rounded-2 hocus:bg-green-bg duration-200"
                      >
                        {tradingToken.symbol}
                      </button>
                    ) : (
                      <div
                        key={tradingToken.wrapped.address0}
                        className="rounded-2 text-secondary-text border border-secondary-border px-2 flex items-center py-1"
                      >
                        {tradingToken.symbol}
                      </div>
                    );
                  })}
                </div>
              </SimpleBar>
            )}
            {!filteredTokens.length && searchTradableTokenValue && (
              <div className="rounded-5 h-[232px] -mt-5 flex items-center justify-center text-secondary-text bg-empty-not-found-token bg-no-repeat bg-right-top bg-[length:212px_212px] -mr-5">
                Token not found
              </div>
            )}
          </div>
        </div>

        <div className=" bg-primary-bg rounded-5 px-10 pt-4 pb-5 mb-5 flex flex-col gap-3">
          <h3 className="text-20 text-secondary-text font-medium">Liquidation details</h3>
          <div className="grid grid-cols-2 gap-3">
            <OrderInfoCard
              value={
                <ExternalTextLink
                  text="DEX223 Market"
                  href={getExplorerLink(ExplorerLinkType.ADDRESS, ORACLE_ADDRESS[chainId], chainId)}
                />
              }
              title="Liquidation price source"
              bg="liquidation_price_source"
              tooltipText="Tooltip text"
            />
            <OrderInfoCard
              value={"Anyone"}
              title="Initiate liquidation "
              bg="initiate_liquidation"
              tooltipText="Tooltip text"
            />
          </div>
        </div>

        {!!order.positions?.length && (
          <>
            <h2 className="text-32 text-secondary-text font-medium mb-5">Margin positions</h2>
            <div className="grid gap-5">
              {!!order.positions?.length &&
                order.positions.map((position, index) => (
                  <React.Fragment key={position.id}>
                    {position.isLiquidated || position.isClosed ? (
                      <InactiveMarginPositionCard
                        key={position.id}
                        position={{ ...position, order }}
                      />
                    ) : (
                      <LendingPositionCard position={{ ...position, order }} />
                    )}
                  </React.Fragment>
                ))}
            </div>
          </>
        )}
      </Container>

      <OrderDepositDialog
        isOpen={isDepositDialogOpened}
        setIsOpen={setIsDepositDialogOpened}
        order={order}
      />
      <OrderWithdrawDialog
        isOpen={isWithdrawDialogOpened}
        setIsOpen={setIsWithdrawDialogOpened}
        order={order}
      />
      <OrderCloseDialog
        isOpen={isCloseDialogOpened}
        setIsOpen={setIsCloseDialogOpened}
        order={order}
      />
      <OrderOpenDialog
        isOpen={isOpenDialogOpened}
        setIsOpen={setIsOpenDialogOpened}
        order={order}
      />
      <DrawerDialog isOpen={!!tokenForPortfolio} setIsOpen={() => setTokenForPortfolio(null)}>
        <DialogHeader
          onClose={() => setTokenForPortfolio(null)}
          title={tokenForPortfolio?.name || "Unknown"}
        />
        {tokenForPortfolio ? <TokenPortfolioDialogContent token={tokenForPortfolio} /> : null}
      </DrawerDialog>
    </div>
  );
}
