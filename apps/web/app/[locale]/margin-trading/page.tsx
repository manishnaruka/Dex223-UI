"use client";
import React, { useCallback, useState } from "react";

import BorrowMarketFilter from "@/app/[locale]/margin-trading/components/BorrowMarketFilter";
import BorrowMarketTable from "@/app/[locale]/margin-trading/components/BorrowMarketTable";
import FilterTags from "@/app/[locale]/margin-trading/components/FilterTags";
import FilterTokensSelector from "@/app/[locale]/margin-trading/components/FilterTokensSelector";
import LendingOrdersTab from "@/app/[locale]/margin-trading/tabs/LendingOrdersTab";
import MarginPositionsTab from "@/app/[locale]/margin-trading/tabs/MarginPositionsTab";
import Container from "@/components/atoms/Container";
import { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor } from "@/components/buttons/Button";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";
import { Link } from "@/i18n/routing";
import { Currency } from "@/sdk_bi/entities/currency";

export default function MarginTrading() {
  const [isDrawerOpened, setDrawerOpened] = useState(false);
  const [collateralFilterTokens, setCollateralFilterTokens] = useState<Currency[]>([]);

  const handleToggleCollateral = useCallback(
    (currency: Currency) => {
      if (!collateralFilterTokens.find((curr) => curr.equals(currency))) {
        setCollateralFilterTokens([...collateralFilterTokens, currency]);
      } else {
        const filtered = collateralFilterTokens.filter((curr) => !curr.equals(currency));
        setCollateralFilterTokens(filtered);
      }
    },
    [collateralFilterTokens],
  );

  const [borrowFilterTokens, setBorrowFilterTokens] = useState<Currency[]>([]);

  const handleBorrowCollateral = useCallback(
    (currency: Currency) => {
      if (!borrowFilterTokens.find((curr) => curr.equals(currency))) {
        setBorrowFilterTokens([...borrowFilterTokens, currency]);
      } else {
        const filtered = borrowFilterTokens.filter((curr) => !curr.equals(currency));
        setBorrowFilterTokens(filtered);
      }
    },
    [borrowFilterTokens],
  );

  const [tradableFilterTokens, setTradableFilterTokens] = useState<Currency[]>([]);

  const handleTradableCollateral = useCallback(
    (currency: Currency) => {
      if (!tradableFilterTokens.find((curr) => curr.equals(currency))) {
        setTradableFilterTokens([...tradableFilterTokens, currency]);
      } else {
        const filtered = tradableFilterTokens.filter((curr) => !curr.equals(currency));
        setTradableFilterTokens(filtered);
      }
    },
    [tradableFilterTokens],
  );

  console.log(collateralFilterTokens);
  return (
    <div className="my-10">
      <Container>
        <Tabs
          rightContent={
            <Link href={"/margin-trading/lending-order/create"}>
              <Button endIcon="add">New lending order</Button>
            </Link>
          }
        >
          <Tab title="Borrow market">
            <div className="pt-4">
              <div className="grid grid-cols-[1fr_1fr_1fr_min-content] gap-2.5 mb-4">
                <div className="flex flex-col gap-1">
                  <InputLabel label="Collateral tokens" tooltipText="TooltipText" />
                  <FilterTokensSelector
                    placeholder="All tokens"
                    extendWidth
                    selectedCurrencies={collateralFilterTokens}
                    handleToggleCurrency={handleToggleCollateral}
                    selectOptionId="collateral"
                    resetCurrencies={() => setCollateralFilterTokens([])}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel label="Borrow" tooltipText="TooltipText" />
                  <FilterTokensSelector
                    placeholder="All tokens"
                    extendWidth
                    selectedCurrencies={borrowFilterTokens}
                    handleToggleCurrency={handleBorrowCollateral}
                    selectOptionId="borrow"
                    resetCurrencies={() => setBorrowFilterTokens([])}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel label="Tradable tokens" tooltipText="TooltipText" />
                  <FilterTokensSelector
                    placeholder="All tokens"
                    extendWidth
                    selectedCurrencies={tradableFilterTokens}
                    handleToggleCurrency={handleTradableCollateral}
                    selectOptionId="trade"
                    resetCurrencies={() => setTradableFilterTokens([])}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setDrawerOpened(true)}
                    colorScheme={ButtonColor.LIGHT_GREEN}
                    endIcon="filter"
                  >
                    Filter
                  </Button>

                  <BorrowMarketFilter
                    isDrawerOpened={isDrawerOpened}
                    setDrawerOpened={setDrawerOpened}
                  />
                </div>
              </div>
              <FilterTags />

              <BorrowMarketTable
                borrowAssets={borrowFilterTokens}
                collateralAssets={collateralFilterTokens}
                tradableAssets={tradableFilterTokens}
              />
            </div>
          </Tab>
          <Tab title="Lending orders">
            <LendingOrdersTab />
          </Tab>
          <Tab title="Margin positions">
            <MarginPositionsTab />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}
