"use client";
import React, { useState } from "react";

import BorrowMarketFilter from "@/app/[locale]/borrow-market/components/BorrowMarketFilter";
import BorrowMarketTable from "@/app/[locale]/borrow-market/components/BorrowMarketTable";
import LendingOrderCard from "@/app/[locale]/margin-trading/components/LendingOrderCard";
import MarginPositionCard from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import SelectButton from "@/components/atoms/SelectButton";
import { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor } from "@/components/buttons/Button";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";

export default function MarginTrading() {
  const [isDrawerOpened, setDrawerOpened] = useState(false);

  return (
    <div className="my-10">
      <Container>
        <Tabs>
          <Tab title="Borrow market">
            <div className="pt-4">
              <div className="grid grid-cols-[1fr_1fr_1fr_min-content] gap-2.5 mb-4">
                <div className="flex flex-col gap-1">
                  <InputLabel label="Collateral tokens" tooltipText="TooltipText" />
                  <SelectButton size="medium" fullWidth>
                    All tokens
                  </SelectButton>
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel label="Borrow" tooltipText="TooltipText" />
                  <SelectButton size="medium" fullWidth>
                    All tokens
                  </SelectButton>
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel label="Tradable tokens" tooltipText="TooltipText" />
                  <SelectButton size="medium" fullWidth>
                    All tokens
                  </SelectButton>
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

              <BorrowMarketTable />
            </div>
          </Tab>
          <Tab title="Lending orders">
            <div className="flex justify-between my-5 items-center">
              <span className="text-20 text-tertiary-text">3 lending orders</span>
              <div className="max-w-[460px] flex-grow">
                <SearchInput placeholder="Search address" className="bg-primary-bg" />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <LendingOrderCard />
            </div>
          </Tab>
          <Tab title="Margin positions">
            <div className="flex justify-between my-5 items-center">
              <span className="text-20 text-tertiary-text">17 margin positions</span>
              <div className="max-w-[460px] flex-grow">
                <SearchInput placeholder="Search address" className="bg-primary-bg" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <MarginPositionCard
                expectedBalance={100}
                totalBalance={150}
                liquidationFee={10}
                liquidationCost={2}
              />
              <MarginPositionCard
                expectedBalance={150}
                totalBalance={100}
                liquidationFee={10}
                liquidationCost={9.5}
              />
              <MarginPositionCard
                expectedBalance={150}
                totalBalance={200}
                liquidationFee={10}
                liquidationCost={9.5}
              />
              <MarginPositionCard
                expectedBalance={95}
                totalBalance={100}
                liquidationFee={10}
                liquidationCost={12}
              />
              <MarginPositionCard
                expectedBalance={150}
                totalBalance={100}
                liquidationFee={10}
                liquidationCost={12}
              />
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}
