import React, { useState } from "react";
import { Address, isAddress } from "viem";

import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import { InputLabel } from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";

type LiquidationInitiator = "anyone" | "specified";

const labelsMap: Record<LiquidationInitiator, string> = {
  anyone: "Anyone",
  specified: "Specified addresses",
};

const initiators: LiquidationInitiator[] = ["anyone", "specified"];

export default function LiquidationInitiatorSelect() {
  const [initiator, setInitiator] = useState<LiquidationInitiator>("anyone");
  const [eligibleAddresses, setEligibleAddresses] = useState<Address[]>([]);

  const [inputValue, setInputValue] = useState("");

  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-6">
      <InputLabel label="May initiate liquidation" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {initiators.map((_initiator) => (
          <RadioButton
            key={_initiator}
            isActive={_initiator === initiator}
            onClick={() => {
              setInitiator(_initiator);
            }}
          >
            {labelsMap[_initiator]}
          </RadioButton>
        ))}
      </div>

      {initiator === "specified" && (
        <div>
          <InputLabel label="Address eligible for liquidation" tooltipText="Tooltip text" />
          <div className="grid grid-cols-[1fr_48px] gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0x..."
            />
            <Button
              className="!px-0"
              onClick={() => {
                if (isAddress(inputValue)) {
                  setEligibleAddresses([...eligibleAddresses, inputValue]);
                  setInputValue("");
                }
              }}
            >
              <Svg className="flex-shrink-0text-primary-bg" iconName="add" />
            </Button>
          </div>

          {eligibleAddresses.length > 0 && (
            <div className="mt-4 flex flex-col gap-1">
              {eligibleAddresses.map((_address) => {
                return (
                  <div
                    key={_address}
                    className="py-1 text-tertiary-text bg-quaternary-bg flex justify-between items-center rounded-2 pl-5 pr-2"
                  >
                    {_address}{" "}
                    <IconButton
                      onClick={() =>
                        setEligibleAddresses(
                          eligibleAddresses.filter(
                            (eligibleAddress) => eligibleAddress !== _address,
                          ),
                        )
                      }
                      buttonSize={24}
                      iconName="close"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
