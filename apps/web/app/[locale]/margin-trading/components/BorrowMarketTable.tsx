import clsx from "clsx";
import Image from "next/image";
import React, { useCallback, useMemo, useRef, useState } from "react";
import SimpleBar from "simplebar-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useOrders } from "@/app/[locale]/margin-trading/hooks/useOrder";
import { useBorrowMarketFilterStore } from "@/app/[locale]/margin-trading/stores/useBorrowMarketFilterStore";
import { LendingOrder } from "@/app/[locale]/margin-trading/types";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
  SortingType,
} from "@/components/buttons/IconButton";
import Pagination from "@/components/common/Pagination";
import { formatFloat } from "@/functions/formatFloat";
import { Link } from "@/i18n/routing";

type SortingField =
  | "currencyLimit"
  | "interestRate"
  | "leverage"
  | "balance"
  | "duration"
  | "collateralTokens"
  | "tradableTokens"
  | "minLoan";

export function HeaderItem({
  isFirst = false,
  label,
  sorting,
  handleSort,
  sortable = true,
  field,
}: {
  isFirst?: boolean;
  label: string;
  handleSort?: (field: SortingField) => void;
  sorting: SortingType;
  sortable?: boolean;
  field: SortingField;
}) {
  return (
    <div
      role={handleSort && "button"}
      onClick={() => {
        if (handleSort) handleSort(field);
      }}
      className={clsx(
        "h-[60px] flex items-center relative mb-2  text-tertiary-text",
        isFirst && "pl-6",
        handleSort && "-left-3",
      )}
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

const PAGE_SIZE = 10;

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

const headerColumns: Array<{ field: SortingField; title: string; sortable: boolean }> = [
  { field: "balance", title: "Order balance", sortable: true },
  { field: "leverage", title: "Leverage", sortable: true },
  { field: "interestRate", title: "Interest", sortable: true },
  { field: "duration", title: "Duration", sortable: true },
  { field: "currencyLimit", title: "Limit", sortable: true },
  { field: "collateralTokens", title: "Collateral tokens", sortable: false },
  { field: "tradableTokens", title: "Tradable tokens", sortable: false },
  { field: "minLoan", title: "Min borrowing", sortable: true },
];

export default function BorrowMarketTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const [sorting, setSorting] = useState<{ field: SortingField; direction: SortingType }>({
    field: "currencyLimit",
    direction: SortingType.NONE,
  });

  const { address } = useAccount();

  const handleSort = useCallback(
    (field: SortingField) => {
      if (field === sorting.field) {
        switch (sorting.direction) {
          case SortingType.NONE:
            setSorting((values) => ({ ...values, direction: SortingType.ASCENDING }));
            return;
          case SortingType.ASCENDING:
            setSorting((values) => ({ ...values, direction: SortingType.DESCENDING }));
            return;
          case SortingType.DESCENDING:
            setSorting((values) => ({ ...values, direction: SortingType.NONE }));
            return;
        }
      } else {
        setSorting({ field, direction: SortingType.ASCENDING });
      }
    },
    [sorting],
  );

  const {
    leverage,
    maxInterestRatePerMonth,
    maxPositionDuration,
    orderCurrencyLimit,
    minOrderBalance,
    minLoanAmount,
    minPositionDuration,
  } = useBorrowMarketFilterStore();

  const { loading, orders } = useOrders({
    sortingDirection: sorting.direction,
    orderBy: sorting.field,
    leverage_lte: leverage,
    currencyLimit_lte: orderCurrencyLimit || undefined,
    duration_lte: maxPositionDuration || undefined,
    duration_gte: minPositionDuration || undefined,
    interestRate_lte: maxInterestRatePerMonth
      ? (+maxInterestRatePerMonth * 100).toString()
      : undefined,
    minLoanFormatted_gte: minLoanAmount,
    balanceFormatted_gte: minOrderBalance,
  });

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const didDrag = useRef(false);
  const dragThreshold = 5;

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return orders?.slice(firstPageIndex, lastPageIndex) || [];
  }, [orders, currentPage]);

  if (loading || !orders) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_300px] w-full rounded-t-2 overflow-hidden">
        <SimpleBar
          autoHide={false}
          style={{ maxWidth: "100%", minWidth: "100%", width: "100%" }}
          className="max-w-full"
          scrollableNodeProps={{
            onMouseDown(e: any) {
              const el = e.currentTarget;
              isDragging.current = true;
              didDrag.current = false;
              el.classList.add("is-grabbing");

              startX.current = e.pageX - el.offsetLeft;
              scrollLeft.current = el.scrollLeft;
            },
            onMouseMove(e: any) {
              if (!isDragging.current) return;
              e.preventDefault();
              const el = e.currentTarget;
              const x = e.pageX - el.offsetLeft;
              const walk = x - startX.current;
              if (Math.abs(walk) > dragThreshold) {
                didDrag.current = true;
              }
              el.scrollLeft = scrollLeft.current - walk;
            },
            onMouseUp(e: any) {
              isDragging.current = false;
              e.currentTarget.classList.remove("is-grabbing");
            },
            onMouseLeave(e: any) {
              isDragging.current = false;
              e.currentTarget.classList.remove("is-grabbing");
            },
          }}
        >
          <div className="min-w-[1400px]">
            <div className="grid overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(77px,1.33fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,2.67fr),_minmax(50px,2.67fr),_minmax(78px,1.67fr)] pb-2">
              {headerColumns.map((columnData, index) => (
                <HeaderItem
                  key={columnData.field}
                  label={columnData.title}
                  sorting={
                    sorting.field === columnData.field ? sorting.direction : SortingType.NONE
                  }
                  handleSort={!columnData.sortable ? undefined : handleSort}
                  field={columnData.field}
                  isFirst={index === 0}
                />
              ))}

              {currentTableData.map((o: LendingOrder) => {
                return (
                  <Link
                    href={`/margin-trading/lending-order/${o.id}`}
                    className="group contents"
                    key={o.id}
                    onClick={(e) => {
                      // if we dragged, cancel navigation
                      if (didDrag.current) {
                        e.preventDefault();
                        didDrag.current = false;
                      }
                    }}
                  >
                    <div className="pl-5 h-[56px] flex items-center gap-2 group-hocus:bg-tertiary-bg duration-200 pr-2">
                      <Image src="/images/tokens/placeholder.svg" width={24} height={24} alt="" />
                      <span
                        className={clsx(
                          "font-medium",
                          o.balance < o.minLoan && "text-yellow-light",
                        )}
                      >
                        {formatUnits(o.balance, o.baseAsset.decimals ?? 18)}
                      </span>
                      <span className="text-secondary-texts">{o.baseAsset.symbol}</span>
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      {o.leverage}x
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      {Math.floor(o.interestRate / 100)}%
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      {formatFloat(o.positionDuration / 60 / 60 / 24, { trimZero: true })} days
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      {o.currencyLimit}
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      <span className="flex gap-2">
                        {o.allowedCollateralAssets.length > 2 ? (
                          <>
                            {o.allowedCollateralAssets.slice(0, 2).map((token) => (
                              <span
                                key={token.wrapped.address0}
                                className="rounded-2 flex items-center gap-1 border border-secondary-border py-1 px-2"
                              >
                                {token.symbol}
                              </span>
                            ))}
                            <span className="px-1 text-16 flex items-end">{"..."}</span>

                            <span className="rounded-2 border border-secondary-border font-medium py-1 px-2 min-w-8 flex items-center justify-center">
                              {o.allowedCollateralAssets.length - 2}
                            </span>
                          </>
                        ) : (
                          o.allowedCollateralAssets.map((token) => (
                            <span
                              key={token.wrapped.address0}
                              className="rounded-2 flex items-center gap-1 border border-secondary-border py-1 px-2 pr-3"
                            >
                              {token.symbol}
                            </span>
                          ))
                        )}
                      </span>
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2">
                      <span className="flex gap-2">
                        {o.allowedTradingAssets.length > 2 ? (
                          <>
                            {o.allowedTradingAssets.slice(0, 2).map((token) => (
                              <span
                                key={token.wrapped.address0}
                                className="rounded-2 flex items-center gap-1 border border-secondary-border py-1 px-2"
                              >
                                {token.symbol}
                              </span>
                            ))}
                            <span className="px-1 text-16 flex items-end">{"..."}</span>

                            <span className="rounded-2 border border-secondary-border font-medium py-1 px-2 min-w-8 flex items-center justify-center">
                              {o.allowedTradingAssets.length - 2}
                            </span>
                          </>
                        ) : (
                          o.allowedTradingAssets.map((token) => (
                            <span
                              key={token.wrapped.address0}
                              className="rounded-2 flex items-center gap-1 border border-secondary-border py-1 px-2"
                            >
                              {token.symbol}
                            </span>
                          ))
                        )}
                      </span>
                    </div>
                    <div className=" h-[56px] flex items-center group-hocus:bg-tertiary-bg duration-200 pr-2 gap-2">
                      <span
                        className={clsx(
                          "font-medium",
                          o.balance < o.minLoan && "text-yellow-light",
                        )}
                      >
                        {formatUnits(o.minLoan, o.baseAsset.decimals ?? 18)}
                      </span>
                      <span className="text-secondary-texts">{o.baseAsset.symbol}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </SimpleBar>
        <div className="h-full border-l border-secondary-border shadow-[0px_4px_40px_0px_#000000] relative z-40">
          <div
            className={clsx("h-[60px] flex items-center bg-quaternary-bg pl-5 text-tertiary-text")}
          >
            Actions
          </div>
          <div className="py-2.5 px-3 bg-primary-bg">
            {currentTableData.map((o: LendingOrder) => {
              return (
                <div key={o.id} className="p-2 gap-2 flex items-center">
                  {o.owner.toLowerCase() === address?.toLowerCase() ? (
                    <Link className={"flex-grow"} href={`/margin-trading/lending-order/${o.id}`}>
                      <Button
                        fullWidth
                        size={ButtonSize.MEDIUM}
                        colorScheme={ButtonColor.LIGHT_GREEN}
                      >
                        View my order
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link className={"flex-shrink-0"} href={`/margin-swap`}>
                        <Button
                          disabled={o.balance < o.minLoan}
                          size={ButtonSize.MEDIUM}
                          colorScheme={ButtonColor.LIGHT_PURPLE}
                        >
                          Margin swap
                        </Button>
                      </Link>
                      <Link
                        className={"flex-shrink-0"}
                        href={`/margin-trading/lending-order/${o.id}/borrow`}
                      >
                        <Button
                          disabled={o.balance < o.minLoan}
                          size={ButtonSize.MEDIUM}
                          colorScheme={ButtonColor.LIGHT_GREEN}
                        >
                          Borrow
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Pagination
        isLoading={loading}
        className="pagination-bar mt-5"
        currentPage={currentPage}
        totalCount={orders.length}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setCurrentPage(page as number)}
      />
    </>
  );
}
