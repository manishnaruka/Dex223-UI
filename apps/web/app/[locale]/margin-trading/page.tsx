import React, { useMemo } from "react";

import BorrowMarketPageContent from "@/app/[locale]/margin-trading/components/BorrowMarketPageContent";

export default function MarginTrading({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const defaultTab = useMemo(() => {
    if (searchParams.tab === "lending-orders") {
      return 1;
    }
    if (searchParams.tab === "margin-positions") {
      return 2;
    }

    return 0;
  }, [searchParams.tab]);

  return <BorrowMarketPageContent defaultTab={defaultTab} />;
}
