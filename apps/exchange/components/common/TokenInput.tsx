import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { NumericFormat } from "react-number-format";
import { formatFloat } from "web/functions/formatFloat";

import { ExchangeToken } from "@/app/[locale]/types";
import Preloader from "@/components/atoms/Preloader";
import SelectButton from "@/components/atoms/SelectButton";
import Skeleton from "@/components/atoms/Skeleton";
import InputButton from "@/components/buttons/InputButton";

export default function TokenInput({
  handleClick,
  token,
  value,
  onInputChange,
  label,
  readOnly = false,
  minAmount,
  minAmountLoading = false,
  setMinAmount,
  isLoadingAmount = false,
}: {
  handleClick: () => void;
  token: ExchangeToken | undefined;
  value: string;
  onInputChange: (value: string) => void;
  label: string;
  minAmount?: string;
  minAmountLoading?: boolean;
  setMinAmount?: () => void;
  readOnly?: boolean;
  isLoadingAmount?: boolean;
}) {
  const t = useTranslations("Swap");

  return (
    <div className="p-5 bg-secondary-bg rounded-3 relative">
      <div className="flex justify-between items-center mb-5 h-[22px]">
        <span className="text-14 block text-secondary-text">{label}</span>
        {minAmount && !minAmountLoading && (
          <div className="flex items-center gap-1 text-12">
            <button
              className="text-green hover:text-green-hover duration-200"
              onClick={setMinAmount}
            >
              Min amount
            </button>
            <span className="text-tertiary-text">
              {Math.ceil(+minAmount * 1000) / 1000} {token?.symbol.toUpperCase()}
            </span>
          </div>
        )}
        {minAmountLoading && <Skeleton className="w-[150px] h-4" />}
      </div>

      <div className="flex items-center mb-5 justify-between">
        <div>
          {isLoadingAmount ? (
            <Skeleton className="w-[120px] h-12" />
          ) : (
            <NumericFormat
              allowedDecimalSeparators={[","]}
              inputMode="decimal"
              placeholder="0.0"
              className={clsx(
                "h-12 bg-transparent outline-0 border-0 text-32 w-full peer placeholder:text-tertiary-text",
                readOnly && "pointer-events-none",
              )}
              type="text"
              value={value}
              onValueChange={(values) => {
                onInputChange(values.value);
              }}
              allowNegative={false}
            />
          )}
          <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hocus:shadow peer-hocus:shadow-green/60 peer-focus:shadow peer-focus:shadow-green/60 peer-focus:border-green top-0 left-0" />
        </div>
        <SelectButton
          className="flex-shrink-0"
          variant="rounded"
          onClick={handleClick}
          size="large"
        >
          {token ? (
            <span className="flex gap-2 items-center">
              <Image
                className="flex-shrink-0"
                src={token?.image || ""}
                alt="Ethereum"
                width={32}
                height={32}
              />
              <span className="max-w-[100px] md:max-w-[150px] overflow-ellipsis overflow-hidden whitespace-nowrap">
                {token.name}
              </span>
            </span>
          ) : (
            <span className="whitespace-nowrap text-tertiary-text pl-2">{t("select_token")}</span>
          )}
        </SelectButton>
      </div>
    </div>
  );
}
