import React from "react";
import { formatEther, formatGwei } from "viem";

import LiquidationFeeConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationFeeConfig";
import LiquidationInitiatorSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationInitiatorSelect";
import LiquidationOracleSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationOracleSelect";
import { useConfirmCreateOrderDialogStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useConfirmCreateOrderDialogOpened";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";

export default function ThirdStep() {
  const { setIsOpen } = useConfirmCreateOrderDialogStore();
  const { setStep } = useCreateOrderStepStore();
  const { firstStepValues, secondStepValues } = useCreateOrderConfigStore();

  console.log(firstStepValues, secondStepValues);
  return (
    <>
      <LiquidationInitiatorSelect />

      <TextField
        label="Order currency limit"
        placeholder="Order currency limit"
        tooltipText="Tooltip text"
        isNumeric={true}
      />

      <LiquidationFeeConfig />
      <LiquidationOracleSelect />

      <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
        <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
          <p className="flex flex-col text-tertiary-text">
            <span>Gas price:</span>
            <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
          </p>

          <p className="flex flex-col text-tertiary-text">
            <span>Gas limit:</span>
            <span>{329000}</span>
          </p>
          <p className="flex flex-col">
            <span className="text-tertiary-text">Network fee:</span>
            <span>{formatFloat(formatEther(BigInt(0) * BigInt(0), "wei"))} ETH</span>
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] xs:flex xs:items-center gap-2 w-full xs:w-auto mt-2 xs:mt-0">
          <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border max-xs:h-8">
            Cheaper
          </span>
          <Button
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={false ? ButtonSize.SMALL : ButtonSize.EXTRA_SMALL}
            onClick={() => null}
            fullWidth={false}
            className="rounded-5"
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          colorScheme={ButtonColor.LIGHT_GREEN}
          onClick={() => setStep(CreateOrderStep.SECOND)}
          size={ButtonSize.EXTRA_LARGE}
          fullWidth
        >
          Previous step
        </Button>
        <Button size={ButtonSize.EXTRA_LARGE} fullWidth onClick={() => setIsOpen(true)}>
          Create lending order
        </Button>
      </div>
    </>
  );
}
