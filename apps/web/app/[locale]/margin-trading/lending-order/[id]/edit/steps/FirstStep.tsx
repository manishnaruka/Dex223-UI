import { Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";

import { useEditOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/[id]/edit/stores/useEditOrderConfigStore";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderPeriodConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderPeriodConfig";
import LendingOrderTokenSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokenSelect";
import {
  LendingOrderPeriod,
  LendingOrderPeriodType,
  PerpetualPeriodType,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonSize } from "@/components/buttons/Button";
import useTokenBalances from "@/hooks/useTokenBalances";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

const fixedPeriodSchema = Yup.object({
  type: Yup.mixed<LendingOrderPeriodType>().oneOf([LendingOrderPeriodType.FIXED]).required(),
  lendingOrderDeadline: Yup.date()
    .typeError("Invalid date")
    .required("Deadline required")
    .test(
      "is-future",
      "Deadline must be in the future",
      (value) => !!value && value.getTime() > Date.now(),
    ),
  positionDuration: Yup.number()
    .typeError("Must be a number")
    .required("Duration required")
    .max(182, "Maximum duration is 182 days"),
}).noUnknown();

const perpetualPeriodSchema = Yup.object({
  type: Yup.mixed<LendingOrderPeriodType>().oneOf([LendingOrderPeriodType.PERPETUAL]).required(),
  borrowingPeriod: Yup.object({
    type: Yup.mixed<PerpetualPeriodType>()
      .oneOf([PerpetualPeriodType.DAYS, PerpetualPeriodType.MINUTES])
      .required(),

    borrowingPeriodInDays: Yup.number().when("type", {
      is: PerpetualPeriodType.DAYS,
      then: (s) => s.typeError("Must be a number").required("Days required"),
      otherwise: (s) => s.notRequired().nullable(), // <-- remove when not in use
    }),

    borrowingPeriodInMinutes: Yup.number().when("type", {
      is: PerpetualPeriodType.MINUTES,
      then: (s) => s.typeError("Must be a number").required("Minutes required"),
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
  interestRatePerMonth: Yup.number()
    .typeError("Interest rate must be a number")
    .required("Please provide interest rate per month")
    .min(0, "Interest rate cannot be negative")
    .max(9999, "Maximum interest rate is 9999%"),

  loanTokenStandard: Yup.string()
    .oneOf([Standard.ERC20, Standard.ERC223])
    .required("Token standard is required"),

  period: periodSchema, // your conditional schema from previous step
});

export default function FirstStep() {
  const { setStep } = useCreateOrderStepStore();

  const { firstStepValues, setFirstStepValues } = useEditOrderConfigStore();
  const {
    balance: { erc20Balance: token0Balance, erc223Balance: token1Balance },
    refetch: refetchBalance,
  } = useTokenBalances(firstStepValues.loanToken);

  const [isEnoughBalance, setIsEnoughBalance] = useState<boolean>(true);

  return (
    <Formik
      initialValues={{
        interestRatePerMonth: firstStepValues.interestRatePerMonth,
        period: firstStepValues.period,
        loanToken: firstStepValues.loanToken,
        loanAmount: firstStepValues.loanAmount,
        loanTokenStandard: firstStepValues.loanTokenStandard,
      }}
      enableReinitialize
      validationSchema={schema}
      onSubmit={async (values) => {
        setFirstStepValues(values);
        setStep(CreateOrderStep.SECOND);
      }}
    >
      {(props) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.handleSubmit();
          }}
        >
          <LendingOrderTokenSelect
            token={props.values.loanToken}
            setToken={async (token: Currency) => {
              await props.setFieldValue("loanToken", token);
            }}
            amount={props.values.loanAmount}
            setAmount={(loanAmount: string) => props.setFieldValue("loanAmount", loanAmount)}
            standard={props.values.loanTokenStandard}
            setStandard={async (standard: Standard) => {
              await props.setFieldValue("loanTokenStandard", standard);
            }}
          />
          <LendingOrderPeriodConfig
            setValues={(values: LendingOrderPeriod) => props.setFieldValue("period", values)}
            values={props.values.period}
            errors={props.touched.period ? props.errors.period : undefined}
          />
          <TextField
            isNumeric
            label="Interest rate per month"
            placeholder="Interest rate per month"
            internalText="%"
            error={
              props.touched.interestRatePerMonth && props.errors.interestRatePerMonth
                ? props.errors.interestRatePerMonth
                : undefined
            }
            value={props.values.interestRatePerMonth}
            onChange={(e) => props.setFieldValue("interestRatePerMonth", e.target.value)}
          />

          <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col gap-2 mb-5 mt-4">
            <LendingOrderDetailsRow
              title={"Interest rate for the entire period"}
              value={<span className="text-red">TODO</span>}
            />
            <LendingOrderDetailsRow
              title={"You will receive for the entire period"}
              value={<span className="text-red">TODO</span>}
            />
          </div>
          {/*<pre>{JSON.stringify(props.touched, null, 2)}</pre>*/}
          {/*<pre>{JSON.stringify(props.errors, null, 2)}</pre>*/}
          {/*<pre>{JSON.stringify(props.values, null, 2)}</pre>*/}

          <Button
            disabled={
              (Object.keys(props.touched).length > 0 && Object.keys(props.errors).length > 0) ||
              !isEnoughBalance
            }
            type="submit"
            size={ButtonSize.EXTRA_LARGE}
            fullWidth
          >
            Next step
          </Button>
        </form>
      )}
    </Formik>
  );
}
