import Alert from "@repo/ui/alert";
import { Formik } from "formik";
import React from "react";
import { formatEther, formatGwei } from "viem";
import * as Yup from "yup";

import LiquidationFeeConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationFeeConfig";
import LiquidationInitiatorSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationInitiatorSelect";
import LiquidationOracleSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationOracleSelect";
import {
  LiquidationMode,
  LiquidationType,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { ThirdStepValues } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import { OrderActionMode, OrderActionStep } from "@/app/[locale]/margin-trading/types";
import { InputWithArrows } from "@/components/atoms/Input";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import GasSettingsBlock from "@/components/common/GasSettingsBlock";
import { formatFloat } from "@/functions/formatFloat";
import { useNativeCurrency } from "@/hooks/useNativeCurrency";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

export const thirdStepSchema = Yup.object().shape({
  liquidationMode: Yup.object().shape({
    type: Yup.mixed<LiquidationType>()
      .oneOf([LiquidationType.ANYONE, LiquidationType.SPECIFIED])
      .required(),

    whitelistedLiquidators: Yup.array()
      .of(Yup.string().matches(addressRegex, "Invalid address").required())
      .when("type", {
        is: LiquidationType.SPECIFIED,
        then: (schema) => schema.min(1, "At least one whitelisted liquidator is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
  }),

  orderCurrencyLimit: Yup.number()
    .typeError("Order currency limit must be a number")
    .required("Order currency limit is required")
    .min(2, "Minimum value is 2")
    .max(10, "Maximum value is 10"),

  liquidationFeeToken: Yup.object().required("Liquidation fee token is required"),

  liquidationFeeForLiquidator: Yup.number()
    .typeError("Fee for liquidator must be a number")
    .required("Fee for liquidator is required"),

  liquidationFeeForLender: Yup.number()
    .typeError("Fee for lender must be a number")
    .required("Fee for lender is required"),
});

export default function ThirdStep({
  mode,
  openPreviewDialog,
  setStep,
  thirdStepValues,
  setThirdStepValues,
}: {
  mode: OrderActionMode;
  openPreviewDialog: () => void;
  thirdStepValues: ThirdStepValues;
  setThirdStepValues: (thirdStep: ThirdStepValues) => void;
  setStep: (step: OrderActionStep) => void;
}) {
  const nativeCurrency = useNativeCurrency();
  return (
    <Formik
      initialValues={{
        ...thirdStepValues,
        liquidationFeeToken:
          mode === OrderActionMode.CREATE ? nativeCurrency : thirdStepValues.liquidationFeeToken,
      }}
      validationSchema={thirdStepSchema}
      onSubmit={async (values, { validateForm }) => {
        // const errors = await validateForm(values);
        setThirdStepValues(values);
        openPreviewDialog();
      }}
    >
      {({ handleSubmit, values, errors, touched, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <LiquidationInitiatorSelect
            values={values.liquidationMode}
            setValue={(values: LiquidationMode) => setFieldValue("liquidationMode", values)}
          />

          <TextField
            label="Order currency limit"
            placeholder="Order currency limit"
            tooltipText="Tooltip text"
            isNumeric={true}
            value={values.orderCurrencyLimit}
            onChange={(e) => setFieldValue("orderCurrencyLimit", e.target.value)}
            error={touched.orderCurrencyLimit && errors.orderCurrencyLimit}
            isWarning={+values.orderCurrencyLimit > 4 && +values.orderCurrencyLimit < 10}
          />

          {+values.orderCurrencyLimit > 4 && +values.orderCurrencyLimit < 10 && (
            <Alert
              type="warning"
              text="If more than 4 currencies are specified, the liquidation fee (Borrower) will be higher"
            />
          )}

          <LiquidationFeeConfig
            errors={errors}
            touched={touched}
            values={values}
            setFieldValue={setFieldValue}
          />
          <LiquidationOracleSelect />

          <GasSettingsBlock />

          {/*<pre>{JSON.stringify(errors, null, 2)}</pre>*/}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              colorScheme={ButtonColor.LIGHT_GREEN}
              onClick={() => setStep(OrderActionStep.SECOND)}
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
            >
              Previous step
            </Button>
            <Button
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
              type="submit"
              disabled={Object.keys(touched).length > 0 && Object.keys(errors).length > 0}
            >
              {mode === OrderActionMode.CREATE ? "Create lending order" : "Edit lending order"}
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
}
