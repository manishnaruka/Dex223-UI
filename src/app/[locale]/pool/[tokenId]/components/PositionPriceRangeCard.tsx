import { useMemo } from "react";

import { Token } from "@/sdk_hybrid/entities/token";

export default function PositionPriceRangeCard({
  price,
  tokenA,
  tokenB,
  showFirst,
  isMax = false,
}: {
  price?: string;
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  showFirst: boolean;
  isMax?: boolean;
}) {
  const symbol = useMemo(() => {
    if (isMax) {
      return showFirst ? tokenA?.symbol : tokenB?.symbol;
    }

    return showFirst ? tokenB?.symbol : tokenA?.symbol;
  }, [isMax, showFirst, tokenA?.symbol, tokenB?.symbol]);

  return (
    <div className="rounded-3 overflow-hidden">
      <div className="py-2 lg:py-3 px-2 lg:px-5 flex items-center justify-center flex-col bg-quaternary-bg">
        <div className="text-12 lg:text-14 text-secondary-text">{isMax ? "Max" : "Min"} price</div>
        <div className="text-16 lg:text-18">{price}</div>
        <div className="text-12 lg:text-14 text-tertiary-text">
          {showFirst
            ? `${tokenB?.symbol} per ${tokenA?.symbol}`
            : `${tokenA?.symbol} per ${tokenB?.symbol}`}
        </div>
      </div>
      <div className="text-12 lg:text-14 bg-quaternary-bg py-2 lg:py-3 px-2 lg:px-5 border-t-2 border-tertiary-bg text-tertiary-text text-center">
        Your position will be 100% {symbol} at this price
      </div>
    </div>
  );
}
