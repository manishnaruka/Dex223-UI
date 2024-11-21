import clsx from "clsx";
import Image from "next/image";

import { Currency } from "@/sdk_hybrid/entities/currency";

export default function TokensPair({
  tokenA,
  tokenB,
  isBold = true,
}: {
  tokenA?: Currency | undefined;
  tokenB?: Currency | undefined;
  isBold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center">
        <span className="w-[26px] h-[26px] md:w-[34px] md:h-[34px] rounded-full bg-primary-bg flex items-center justify-center">
          <Image
            src={tokenA?.logoURI || "/tokens/placeholder.svg"}
            alt="Ethereum"
            width={32}
            height={32}
            className="h-[24px] w-[24px] md:h-[32px] md:w-[32px]"
          />
        </span>
        <span className="w-[26px] h-[26px] md:w-[34px] md:h-[34px] rounded-full bg-primary-bg flex items-center justify-center -ml-3.5">
          <Image
            src={tokenB?.logoURI || "/tokens/placeholder.svg"}
            alt="Ethereum"
            width={32}
            height={32}
            className="h-[24px] w-[24px] md:h-[32px] md:w-[32px]"
          />
        </span>
      </div>
      <span
        className={clsx(
          "md:font-bold md:text-16 text-18 font-bold  block",
          isBold
            ? "md:font-bold font-bold text-secondary-text"
            : "md:font-medium font-medium text-primary-text",
        )}
      >
        {tokenA?.symbol} / {tokenB?.symbol}
      </span>
    </div>
  );
}
