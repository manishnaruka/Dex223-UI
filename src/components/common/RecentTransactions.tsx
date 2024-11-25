import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";

import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import Pagination from "@/components/common/Pagination";
import RecentTransaction from "@/components/common/RecentTransaction";
import {
  RecentTransactionStatus,
  RecentTransactionTitleTemplate,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

const PAGE_SIZE = 10;

interface Props {
  showRecentTransactions: boolean;
  handleClose: () => void;
  pageSize?: number;
  filterFunction?: RecentTransactionTitleTemplate[];
}
export default function RecentTransactions({
  showRecentTransactions,
  handleClose,
  pageSize = PAGE_SIZE,
  filterFunction = [],
}: Props) {
  const t = useTranslations("RecentTransactions");

  const { transactions } = useRecentTransactionsStore();

  console.dir(transactions);

  const { address } = useAccount();

  const componentRef = useRef<HTMLDivElement>(null);
  const prevShowRecentTransactions = useRef(showRecentTransactions);

  useEffect(() => {
    // Check if switching from non-visible to visible
    if (!prevShowRecentTransactions.current && showRecentTransactions && componentRef.current) {
      const rect = componentRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isVisible) {
        componentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Update the previous value for the next render
    prevShowRecentTransactions.current = showRecentTransactions;
  }, [showRecentTransactions]);

  const lowestPendingNonce = useMemo(() => {
    if (address) {
      const accountPendingTransactions = transactions[address]?.filter(
        (v) => v.status === RecentTransactionStatus.PENDING,
      );

      if (!accountPendingTransactions) {
        return -1;
      }

      return accountPendingTransactions.reduce((lowest, obj) => {
        return obj.nonce < lowest ? obj.nonce : lowest;
      }, accountPendingTransactions[0]?.nonce || -1);
    }

    return -1;
  }, [address, transactions]);

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return [...transactions[address]];
    }

    return [];
  }, [address, transactions]);

  const _transactionsFiltered = useMemo(() => {
    if (filterFunction?.length) {
      return _transactions.filter((tx) => {
        return filterFunction.includes(tx.title?.template);
      });
    }

    return _transactions;
  }, [filterFunction, _transactions]);

  const [currentPage, setCurrentPage] = useState(1);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return _transactionsFiltered.slice(firstPageIndex, lastPageIndex);
  }, [_transactionsFiltered, currentPage, pageSize]);

  return (
    <>
      {showRecentTransactions && (
        <div ref={componentRef}>
          <div className="px-4 md:px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="font-bold text-20">{t("transactions")}</h3>
              <div className="flex items-center">
                <IconButton variant={IconButtonVariant.CLOSE} handleClose={handleClose} />
              </div>
            </div>
            <div>
              {currentTableData.length ? (
                <>
                  <div className="pb-5 flex flex-col gap-3">
                    {currentTableData.map((transaction) => {
                      return (
                        <RecentTransaction
                          isLowestNonce={transaction.nonce === lowestPendingNonce}
                          transaction={transaction}
                          key={transaction.hash}
                        />
                      );
                    })}
                  </div>
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={_transactionsFiltered.length}
                    pageSize={pageSize}
                    onPageChange={(page) => setCurrentPage(page as number)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
                  <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                  <span className="text-secondary-text">
                    {t("transactions_will_be_displayed_here")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
