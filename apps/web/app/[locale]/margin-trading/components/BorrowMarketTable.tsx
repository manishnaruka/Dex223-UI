import clsx from "clsx";
import Image from "next/image";
import { useCallback, useState } from "react";
import React from "react";
import { formatUnits } from "viem";

import { LendingOrder, useOrders } from "@/app/[locale]/margin-trading/hooks/useOrder";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
  SortingType,
} from "@/components/buttons/IconButton";
import { Link } from "@/i18n/routing";

export function HeaderItem({
  isFirst = false,
  label,
  sorting,
  handleSort,
}: {
  isFirst?: boolean;
  label: string;
  handleSort?: () => void;
  sorting: SortingType;
}) {
  return (
    <div
      role={handleSort && "button"}
      onClick={handleSort}
      className={clsx("h-[60px] flex items-center relative -left-3 mb-2", isFirst && "pl-2")}
    >
      {handleSort && (
        <IconButton
          variant={IconButtonVariant.SORTING}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          sorting={sorting}
        />
      )}
      {label}
    </div>
  );
}

type Order = {
  token: {
    minAmount: number;
    maxAmount: number;
    name: string;
  };
  interest: number;
  leverage: number;
  limit: number;
  collateralTokens: number;
  tradableTokens: number;
  period: number | [number, number];
};

const testData: Order[] = [
  {
    token: { name: "AAVE", minAmount: 100, maxAmount: 1000 },
    interest: 5,
    leverage: 2,
    limit: 6,
    collateralTokens: 3,
    tradableTokens: 22,
    period: 4,
  },
  {
    token: { name: "DOGE", minAmount: 1000, maxAmount: 10000 },
    interest: 51,
    leverage: 6,
    limit: 4,
    collateralTokens: 32,
    tradableTokens: 6,
    period: [3, 5],
  },
  {
    token: { name: "SOL", minAmount: 52, maxAmount: 88 },
    interest: 10,
    leverage: 10,
    limit: 4,
    collateralTokens: 2421,
    tradableTokens: 67,
    period: [2, 8],
  },
  {
    token: { name: "XDAI", minAmount: 667, maxAmount: 8823 },
    interest: 25,
    leverage: 6,
    limit: 3,
    collateralTokens: 144,
    tradableTokens: 24,
    period: 34,
  },
  {
    token: { name: "RADIX", minAmount: 76.4, maxAmount: 817.23 },
    interest: 15,
    leverage: 14,
    limit: 4,
    collateralTokens: 1414,
    tradableTokens: 357,
    period: [30, 48],
  },
  {
    token: { name: "SHIBDOGE", minAmount: 25, maxAmount: 182 },
    interest: 5,
    leverage: 12,
    limit: 5,
    collateralTokens: 175,
    tradableTokens: 100356,
    period: 30,
  },
  {
    token: { name: "BTTC", minAmount: 2671.2, maxAmount: 827.5 },
    interest: 8,
    leverage: 10,
    limit: 5,
    collateralTokens: 26,
    tradableTokens: 2,
    period: 1,
  },
  {
    token: { name: "AVAX", minAmount: 782, maxAmount: 2893 },
    interest: 10,
    leverage: 16,
    limit: 8,
    collateralTokens: 88,
    tradableTokens: 33,
    period: 13,
  },
  {
    token: { name: "ONE", minAmount: 238, maxAmount: 2993 },
    interest: 13,
    leverage: 2,
    limit: 4,
    collateralTokens: 35,
    tradableTokens: 234,
    period: 15,
  },
  {
    token: { name: "GLMR", minAmount: 782, maxAmount: 1456 },
    interest: 5,
    leverage: 10,
    limit: 6,
    collateralTokens: 1,
    tradableTokens: 124,
    period: [1, 3],
  },
];

export default function BorrowMarketTable() {
  const [sorting, setSorting] = useState<SortingType>(SortingType.NONE);

  const { loading, orders } = useOrders();

  const handleSort = useCallback(() => {
    switch (sorting) {
      case SortingType.NONE:
        setSorting(SortingType.ASCENDING);
        return;
      case SortingType.ASCENDING:
        setSorting(SortingType.DESCENDING);
        return;
      case SortingType.DESCENDING:
        setSorting(SortingType.NONE);
        return;
    }
  }, [sorting]);

  if (loading || !orders) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid rounded-2 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(77px,1.33fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,2.67fr),_minmax(50px,2.67fr),_minmax(78px,1.67fr),_minmax(50px,max-content)] pb-2">
      <HeaderItem label="Order balance" sorting={sorting} handleSort={handleSort} isFirst />
      <div className="h-[60px] flex items-center relative -left-3 pr-2 pl-2">
        <IconButton
          variant={IconButtonVariant.DEFAULT}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          iconName="sort"
        />
        Interest{" "}
      </div>
      <div className="h-[60px] flex items-center relative -left-3 pr-2">
        <IconButton
          variant={IconButtonVariant.DEFAULT}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          iconName="sort"
        />
        Leverage{" "}
      </div>
      <div className="h-[60px] flex items-center relative -left-3 pr-2">
        <IconButton
          variant={IconButtonVariant.DEFAULT}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          iconName="sort"
        />
        Limit{" "}
      </div>
      <div className=" h-[60px] flex items-center pr-2">Collateral tokens</div>
      <div className=" h-[60px] flex items-center pr-2">Tradable tokens</div>
      <div className=" h-[60px] flex items-center relative -left-3 pr-2">
        <IconButton
          variant={IconButtonVariant.DEFAULT}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          iconName="sort"
        />
        Period{" "}
      </div>
      <div className=" h-[60px] flex items-center">Action</div>

      {orders.map((o: LendingOrder) => {
        return (
          <Link
            href={`/margin-trading/lending-order/${o.id}`}
            className="group contents"
            key={o.id}
          >
            <div className=" pl-3 h-[56px] flex items-center gap-2 group-hocus:bg-tertiary-bg duration-200 pr-2 pl-2">
              <Image src="/images/tokens/placeholder.svg" width={24} height={24} alt="" />
              <span>{formatUnits(o.balance, o.baseAsset.decimals ?? 18)}</span>
              <span>{o.baseAsset.symbol}</span>
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {Math.floor(o.interestRate / 100)}%
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {o.leverage}x
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {o.currencyLimit}
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {o.allowedCollateralAssets.length} tokens
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {o.allowedTradingAssets.length} tokens
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
              {/*{Array.isArray(o.period)*/}
              {/*  ? `${o.period[0]} - ${o.period[1]} days`*/}
              {/*  : `${o.period} days`}*/}
              {Math.floor((o.positionDuration * 100) / 24 / 60 / 60) / 100} days
            </div>
            <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-5">
              <Link href={`/margin-trading/lending-order/${o.id}/borrow`}>
                <Button colorScheme={ButtonColor.LIGHT_GREEN} size={ButtonSize.MEDIUM}>
                  Borrow
                </Button>
              </Link>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
