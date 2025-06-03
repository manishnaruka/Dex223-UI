import Image from "next/image";
import React from "react";

import { InputSize } from "@/components/atoms/Input";
import { InputLabel } from "@/components/atoms/TextField";
import IconButton from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";

type TokenSource = "tokens" | "listing";

const labelsMap: Record<TokenSource, string> = {
  tokens: "Tokens",
  listing: "Listing contract",
};

const sources: TokenSource[] = ["tokens", "listing"];

export default function LendingOrderTokensSourceConfig() {
  const [source, setSource] = React.useState<TokenSource>("tokens");
  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
      <InputLabel label="Token source type" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {sources.map((_source) => {
          return (
            <RadioButton
              key={_source}
              isActive={source === _source}
              onClick={() => {
                setSource(_source);
              }}
            >
              {labelsMap[_source]}
            </RadioButton>
          );
        })}
      </div>

      {source === "tokens" && (
        <>
          <div className="flex justify-between items-center">
            <InputLabel
              inputSize={InputSize.LARGE}
              label="Tokens allowed for trading"
              tooltipText="Tooltip text"
              noMargin
            />
            <IconButton buttonSize={32} iconSize={20} iconName={"edit"} />
          </div>
          <div className="bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start flex flex-wrap gap-1">
            {["ETH", "USDT", "DAI"].map((tokenName) => {
              return (
                <div
                  key={tokenName}
                  className="border pl-1 py-1 pr-3 flex items-center gap-2 rounded-2 border-secondary-border"
                >
                  <Image
                    width={24}
                    height={24}
                    src={"/images/tokens/placeholder.svg"}
                    alt={tokenName}
                  />
                  <span>{tokenName}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {source === "listing" && (
        <>
          <div className="flex justify-between items-center">
            <InputLabel
              inputSize={InputSize.LARGE}
              label="Tokens allowed for trading"
              tooltipText="Tooltip text"
              noMargin
            />
            <IconButton buttonSize={32} iconSize={20} iconName={"edit"} />
          </div>
          <div className="bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start flex flex-wrap gap-1">
            {["PancakeSwap Ethereum Default"].map((tokenListName) => {
              return (
                <div key={tokenListName} className="pb-1.5 pt-0.5 px-4 rounded-2.5 bg-primary-bg">
                  <p>{tokenListName}</p>
                  <p className="text-12 text-tertiary-text">48 tokens</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
