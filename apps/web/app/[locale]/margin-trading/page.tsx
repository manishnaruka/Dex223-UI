"use client";
import LendingOrderCard from "@/app/[locale]/margin-trading/components/LendingOrderCard";
import MarginPositionCard from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";

export default function MarginTrading() {
  return (
    <Container>
      <Tabs>
        <Tab title="Borrow market">Borrow market</Tab>
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
  );
}
