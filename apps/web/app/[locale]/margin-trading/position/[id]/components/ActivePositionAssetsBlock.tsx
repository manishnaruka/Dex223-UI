import Tooltip from "@repo/ui/tooltip";
import React from "react";
import SimpleBar from "simplebar-react";
import { formatUnits } from "viem";

import PositionAsset from "@/app/[locale]/margin-trading/components/widgets/PositionAsset";
import { MarginPosition } from "@/app/[locale]/margin-trading/types";
import { SearchInput } from "@/components/atoms/Input";
import { formatFloat } from "@/functions/formatFloat";

export default function ActivePositionInfoBlock({ position }: { position: MarginPosition }) {
  return (
    <div className="bg-primary-bg rounded-5 px-10 pt-4 pb-5 flex flex-col gap-3 mb-5">
      <h3 className="text-20 text-secondary-text font-medium">Assets</h3>

      <div className="bg-tertiary-bg rounded-3 px-5 pb-5 pt-2">
        <div className="flex justify-between mb-3">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-tertiary-text flex items-center gap-1">
              Assets
              <Tooltip text="Tooltip text" />
            </h3>
            <span className="text-20 font-medium text-secondary-text">
              {position.assets.length} / {position.order.currencyLimit} tokens
            </span>
          </div>
          <div>
            <SearchInput placeholder="Token name" className="bg-primary-bg" />
          </div>
        </div>

        <SimpleBar style={{ maxHeight: 216 }}>
          <div className="flex gap-1 flex-wrap">
            {position.assetsWithBalances?.map(({ asset, balance }) => (
              <PositionAsset
                key={asset.wrapped.address0}
                amount={formatFloat(formatUnits(balance || BigInt(0), asset.decimals))}
                symbol={asset.symbol || "Unknown"}
              />
            ))}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
