import Alert from "@repo/ui/alert";
import Checkbox from "@repo/ui/checkbox";
import clsx from "clsx";
import { Formik } from "formik";
import Image from "next/image";
import React from "react";
import { number, object } from "yup";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderTokensSourceConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokensSourceConfig";
import PickAllowedTokenListsDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickAllowedTokenListsDialog";
import PickAllowedTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickAllowedTokensDialog";
import PickCollateralTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickCollateralTokensDialog";
import {
  LendingOrderPeriod,
  LendingOrderTradingTokens,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import { useAllowedTokenListsDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useAllowedTokenListsDialogOpened";
import { useAllowedTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useAllowedTokensDialogOpened";
import { useCollateralTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCollateralTokensDialogOpened";
import { useCreateOrderConfigStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import { values } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { InputSize } from "@/components/atoms/Input";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";

export default function SecondStep() {
  const { setStep } = useCreateOrderStepStore();

  const { firstStepValues, secondStepValues, setSecondStepValues } = useCreateOrderConfigStore();
  const { setIsOpen: setCollateralDialogOpened } = useCollateralTokensDialogOpenedStore();

  return (
    <Formik
      initialValues={secondStepValues}
      validationSchema={object({
        leverage: number().required().min(1).max(100),
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
            isNumeric
            max={100}
            min={1}
            decimalScale={4}
            label="Leverage"
            placeholder="Leverage"
            internalText="x"
            tooltipText={"Tooltip text"}
            value={props.values.leverage}
            error={props.errors.leverage}
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

          <div className="mb-5 p-5 bg-tertiary-bg rounded-3">
            <div className="flex justify-between items-center">
              <InputLabel
                inputSize={InputSize.LARGE}
                label="Accepted collateral tokens"
                tooltipText="Tooltip text"
                noMargin
              />
              <IconButton
                onClick={() => {
                  setCollateralDialogOpened(true);
                }}
                buttonSize={32}
                iconSize={20}
                iconName={"edit"}
              />
            </div>
            <div className="mb-3 bg-secondary-bg rounded-3 min-h-[132px] p-2 items-start content-start flex flex-wrap gap-1">
              {props.values.collateralTokens.map((currency) => {
                return (
                  <div
                    key={
                      currency.isToken ? currency.address0 : `native-${currency.wrapped.address0}`
                    }
                    className="border pl-1 py-1 pr-3 flex items-center gap-2 rounded-1 border-secondary-border"
                  >
                    <Image
                      className="flex-shrink-0"
                      width={24}
                      height={24}
                      src={currency.logoURI || "/images/tokens/placeholder.svg"}
                      alt={""}
                    />
                    <span>{currency.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="py-2">
              <Checkbox
                label="Allow ERC-223 trading"
                tooltipText="Tooltip text"
                labelClassName="text-secondary-text"
                checked={props.values.includeERC223Collateral}
                handleChange={() =>
                  props.setFieldValue(
                    "includeERC223Collateral",
                    !props.values.includeERC223Collateral,
                  )
                }
                id={"allow-223-collateral"}
              />
            </div>
          </div>
          <LendingOrderTokensSourceConfig
            values={props.values.tradingTokens}
            setValues={(values: LendingOrderTradingTokens) =>
              props.setFieldValue("tradingTokens", values)
            }
          />
          <TextField
            isNumeric
            value={props.values.minimumBorrowingAmount}
            onChange={(e) => props.setFieldValue("minimumBorrowingAmount", +e.target.value)}
            label="Minimum borrowing amount"
            placeholder="Minimum borrowing amount"
            internalText="USDT"
            tooltipText="Tooltip text"
            error={props.touched.minimumBorrowingAmount && props.errors.minimumBorrowingAmount}
            isWarning={Boolean(
              props.values.minimumBorrowingAmount &&
                +props.values.minimumBorrowingAmount < +firstStepValues.loanAmount * 0.2,
            )}
            isError={Boolean(
              props.values.minimumBorrowingAmount &&
                props.values.minimumBorrowingAmount > firstStepValues.loanAmount,
            )}
          />

          {props.values.minimumBorrowingAmount &&
            +props.values.minimumBorrowingAmount < +firstStepValues.loanAmount * 0.2 && (
              <Alert
                text="Setting low values for minimum borrowing amount may result in smaller positions taking loans from your order. Make sure that liquidation collaterals are sufficient to cover the gas fees."
                type="warning"
              />
            )}
          {props.values.minimumBorrowingAmount &&
            props.values.minimumBorrowingAmount > firstStepValues.loanAmount && (
              <Alert
                text="Minimum borrowing amount exceeds specified order balance. Borrowers will not be able to take loans from this order."
                type="error"
              />
            )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              colorScheme={ButtonColor.LIGHT_GREEN}
              onClick={() => setStep(CreateOrderStep.FIRST)}
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
            >
              Previous step
            </Button>
            <Button
              disabled={
                (props.values.minimumBorrowingAmount &&
                  props.values.minimumBorrowingAmount > firstStepValues.loanAmount) ||
                (Object.keys(props.touched).length > 0 && Object.keys(props.errors).length > 0)
              }
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
              type="submit"
            >
              Next step
            </Button>
          </div>

          <PickAllowedTokenListsDialog
            setAutoListing={(tradingTokensAutoListing) =>
              props.setFieldValue("tradingTokens", {
                ...props.values.tradingTokens,
                tradingTokensAutoListing,
              })
            }
          />
          <PickCollateralTokensDialog
            collateralTokens={props.values.collateralTokens}
            handlePick={(collateralTokens) =>
              props.setFieldValue("collateralTokens", collateralTokens)
            }
          />
          <PickAllowedTokensDialog
            allowedTokens={props.values.tradingTokens.allowedTokens}
            handlePick={(allowedTokens) =>
              props.setFieldValue("tradingTokens", { ...props.values.tradingTokens, allowedTokens })
            }
          />
        </form>
      )}
    </Formik>
  );
}
