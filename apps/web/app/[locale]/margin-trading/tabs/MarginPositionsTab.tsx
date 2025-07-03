import React from "react";
import { useAccount } from "wagmi";

import MarginPositionCard from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import { usePositionsByOwner } from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import { SearchInput } from "@/components/atoms/Input";

export default function MarginPositionsTab() {
  const { address } = useAccount();
  const { positions, loading } = usePositionsByOwner({ owner: address });
  if (!positions?.length || loading) return <div className="">Loading...</div>;

  return (
    <>
      <div className="flex justify-between my-5 items-center">
        <span className="text-20 text-tertiary-text">{positions.length} margin positions</span>
        <div className="max-w-[460px] flex-grow">
          <SearchInput placeholder="Search address" className="bg-primary-bg" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {!!positions?.length &&
          positions.map((position, index) => (
            <MarginPositionCard
              key={position.id}
              expectedBalance={100}
              totalBalance={150}
              liquidationFee={10}
              liquidationCost={2}
              position={position}
            />
          ))}
      </div>
    </>
  );
}
