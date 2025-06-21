import React from "react";
import { useAccount } from "wagmi";

import LendingOrderCard from "@/app/[locale]/margin-trading/components/LendingOrderCard";
import { useOrdersByOwner } from "@/app/[locale]/margin-trading/hooks/useOrders";
import { SearchInput } from "@/components/atoms/Input";

export default function LendingOrdersTab() {
  const { address } = useAccount();
  const { data } = useOrdersByOwner({ owner: address });

  console.log(data);
  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="flex justify-between my-5 items-center">
        <span className="text-20 text-tertiary-text">3 lending orders</span>
        <div className="max-w-[460px] flex-grow">
          <SearchInput placeholder="Search address" className="bg-primary-bg" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {data.orders.map((order) => (
          <LendingOrderCard
            key={order.id}
            order={{ baseAssetSymbol: order.baseAssetToken.symbol }}
          />
        ))}
      </div>
    </>
  );
}
