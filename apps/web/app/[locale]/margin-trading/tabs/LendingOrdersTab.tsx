import React, { useState } from "react";
import { useAccount } from "wagmi";

import LendingOrderCard from "@/app/[locale]/margin-trading/components/LendingOrderCard";
import { LendingOrder, useOrdersByOwner } from "@/app/[locale]/margin-trading/hooks/useOrder";
import OrderDepositDialog from "@/app/[locale]/margin-trading/lending-order/[id]/components/OrderDepositDialog";
import { SearchInput } from "@/components/atoms/Input";

export default function LendingOrdersTab() {
  const { address } = useAccount();
  const { orders } = useOrdersByOwner({ owner: address });

  const [orderToDeposit, setOrderToDeposit] = useState<LendingOrder | undefined>();
  const [orderToWithdraw, setOrderToWithdraw] = useState<LendingOrder | undefined>();

  if (!orders) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between my-5 items-center">
        <span className="text-20 text-tertiary-text">{orders.length} lending orders</span>
        <div className="max-w-[460px] flex-grow">
          <SearchInput placeholder="Search address" className="bg-primary-bg" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {orders.map((order) => (
          <LendingOrderCard
            key={order.id}
            order={order}
            setOrderToDeposit={setOrderToDeposit}
            setOrderToWithdraw={setOrderToWithdraw}
          />
        ))}
      </div>

      {orderToDeposit && (
        <OrderDepositDialog
          isOpen={Boolean(orderToDeposit)}
          setIsOpen={() => setOrderToDeposit(undefined)}
          orderId={orderToDeposit.id}
          order={orderToDeposit}
        />
      )}
      {orderToWithdraw && (
        <OrderDepositDialog
          isOpen={Boolean(orderToWithdraw)}
          setIsOpen={() => setOrderToWithdraw(undefined)}
          orderId={orderToWithdraw.id}
          order={orderToWithdraw}
        />
      )}
    </>
  );
}
