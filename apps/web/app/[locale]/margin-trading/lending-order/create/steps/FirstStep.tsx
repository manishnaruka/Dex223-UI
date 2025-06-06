import { Formik } from "formik";
import React from "react";
import * as Yup from "yup";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderPeriodConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderPeriodConfig";
import LendingOrderTokenSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokenSelect";
import {
  LendingOrderPeriod,
  LendingOrderPeriodType,
  PerpetualPeriodType,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonSize } from "@/components/buttons/Button";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

const fixedPeriodSchema = Yup.object({
  type: Yup.mixed<LendingOrderPeriodType>().oneOf([LendingOrderPeriodType.FIXED]).required(),
  lendingOrderDeadline: Yup.date().typeError("Invalid date").required("Deadline required"),
  positionDuration: Yup.number().typeError("Must be a number").required("Duration required"),
}).noUnknown();

const perpetualPeriodSchema = Yup.object({
  type: Yup.mixed<LendingOrderPeriodType>().oneOf([LendingOrderPeriodType.PERPETUAL]).required(),
  borrowingPeriod: Yup.object({
    type: Yup.mixed<PerpetualPeriodType>()
      .oneOf([PerpetualPeriodType.DAYS, PerpetualPeriodType.SECONDS])
      .required(),

    borrowingPeriodInDays: Yup.number().when("type", {
      is: PerpetualPeriodType.DAYS,
      then: (s) => s.typeError("Must be a number").required("Days required"),
      otherwise: (s) => s.notRequired().nullable(), // <-- remove when not in use
    }),

    borrowingPeriodInSeconds: Yup.number().when("type", {
      is: PerpetualPeriodType.SECONDS,
      then: (s) => s.typeError("Must be a number").required("Seconds required"),
      otherwise: (s) => s.notRequired().nullable(),
    }),
  }).required("Borrowing period required"),
}).noUnknown();

const periodSchema = Yup.lazy((value: any) => {
  if (value?.type === LendingOrderPeriodType.FIXED) {
    return fixedPeriodSchema;
  } else if (value?.type === LendingOrderPeriodType.PERPETUAL) {
    return perpetualPeriodSchema;
  }
  return Yup.mixed().notRequired(); // fallback
});

const schema = Yup.object({
  loanToken: Yup.object().required("Token is required"),

  loanAmount: Yup.number()
    .typeError("Loan amount must be a number")
    .required("Loan amount is required")
    .positive("Loan amount must be greater than zero"),

  interestRatePerMonth: Yup.number()
    .typeError("Interest rate must be a number")
    .required("Please provide interest rate per month")
    .min(0, "Interest rate cannot be negative"),

  loanTokenStandard: Yup.string()
    .oneOf([Standard.ERC20, Standard.ERC223])
    .required("Token standard is required"),

  period: periodSchema, // your conditional schema from previous step
});

export default function FirstStep() {
  const { setStep } = useCreateOrderStepStore();

  const { firstStepValues, setFirstStepValues } = useCreateOrderConfigStore();

  return (
    <Formik
      initialValues={{
        interestRatePerMonth: firstStepValues.interestRatePerMonth,
        period: firstStepValues.period,
        loanToken: firstStepValues.loanToken,
        loanAmount: firstStepValues.loanAmount,
        loanTokenStandard: firstStepValues.loanTokenStandard,
      }}
      validationSchema={schema}
      onSubmit={async (values) => {
        console.log(values);
        setFirstStepValues(values);
        setStep(CreateOrderStep.SECOND);
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <LendingOrderTokenSelect
            token={props.values.loanToken}
            setToken={(token: Currency) => props.setFieldValue("loanToken", token)}
            amount={props.values.loanAmount}
            setAmount={(loanAmount: string) => props.setFieldValue("loanAmount", loanAmount)}
            standard={props.values.loanTokenStandard}
            setStandard={(standard: Standard) => props.setFieldValue("loanTokenStandard", standard)}
          />
          <LendingOrderPeriodConfig
            setValues={(values: LendingOrderPeriod) => props.setFieldValue("period", values)}
            values={props.values.period}
          />
          <TextField
            isNumeric
            label="Interest rate per month"
            placeholder="Interest rate per month"
            internalText="%"
            error={props.errors.interestRatePerMonth}
            value={props.values.interestRatePerMonth}
            onChange={(e) => props.setFieldValue("interestRatePerMonth", e.target.value)}
          />

          <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col gap-2 mb-5 mt-4">
            <LendingOrderDetailsRow title={"Interest rate for the entire period"} value={"—"} />
            <LendingOrderDetailsRow title={"You will receive for the entire period"} value={"—"} />
          </div>
          <pre>{JSON.stringify(props.errors, null, 2)}</pre>

          <Button type="submit" size={ButtonSize.EXTRA_LARGE} fullWidth>
            Next step
          </Button>
        </form>
      )}
    </Formik>
  );
}
