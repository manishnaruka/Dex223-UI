"use client";
import React, { useState } from "react";

import BorrowMarketFilter from "@/app/[locale]/margin-trading/components/BorrowMarketFilter";
import BorrowMarketTable from "@/app/[locale]/margin-trading/components/BorrowMarketTable";
import LendingOrdersTab from "@/app/[locale]/margin-trading/tabs/LendingOrdersTab";
import MarginPositionsTab from "@/app/[locale]/margin-trading/tabs/MarginPositionsTab";
import Container from "@/components/atoms/Container";
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
