import React, { ChangeEvent, useEffect, useMemo } from "react";

import { InputSize } from "@/components/atoms/Input";
import TextField from "@/components/atoms/TextField";
import ErrorsAndWarnings from "@/components/gas-settings/ErrorsAndWarnings";
import { ThemeColors } from "@/config/theme/colors";
import { useColorScheme } from "@/lib/color-scheme";

export default function GasLimitField({
  value,
  setFieldValue,
  onChange,
  onBlur,
  estimatedGas,
  gasLimitError,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  setFieldValue: (value: string) => void;
  estimatedGas: bigint;
  gasLimitError: string | undefined;
}) {
  const colorScheme = useColorScheme();
  const gasLimitErrors = useMemo(() => {
    const _errors: string[] = [];

    [gasLimitError].forEach((v) => {
      if (v) {
        _errors.push(v);
      }
    });

    return _errors;
  }, [gasLimitError]);

  return (
    <>
      <TextField
        colorScheme={colorScheme}
        isNumeric
        decimalScale={0}
        placeholder="Gas limit"
        label="Gas limit"
        name="gasLimit"
        id="gasLimit"
        tooltipText="The amount of fee that you are going to pay is calculated as (baseFee + priorityFee) * gasUsed.

Gas Limit sets the upper bound for gasUsed variable in this formula. If your transaction will consume less gas than the Gas Limit then you will only pay for the gas required for your transaction to submit and the rest will be refunded.

Setting a low Gas Limit may result in transaction failure if the amount of actions triggered by this transaction require more gas than specified with Gas Limit."
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isError={!!gasLimitError}
        helperText={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                setFieldValue(estimatedGas ? estimatedGas.toString() : "100000");
              }}
              className={
                {
                  [ThemeColors.GREEN]: "text-green duration-200 hocus:text-green-hover",
                  [ThemeColors.PURPLE]: "text-purple duration-200 hocus:text-purple-hover",
                }[colorScheme]
              }
            >
              Estimated
            </button>{" "}
            {estimatedGas ? estimatedGas?.toString() : 100000} Gwei
          </div>
        }
        inputSize={InputSize.DEFAULT}
      />
      <ErrorsAndWarnings errors={gasLimitErrors} />
    </>
  );
}
