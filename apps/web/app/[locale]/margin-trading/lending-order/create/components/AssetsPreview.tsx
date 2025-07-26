import Image from "next/image";
import React from "react";

import { Currency } from "@/sdk_bi/entities/currency";

export function AssetsPreview({ assets }: { assets: Currency[] }) {
  return (
    <span className="flex gap-2">
      {assets.length > 2 ? (
        <>
          {assets.slice(0, 2).map((token) => (
            <span
              key={token.wrapped.address0}
              className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
            >
              <Image
                width={16}
                height={16}
                src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
                alt={""}
              />
              {token.symbol}
            </span>
          ))}
          <span className="p-0.5 text-14">{"..."}</span>

          <span className="rounded-1 border border-secondary-border text-14 font-medium py-0.5 px-1 min-w-6 flex items-center justify-center">
            {assets.length - 2}
          </span>
        </>
      ) : (
        assets.map((token) => (
          <span
            key={token.wrapped.address0}
            className="rounded-1 flex items-center gap-1 border border-secondary-border text-14 py-0.5 pl-1 pr-3"
          >
            <Image
              width={16}
              height={16}
              src={token.wrapped.logoURI || "/images/tokens/placeholder.svg"}
              alt={""}
            />
            {token.symbol}
          </span>
        ))
      )}
    </span>
  );
}
