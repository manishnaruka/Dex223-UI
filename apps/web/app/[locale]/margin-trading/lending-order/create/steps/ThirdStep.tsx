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
import { useConfirmCreateOrderDialogStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useConfirmCreateOrderDialogOpened";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { useNativeCurrency } from "@/hooks/useNativeCurrency";
import { NativeCurrency } from "@/sdk_bi/entities/nativeCurrency";
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

export default function ThirdStep() {
  const { setIsOpen } = useConfirmCreateOrderDialogStore();
  const { setStep } = useCreateOrderStepStore();
  const { firstStepValues, secondStepValues, thirdStepValues, setThirdStepValues } =
    useCreateOrderConfigStore();
  const nativeCurrency = useNativeCurrency();
  console.log(firstStepValues, secondStepValues);
  return (
    <Formik
      initialValues={{ ...thirdStepValues, liquidationFeeToken: nativeCurrency }}
      validationSchema={thirdStepSchema}
      onSubmit={async (values, { validateForm }) => {
        // const errors = await validateForm(values);
        // console.log(errors);
        setThirdStepValues(values);
        setIsOpen(true);
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
                size={ButtonSize.EXTRA_SMALL}
                onClick={() => null}
                fullWidth={false}
                className="rounded-5"
              >
                Edit
              </Button>
            </div>
          </div>

          {/*<pre>{JSON.stringify(errors, null, 2)}</pre>*/}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              colorScheme={ButtonColor.LIGHT_GREEN}
              onClick={() => setStep(CreateOrderStep.SECOND)}
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
              Create lending order
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
}
