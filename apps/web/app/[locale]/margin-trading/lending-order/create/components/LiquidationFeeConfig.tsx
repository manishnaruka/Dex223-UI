import { FormikErrors, FormikTouched } from "formik";
import React, { useCallback, useState } from "react";

import { ThirdStepValues } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import Select from "@/components/atoms/Select";
import SelectButton from "@/components/atoms/SelectButton";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import RadioButton from "@/components/buttons/RadioButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

type LiquidationFeePayer = "borrower" | "lender";

const labelsMap: Record<LiquidationFeePayer, string> = {
  borrower: "Borrower",
  lender: "Lender",
};

const feePayers: LiquidationFeePayer[] = ["borrower", "lender"];

export default function LiquidationFeeConfig({
  values,
  setFieldValue,
  errors,
  touched,
}: {
  values: ThirdStepValues;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<void | FormikErrors<ThirdStepValues>>;
  errors: FormikErrors<ThirdStepValues>;
  touched: FormikTouched<ThirdStepValues>;
}) {
  const [feePayer, setFeePayer] = React.useState<LiquidationFeePayer>("borrower");
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const handlePick = useCallback(
    (token: Currency) => {
      setFieldValue("liquidationFeeToken", token);

      setIsOpenedTokenPick(false);
    },
    [setFieldValue],
  );

  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mt-4 mb-6">
      <InputLabel label="Pays the liquidation deposit" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {feePayers.map((_feePayer) => {
          return (
            <RadioButton
              type="button"
              disabled={_feePayer === "lender"}
              isActive={feePayer === _feePayer}
              onClick={() => {
                setFeePayer(_feePayer);
              }}
              key={_feePayer}
            >
              {labelsMap[_feePayer]}
            </RadioButton>
          );
        })}
      </div>

      <InputLabel label="Liquidation fee token" />
      <SelectButton
        type="button"
        className="bg-quaternary-bg mb-6 pl-5"
        size={"medium"}
        fullWidth
        onClick={() => setIsOpenedTokenPick(true)}
      >
        {values.liquidationFeeToken?.wrapped.symbol || "Select token"}
      </SelectButton>

      <TextField
        label="Liquidation fee (for liquidator)"
        tooltipText="Tooltip text"
        placeholder="Liquidation fee (for liquidator)"
        internalText="ETH"
        value={values.liquidationFeeForLiquidator}
        onChange={(e) => setFieldValue("liquidationFeeForLiquidator", e.target.value)}
        error={touched.liquidationFeeForLiquidator && errors.liquidationFeeForLiquidator}
      />
      <TextField
        label="Liquidation fee (for lender)"
        tooltipText="Tooltip text"
        placeholder="Liquidation fee (for lender)"
        internalText="ETH"
        value={values.liquidationFeeForLender}
        onChange={(e) => setFieldValue("liquidationFeeForLender", e.target.value)}
        error={touched.liquidationFeeForLender && errors.liquidationFeeForLender}
      />

      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
        simpleForm
      />
    </div>
  );
}
