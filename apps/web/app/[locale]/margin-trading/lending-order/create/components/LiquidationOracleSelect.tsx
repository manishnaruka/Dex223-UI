import React, { useState } from "react";

import Svg from "@/components/atoms/Svg";
import { InputLabel } from "@/components/atoms/TextField";
import RadioButton from "@/components/buttons/RadioButton";

type LiquidationOracle = "dex223" | "uniswap" | "link";

const labelsMap: Record<LiquidationOracle, string> = {
  dex223: "DEX223 market",
  uniswap: "Uniswap market",
  link: "LINK price oracle",
};

const linksMap: Record<LiquidationOracle, string> = {
  dex223: "#",
  uniswap: "#",
  link: "#",
};

const oracles: LiquidationOracle[] = ["dex223", "uniswap", "link"];

export default function LiquidationOracleSelect() {
  const [oracle, setOracle] = useState<LiquidationOracle>("dex223");
  return (
    <div className="mb-[34px]">
      <InputLabel label="Liquidation price source" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {oracles.map((_oracle) => (
          <RadioButton
            key={_oracle}
            className="min-h-10 py-0 items-center"
            isActive={_oracle === oracle}
            onClick={() => setOracle(_oracle)}
          >
            <span className="items-center flex flex-grow justify-between">
              {labelsMap[_oracle]}
              <a
                className="text-tertiary-text hover:text-green-hover duration-200"
                href={linksMap[_oracle]}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Svg iconName="forward" />
              </a>
            </span>
          </RadioButton>
        ))}
      </div>
    </div>
  );
}
