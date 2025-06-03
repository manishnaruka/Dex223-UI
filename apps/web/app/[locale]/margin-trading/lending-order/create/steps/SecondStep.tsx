import clsx from "clsx";
import { Formik } from "formik";
import Image from "next/image";
import React from "react";
import { number, object } from "yup";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderTokensSourceConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokensSourceConfig";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import { InputSize } from "@/components/atoms/Input";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";

export default function SecondStep() {
  const { setStep } = useCreateOrderStepStore();

  const { secondStepValues, setSecondStepValues } = useCreateOrderConfigStore();

  return (
    <Formik
      initialValues={secondStepValues}
      validationSchema={object({
        leverage: number().required().min(1),
        minimumBorrowingAmount: number().required().min(1),
      })}
      onSubmit={async (values, { validateForm }) => {
        // const errors = await validateForm(values);
        // console.log(errors);
        setSecondStepValues(values);
        setStep(CreateOrderStep.THIRD);
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <TextField
            label="Leverage"
            placeholder="Leverage"
            internalText="x"
            tooltipText={"Tooltip text"}
            value={props.values.leverage}
            onChange={(e) => props.setFieldValue("leverage", +e.target.value)}
          />
          <div className="mb-4">
            <input
              min={1}
              max={100}
              value={props.values.leverage}
              onChange={(e) => props.setFieldValue("leverage", +e.target.value)}
              step={1}
              type="range"
              className="w-full mb-1.5"
              style={{
                backgroundImage: `linear-gradient(to right, #7DA491 0%, #7DA491 ${props.values.leverage}%, #0F0F0F ${props.values.leverage}%, #0F0F0F 100%)`,
              }}
            />
            <div className="z-10 relative flex justify-between text-12 text-secondary-text ">
              {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((_, i) => (
                <span
                  key={_}
                  className={clsx(
                    "min-w-[28px] flex justify-center relative before:h-3 before:w-0.5 before:absolute before:left-1/2 before:-top-[16px] before:-translate-x-1/2 before:pointer-events-none",
                    props.values.leverage <= _
                      ? "before:bg-quaternary-bg"
                      : "before:bg-green-hover",
                  )}
                >
                  {_}x
                </span>
              ))}
            </div>
          </div>

          <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col gap-2 mb-5">
            <LendingOrderDetailsRow title={"LTV"} value={"7%"} />
            <LendingOrderDetailsRow
              title={"You will receive for the entire period"}
              value={"150 USDT"}
            />
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center">
              <InputLabel
                inputSize={InputSize.LARGE}
                label="Accepted collateral tokens"
                tooltipText="Tooltip text"
                noMargin
              />
              <IconButton buttonSize={32} iconSize={20} iconName={"edit"} />
            </div>
            <div className="bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start flex flex-wrap gap-1">
              {["ETH", "USDT", "DAI"].map((tokenName) => {
                return (
                  <div
                    key={tokenName}
                    className="border pl-1 py-1 pr-3 flex items-center gap-2 rounded-1 border-secondary-border"
                  >
                    <Image
                      width={24}
                      height={24}
                      src={"/images/tokens/placeholder.svg"}
                      alt={tokenName}
                    />
                    <span>{tokenName}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <LendingOrderTokensSourceConfig />
          <TextField
            value={props.values.minimumBorrowingAmount}
            onChange={(e) => props.setFieldValue("minimumBorrowingAmount", +e.target.value)}
            label="Minimum borrowing amount"
            placeholder="Minimum borrowing amount"
            internalText="USDT"
            tooltipText="Tooltip text"
            error={props.errors.minimumBorrowingAmount}
          />
          <pre>{JSON.stringify(props.errors, null, 2)}</pre>

          <div className="grid grid-cols-2 gap-2">
            <Button
              colorScheme={ButtonColor.LIGHT_GREEN}
              onClick={() => setStep(CreateOrderStep.FIRST)}
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
            >
              Previous step
            </Button>
            <Button size={ButtonSize.EXTRA_LARGE} fullWidth type="submit">
              Next step
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
}
