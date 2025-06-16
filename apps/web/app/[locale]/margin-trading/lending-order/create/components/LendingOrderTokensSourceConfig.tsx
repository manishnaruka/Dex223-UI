import Checkbox from "@repo/ui/checkbox";
import Image from "next/image";
import React from "react";

import {
  LendingOrderTradingTokens,
  TradingTokensInputMode,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useAllowedTokenListsDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useAllowedTokenListsDialogOpened";
import { useAllowedTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useAllowedTokensDialogOpened";
import { InputSize } from "@/components/atoms/Input";
import { InputLabel } from "@/components/atoms/TextField";
import IconButton from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";

const labelsMap: Record<TradingTokensInputMode, string> = {
  [TradingTokensInputMode.MANUAL]: "Tokens",
  [TradingTokensInputMode.AUTOLISTING]: "Listing contract",
};

export default function LendingOrderTokensSourceConfig({
  values,
  setValues,
}: {
  values: LendingOrderTradingTokens;
  setValues: (values: LendingOrderTradingTokens) => void;
}) {
  const { setIsOpen: setAllowedListingsOpened } = useAllowedTokenListsDialogOpenedStore();
  const { setIsOpen: setAllowedTokensDialogOpened } = useAllowedTokensDialogOpenedStore();

  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
      <InputLabel label="Token source type" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {[TradingTokensInputMode.MANUAL, TradingTokensInputMode.AUTOLISTING].map((_source) => {
          return (
            <RadioButton
              type="button"
              key={_source}
              isActive={values.inputMode === _source}
              onClick={() => {
                setValues({ ...values, inputMode: _source });
              }}
            >
              {labelsMap[_source]}
            </RadioButton>
          );
        })}
      </div>

      {values.inputMode === TradingTokensInputMode.MANUAL && (
        <>
          <div className="flex justify-between items-center">
            <InputLabel
              inputSize={InputSize.LARGE}
              label="Tokens allowed for trading"
              tooltipText="Tooltip text"
              noMargin
            />
            <IconButton
              onClick={() => setAllowedTokensDialogOpened(true)}
              buttonSize={32}
              iconSize={20}
              iconName={"edit"}
            />
          </div>
          <div className="mb-3">
            <div className="bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start flex flex-wrap gap-1">
              {values.allowedTokens.map((currency) => {
                return (
                  <div
                    key={
                      currency.isToken ? currency.address0 : `native-${currency.wrapped.address0}`
                    }
                    className="border pl-1 py-1 pr-3 flex items-center gap-2 rounded-1 border-secondary-border"
                  >
                    <Image
                      className="flex-shrink-0"
                      width={24}
                      height={24}
                      src={currency.logoURI || "/images/tokens/placeholder.svg"}
                      alt={""}
                    />
                    <span>{currency.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="py-2">
            <Checkbox
              label="Allow ERC-223 trading"
              tooltipText="Tooltip text"
              labelClassName="text-secondary-text"
              checked={values.includeERC223Trading}
              handleChange={() =>
                setValues({ ...values, includeERC223Trading: !values.includeERC223Trading })
              }
              id={"allow-223-trading"}
            />
          </div>
        </>
      )}

      {values.inputMode === TradingTokensInputMode.AUTOLISTING && (
        <>
          <div className="flex justify-between items-center">
            <InputLabel
              inputSize={InputSize.LARGE}
              label="Tokens allowed for trading"
              tooltipText="Tooltip text"
              noMargin
            />
            <IconButton
              buttonSize={32}
              iconSize={20}
              iconName={"edit"}
              onClick={() => {
                setAllowedListingsOpened(true);
              }}
            />
          </div>
          <div className="bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start flex flex-wrap gap-1">
            {values.tradingTokensAutoListing && (
              <div className="pb-1.5 pt-0.5 px-4 rounded-2.5 bg-primary-bg">
                <p>{values.tradingTokensAutoListing.name}</p>
                <p className="text-12 text-tertiary-text">
                  {values.tradingTokensAutoListing.totalTokens} tokens
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
