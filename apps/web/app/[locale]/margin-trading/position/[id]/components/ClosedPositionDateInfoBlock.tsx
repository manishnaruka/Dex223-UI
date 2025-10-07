import ExternalTextLink from "@repo/ui/external-text-link";
import React from "react";

import { OrderInfoBlock } from "@/app/[locale]/margin-trading/components/widgets/OrderInfoBlock";
import timestampToDateString from "@/app/[locale]/margin-trading/helpers/timestampToDateString";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";

export default function ClosedPositionDateInfoBlock({ position }: { position: MarginPosition }) {
  const chainId = useCurrentChainId();
  return (
    <div className="rounded-5 gap-x-5 gap-y-4 bg-primary-bg px-10 pt-4 pb-5 mb-5">
      <OrderInfoBlock
        title="Closing details"
        cards={[
          {
            title: "Сlosing date",
            tooltipText: "Tooltip text",
            value: timestampToDateString(position.closedAt, { withUTC: false, withSeconds: true }),
            bg: "liquidation_date",
          },
          {
            title: "Closing",
            tooltipText: "Tooltip text",
            value: (
              <ExternalTextLink
                text={"Closing transaction"}
                href={getExplorerLink(ExplorerLinkType.TRANSACTION, position.txClosed, chainId)}
              />
            ),
            bg: "closed",
          },
        ]}
      />
    </div>
  );
}
