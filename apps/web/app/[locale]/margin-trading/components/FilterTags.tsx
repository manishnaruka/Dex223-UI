import clsx from "clsx";
import { useMemo } from "react";

import {
  defaultBorrowMarketFilterValues,
  useBorrowMarketFilterStore,
} from "@/app/[locale]/margin-trading/stores/useBorrowMarketFilterStore";
import Svg from "@/components/atoms/Svg";

export default function FilterTags() {
  const {
    leverage,
    setLeverage,
    orderCurrencyLimit,
    setOrderCurrencyLimit,
    minLoanAmount,
    setMinLoanAmount,
    setMinPositionDuration,
    minPositionDuration,
    setMaxPositionDuration,
    maxPositionDuration,
    minOrderBalance,
    setMinOrderBalance,
    maxInterestRatePerMonth,
    setMaxInterestRatePerMonth,
    setLiquidationPriceSource,
    liquidationPriceSource,
  } = useBorrowMarketFilterStore();

  const filters = useMemo(() => {
    const filtersArray = [
      {
        key: "minOrderBalance",
        value: minOrderBalance,
        defaultValue: defaultBorrowMarketFilterValues.minOrderBalance,
        onReset: () => setMinOrderBalance(defaultBorrowMarketFilterValues.minOrderBalance),
        label: "Min order balance",
      },
      {
        key: "minLoanAmount",
        value: minLoanAmount,
        defaultValue: defaultBorrowMarketFilterValues.minLoanAmount,
        onReset: () => setMinLoanAmount(defaultBorrowMarketFilterValues.minLoanAmount),
        label: "Min loan amount",
      },
      {
        key: "leverage",
        value: leverage,
        formattedValue: `${leverage}x`,
        defaultValue: defaultBorrowMarketFilterValues.leverage,
        onReset: () => setLeverage(defaultBorrowMarketFilterValues.leverage),
        label: "Max leverage",
      },
      {
        key: "maxInterestRatePerMonth",
        value: maxInterestRatePerMonth,
        formattedValue: `${maxInterestRatePerMonth}%`,
        defaultValue: defaultBorrowMarketFilterValues.maxInterestRatePerMonth,
        onReset: () =>
          setMaxInterestRatePerMonth(defaultBorrowMarketFilterValues.maxInterestRatePerMonth),
        label: "Max interest rate per month",
      },
      {
        key: "orderCurrencyLimit",
        value: orderCurrencyLimit,
        defaultValue: defaultBorrowMarketFilterValues.orderCurrencyLimit,
        onReset: () => setOrderCurrencyLimit(defaultBorrowMarketFilterValues.orderCurrencyLimit),
        label: "Order currency limit",
      },

      // …add more filters here as needed
    ];

    if (
      !!maxPositionDuration &&
      !minPositionDuration &&
      maxPositionDuration !== defaultBorrowMarketFilterValues.maxPositionDuration
    ) {
      filtersArray.push({
        key: "maxPositionDuration",
        value: maxPositionDuration,
        formattedValue: `${maxPositionDuration} days`,
        defaultValue: defaultBorrowMarketFilterValues.maxPositionDuration,
        onReset: () => setMaxPositionDuration(defaultBorrowMarketFilterValues.maxPositionDuration),
        label: "Max position duration",
      });
    }

    if (
      !maxPositionDuration &&
      !!minPositionDuration &&
      minPositionDuration !== defaultBorrowMarketFilterValues.minPositionDuration
    ) {
      filtersArray.push({
        key: "minPositionDuration",
        value: minPositionDuration,
        formattedValue: `${minPositionDuration} days`,
        defaultValue: defaultBorrowMarketFilterValues.minPositionDuration,
        onReset: () => setMinPositionDuration(defaultBorrowMarketFilterValues.minPositionDuration),
        label: "Min position duration",
      });
    }

    if (
      !!maxPositionDuration &&
      !!minPositionDuration &&
      minPositionDuration !== defaultBorrowMarketFilterValues.minPositionDuration &&
      maxPositionDuration !== defaultBorrowMarketFilterValues.maxPositionDuration
    ) {
      filtersArray.push({
        key: "minPositionDuration",
        value: minPositionDuration + maxPositionDuration,
        formattedValue: `${minPositionDuration} - ${maxPositionDuration} days`,
        defaultValue:
          defaultBorrowMarketFilterValues.minPositionDuration +
          defaultBorrowMarketFilterValues.maxPositionDuration,
        onReset: () => {
          setMaxPositionDuration(defaultBorrowMarketFilterValues.maxPositionDuration);
          setMinPositionDuration(defaultBorrowMarketFilterValues.minPositionDuration);
        },
        label: "Position duration",
      });
    }

    return filtersArray;
  }, [
    leverage,
    maxInterestRatePerMonth,
    maxPositionDuration,
    minLoanAmount,
    minOrderBalance,
    minPositionDuration,
    orderCurrencyLimit,
    setLeverage,
    setMaxInterestRatePerMonth,
    setMaxPositionDuration,
    setMinLoanAmount,
    setMinOrderBalance,
    setMinPositionDuration,
    setOrderCurrencyLimit,
  ]);

  const isFiltersActive = useMemo(() => {
    return filters.some(({ value, defaultValue }) => value !== defaultValue);
  }, [filters]);

  return (
    <div className={clsx("flex items-center flex-wrap gap-3", isFiltersActive && "mb-4")}>
      {filters.map(({ key, value, defaultValue, onReset, label, formattedValue }) =>
        value !== defaultValue ? (
          <button
            key={key}
            onClick={onReset}
            className="text-tertiary-text group hocus:text-secondary-text hocus:bg-green-bg duration-200 flex items-center py-1 gap-1 pl-3 pr-2 rounded-2 bg-primary-bg"
          >
            {label}: {formattedValue || value}
            <Svg
              className="text-secondary-text duration-200 group-hocus:text-primary-text"
              iconName="close"
            />
          </button>
        ) : null,
      )}
    </div>
  );
}
