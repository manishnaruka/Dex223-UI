import clsx from "clsx";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

import EmptyStateIcon from "@/components/atoms/EmptyStateIconNew";
import Preloader from "@/components/atoms/Preloader";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import Pagination from "@/components/common/Pagination";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRouter } from "@/navigation";

import { usePoolsData } from "./hooks";

export enum SortingType {
  NONE,
  ASCENDING,
  DESCENDING,
}

const GQLSorting: { [index: number]: "asc" | "desc" | undefined } = {
  [SortingType.NONE]: undefined,
  [SortingType.ASCENDING]: "asc",
  [SortingType.DESCENDING]: "desc",
};

function HeaderItem({
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
      className={clsx(
        "h-[60px] flex items-center text-tertiary-text relative -left-3 mb-2",
        isFirst && "pl-2",
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

const PoolsTableDesktop = ({
  tableData,
  currentPage,
  sorting,
  handleSort,
  openPoolHandler,
}: {
  tableData: any[];
  currentPage: number;
  sorting: SortingType;
  handleSort: () => any;
  openPoolHandler: (id: Address) => any;
}) => {
  return (
    <div className="hidden lg:grid pr-5 pl-2 rounded-3 overflow-hidden gap-x-2 bg-table-gradient grid-cols-[_minmax(20px,0.5fr),minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2">
      <div className=" h-[60px] flex items-center justify-center  text-tertiary-text ">#</div>
      <div className=" h-[60px] flex items-center  text-tertiary-text ">Pool</div>
      <HeaderItem label="Transactions" sorting={sorting} handleSort={handleSort} />
      <div className=" h-[60px] flex items-center  text-tertiary-text ">TVL</div>
      <div className=" h-[60px] flex items-center  text-tertiary-text ">1 day volume</div>
      <div className=" h-[60px] flex items-center text-tertiary-text ">7 day volume</div>

      {tableData.map((o: any, index: number) => {
        return (
          <React.Fragment key={o.id}>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center justify-center"
            >
              {(currentPage - 1) * PAGE_SIZE + index + 1}
            </div>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center gap-2"
            >
              <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
              <Image
                src="/tokens/placeholder.svg"
                width={24}
                height={24}
                alt=""
                className="-ml-5 bg-primary-bg rounded-full"
              />
              <span>{`${o.token0.symbol}/${o.token1.symbol}`}</span>
            </div>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center text-secondary-text "
            >
              {o.txCount}
            </div>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center text-secondary-text "
            >
              ${formatFloat(o.totalValueLockedUSD)}
            </div>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center text-secondary-text "
            >
              ${formatFloat(o.poolDayData?.[0]?.volumeUSD || 0)}
            </div>
            <div
              onClick={() => openPoolHandler(o.id)}
              className="h-[56px] cursor-pointer flex items-center text-secondary-text "
            >
              ${formatFloat(0)}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const PoolsTableItemMobile = ({
  key,
  pool,
  openPoolHandler,
  index,
}: {
  key: any;
  pool: any;
  openPoolHandler: (id: Address) => any;
  index: number;
}) => {
  return (
    <React.Fragment key={key}>
      <div className="flex flex-col bg-primary-bg p-4 rounded-3 gap-3">
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2 text-14">
            <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
            <Image
              src="/tokens/placeholder.svg"
              width={24}
              height={24}
              alt=""
              className="ml-[-20px] bg-primary-bg rounded-full"
            />
            <span>{`${pool.token0.symbol}/${pool.token1.symbol}`}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              size="small"
              variant={BadgeVariant.DEFAULT}
              text={`${(FEE_AMOUNT_DETAIL as any)[pool.feeTier].label}%`}
            />
            <span className="text-secondary-text font-normal">{`# ${index}`}</span>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex w-full flex-col items-start gap-1 bg-tertiary-bg rounded-2 px-4 py-[10px]">
            <span className="text-12 text-secondary-text">Transactions</span>
            <span className="text-12">{pool.txCount}</span>
          </div>
          <div className="flex w-full flex-col items-start gap-1 bg-tertiary-bg rounded-2 px-4 py-[10px]">
            <span className="text-12 text-secondary-text">TVL</span>
            <span className="text-12">{`$ ${formatFloat(pool.totalValueLockedUSD)}`}</span>
          </div>
          <div className="flex w-full flex-col items-start gap-1 bg-tertiary-bg rounded-2 px-4 py-[10px]">
            <span className="text-12 text-secondary-text">Turnover</span>
            <span className="text-12">{`— %`}</span>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex w-full flex-col items-start gap-1 bg-tertiary-bg rounded-2 px-4 py-[10px]">
            <span className="text-12 text-secondary-text">1 day volume</span>
            <span className="text-12">{`$ ${formatFloat(pool.poolDayData?.[0]?.volumeUSD || 0)}`}</span>
          </div>
          <div className="flex w-full flex-col items-start gap-1 bg-tertiary-bg rounded-2 px-4 py-[10px]">
            <span className="text-12 text-secondary-text">7 day volume</span>
            <span className="text-12">{`$ ${pool.poolDayData?.[0]?.volumeUSD || "—"}`}</span>
          </div>
        </div>
        <Button
          variant={ButtonVariant.CONTAINED}
          size={ButtonSize.MEDIUM}
          onClick={() => openPoolHandler(pool.id)}
        >
          View pool
        </Button>
      </div>
    </React.Fragment>
  );
};

const PoolsTableMobile = ({
  tableData,
  currentPage,
  openPoolHandler,
}: {
  tableData: any[];
  currentPage: number;
  sorting: SortingType;
  handleSort: () => any;
  openPoolHandler: (id: Address) => any;
}) => {
  return (
    <div className="flex lg:hidden flex-col gap-4">
      {tableData.map((pool: any, index: number) => {
        return (
          <PoolsTableItemMobile
            key={pool.id}
            index={(currentPage - 1) * PAGE_SIZE + index + 1}
            pool={pool}
            openPoolHandler={openPoolHandler}
          />
        );
      })}
    </div>
  );
};
export default function PoolsTable({
  filter,
}: {
  filter?: {
    token0Address?: Address;
    token1Address?: Address;
    searchString?: string;
  };
}) {
  const [sorting, setSorting] = useState<SortingType>(SortingType.NONE);

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

  const [currentPage, setCurrentPage] = useState(1);

  const chainId = useCurrentChainId();
  const { data, loading } = usePoolsData({
    chainId,
    orderDirection: GQLSorting[sorting],
    filter,
  });

  const pools: any[] = useMemo(() => data?.pools || [], [data?.pools]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return pools.slice(firstPageIndex, lastPageIndex);
  }, [pools, currentPage]);
  const router = useRouter();

  const openPoolHandler = (poolAddress: Address) => {
    router.push(`/pools/${chainId}/${poolAddress}`);
  };

  return (
    <>
      <div className="min-h-[640px] mb-5 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : (
          <>
            {pools.length > 0 ? (
              <>
                <PoolsTableDesktop
                  tableData={currentTableData}
                  sorting={sorting}
                  currentPage={currentPage}
                  handleSort={handleSort}
                  openPoolHandler={openPoolHandler}
                />
                <PoolsTableMobile
                  tableData={currentTableData}
                  sorting={sorting}
                  currentPage={currentPage}
                  handleSort={handleSort}
                  openPoolHandler={openPoolHandler}
                />
              </>
            ) : (
              <div className="w-full overflow-hidden">
                <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-2 rounded-5 relative">
                  <div className="absolute inset-0 overflow-hidden rounded-5">
                    <EmptyStateIcon iconName="poolList" className="absolute right-0" />
                  </div>
                  <p className="text-16 text-secondary-text relative z-10">Pools not found</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={pools.length}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setCurrentPage(page as number)}
      />
    </>
  );
}
