import Switch from "@repo/ui/switch";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export const PriceRangeHeader = ({
  isFullRange,
  handleSetFullRange,
  baseSymbol,
  quoteSymbol,
  invertPrice,
  onFlip,
}: {
  isFullRange: boolean;
  handleSetFullRange: () => void;
  baseSymbol?: string;
  quoteSymbol?: string;
  invertPrice: boolean;
  onFlip: () => void;
}) => {
  const t = useTranslations("Liquidity");
  return (
    <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:justify-between md:items-center">
      <h3 className="text-16 font-bold text-secondary-text">{t("set_price_range")}</h3>
      {baseSymbol && quoteSymbol ? (
        <div className="flex gap-3 justify-between md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-primary-text text-12">{t("full_range")}</span>
            <Switch
              checked={isFullRange}
              handleChange={() => {
                console.log("Full range");
                handleSetFullRange();
              }}
            />
          </div>

          <div className="flex p-0.5 gap-0.5 rounded-2 bg-secondary-bg">
            <button
              onClick={onFlip}
              className={clsx(
                "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                !invertPrice
                  ? "bg-green-bg border-green text-primary-text"
                  : "hocus:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
              )}
            >
              {invertPrice ? baseSymbol : quoteSymbol}
            </button>
            <button
              onClick={onFlip}
              className={clsx(
                "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                invertPrice
                  ? "bg-green-bg border-green text-primary-text"
                  : "hocus:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
              )}
            >
              {invertPrice ? quoteSymbol : baseSymbol}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
