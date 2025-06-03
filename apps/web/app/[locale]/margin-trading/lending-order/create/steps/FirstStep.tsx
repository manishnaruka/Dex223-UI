import { Formik } from "formik";
import React from "react";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderPeriodConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderPeriodConfig";
import LendingOrderTokenSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokenSelect";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonSize } from "@/components/buttons/Button";

export default function FirstStep() {
  const { setStep } = useCreateOrderStepStore();

  const { firstStepValues, setFirstStepValues } = useCreateOrderConfigStore();

  return (
    <Formik
      initialValues={{
        interestRatePerMonth: firstStepValues.interestRatePerMonth,
      }}
      onSubmit={async (values) => {
        setFirstStepValues(values);
        setStep(CreateOrderStep.SECOND);
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <LendingOrderTokenSelect />
          <LendingOrderPeriodConfig />
          <TextField
            label="Interest rate per month"
            placeholder="Interest rate per month"
            internalText="%"
            value={props.values.interestRatePerMonth}
            onChange={(e) => props.setFieldValue("interestRatePerMonth", e.target.value)}
          />

          <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col gap-2 mb-5">
            <LendingOrderDetailsRow title={"Interest rate for the entire period"} value={"—"} />
            <LendingOrderDetailsRow title={"You will receive for the entire period"} value={"—"} />
          </div>
          <Button type="submit" size={ButtonSize.EXTRA_LARGE} fullWidth>
            Next step
          </Button>
        </form>
      )}
    </Formik>
  );
}
