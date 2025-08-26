import React, { useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

import {
  InactiveMarginPositionCard,
  LendingPositionCard,
} from "@/app/[locale]/margin-trading/components/MarginPositionCard";
import { usePositionsByOwner } from "@/app/[locale]/margin-trading/hooks/useMarginPosition";
import { SearchInput } from "@/components/atoms/Input";

export default function MarginPositionsTab() {
  const { address } = useAccount();
  const [searchValue, setSearchValue] = useState("");

  const { positions, loading } = usePositionsByOwner({
    owner: !!searchValue && isAddress(searchValue) ? searchValue : address,
  });
  if (!positions?.length || loading) return <div className="">Loading...</div>;

  return (
    <>
      <div className="flex justify-between my-5 items-center">
        <span className="text-20 text-tertiary-text">{positions.length} margin positions</span>
        <div className="max-w-[460px] flex-grow">
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search address"
            className="bg-primary-bg"
          />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {!!positions?.length &&
          positions.map((position, index) =>
            position.isLiquidated || position.isClosed ? (
              <InactiveMarginPositionCard key={position.id} position={position} />
            ) : (
              <LendingPositionCard key={position.id} position={position} />
            ),
          )}
      </div>
    </>
  );
}
