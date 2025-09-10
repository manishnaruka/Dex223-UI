import Alert from "@repo/ui/alert";
import clsx from "clsx";
import { Formik } from "formik";
import Image from "next/image";
import React from "react";
import { array, mixed, number, object } from "yup";

import { calculatePeriodInterestRateNum } from "@/app/[locale]/margin-trading/lending-order/[id]/helpers/calculatePeriodInterestRate";
import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import LendingOrderTokensSourceConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokensSourceConfig";
import PickAllowedTokenListsDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickAllowedTokenListsDialog";
import PickAllowedTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickAllowedTokensDialog";
import PickCollateralTokensDialog from "@/app/[locale]/margin-trading/lending-order/create/components/PickCollateralTokensDialog";
import {
  LendingOrderTradingTokens,
  TradingTokensInputMode,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import {
  FirstStepValues,
  SecondStepValues,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import { useCollateralTokensDialogOpenedStore } from "@/app/[locale]/margin-trading/stores/dialogStates";
import { OrderActionMode, OrderActionStep } from "@/app/[locale]/margin-trading/types";
import { InputSize } from "@/components/atoms/Input";
import TextField, { HelperText, InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { formatFloat } from "@/functions/formatFloat";
import addToast from "@/other/toast";

export default function SecondStep({
  mode,
  setStep,
  firstStepValues,
  secondStepValues,
  setSecondStepValues,
}: {
  mode: OrderActionMode;
  firstStepValues: FirstStepValues;
  secondStepValues: SecondStepValues;
  setSecondStepValues: (secondStep: SecondStepValues) => void;
  setStep: (step: OrderActionStep) => void;
}) {
  const { setIsOpen: setCollateralDialogOpened } = useCollateralTokensDialogOpenedStore();

  return (
    <Formik
      initialValues={secondStepValues}
      validationSchema={object({
        leverage: number().required().min(1).max(100),
        minimumBorrowingAmount: number()
          .required()
          .moreThan(
            0,
            `Must be greater than 0 ${firstStepValues.loanToken ? firstStepValues.loanToken.symbol : ""}`,
          ),
        collateralTokens: array()
          .min(1, "Pick at least one collateral token")
          .required("Pick at least one collateral token"),

        tradingTokens: object({
          allowedTokens: array().when("inputMode", {
            is: TradingTokensInputMode.MANUAL,
            then: (schema) =>
              schema
                .min(2, "Pick at least one more token for trading")
                .required("Pick at least one more token for trading"),
            otherwise: (schema) => schema.notRequired(),
          }),
          tradingTokensAutoListing: mixed().when("inputMode", {
            is: TradingTokensInputMode.AUTOLISTING,
            then: (s) => s.required("Auto-listing configuration is required"),
            otherwise: (s) => s.notRequired(),
          }),
        }),
      })}
      onSubmit={async (values, { validateForm }) => {
        // const errors = await validateForm(values);
        // console.log(errors);
        setSecondStepValues(values);
        setStep(OrderActionStep.THIRD);
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
            <LendingOrderDetailsRow
              title="You will receive for the entire period"
              value={
                firstStepValues.interestRatePerMonth &&
                firstStepValues.period.lendingOrderDeadline &&
                firstStepValues.loanAmount &&
                firstStepValues.loanToken?.symbol
                  ? (() => {
                      const loanAmount = parseFloat(firstStepValues.loanAmount);
                      const interestRate = calculatePeriodInterestRateNum(
                        +firstStepValues.interestRatePerMonth * 100,
                        Math.max(
                          0,
                          (new Date(firstStepValues.period.lendingOrderDeadline).getTime() -
                            Date.now()) /
                            1000,
                        ),
                      );

                      if (isNaN(loanAmount) || isNaN(interestRate)) return "—";

                      const interest = (loanAmount * interestRate) / 100;

                      return formatFloat(interest) + ` ${firstStepValues.loanToken.symbol}`;
                    })() // or 2 decimals if needed
                  : "—"
              }
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
            <div
              className={clsx(
                "bg-quaternary-bg rounded-3 min-h-[132px] p-2 items-start content-start flex flex-wrap gap-1",
                props.touched.collateralTokens &&
                  !!props.errors.collateralTokens &&
                  "border-red-light border",
              )}
            >
              {props.values.collateralTokens.length ? (
                <>
                  {props.values.collateralTokens.map((currency) => {
                    return (
                      <div
                        key={
                          currency.isToken
                            ? currency.address0
                            : `native-${currency.wrapped.address0}`
                        }
                        className="border pl-1 py-1 pr-3 flex items-center gap-2 rounded-2 border-primary-border"
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
                </>
              ) : (
                <span className="text-tertiary-text pl-3 pt-1">Tokens</span>
              )}
            </div>
            <HelperText
              error={props.touched.collateralTokens && (props.errors.collateralTokens as string)}
            />
          </div>
          <LendingOrderTokensSourceConfig
            values={props.values.tradingTokens}
            setValues={(values: LendingOrderTradingTokens) =>
              props.setFieldValue("tradingTokens", values)
            }
            manualError={
              !!props.touched.tradingTokens?.allowedTokens
                ? (props.errors.tradingTokens?.allowedTokens as string)
                : undefined
            }
            // error={undefined}
            autoListingError={
              !!props.touched.tradingTokens?.tradingTokensAutoListing
                ? (props.errors.tradingTokens?.tradingTokensAutoListing as string)
                : undefined
            }
          />

          <TextField
            isNumeric
            value={props.values.minimumBorrowingAmount}
            onChange={(e) => props.setFieldValue("minimumBorrowingAmount", +e.target.value)}
            label="Minimum borrowing amount"
            placeholder="Minimum borrowing amount"
            internalText={firstStepValues.loanToken?.symbol}
            tooltipText="Tooltip text"
            error={props.touched.minimumBorrowingAmount && props.errors.minimumBorrowingAmount}
            isWarning={Boolean(
              props.values.minimumBorrowingAmount &&
                +props.values.minimumBorrowingAmount < +firstStepValues.loanAmount * 0.2,
            )}
            isError={Boolean(
              props.values.minimumBorrowingAmount &&
                +props.values.minimumBorrowingAmount > +firstStepValues.loanAmount,
            )}
          />

          {props.values.minimumBorrowingAmount &&
          +props.values.minimumBorrowingAmount < +firstStepValues.loanAmount * 0.2 ? (
            <Alert
              text="Setting low values for minimum borrowing amount may result in smaller positions taking loans from your order. Make sure that liquidation collaterals are sufficient to cover the gas fees."
              type="warning"
            />
          ) : null}
          {props.values.minimumBorrowingAmount &&
          +props.values.minimumBorrowingAmount > +firstStepValues.loanAmount ? (
            <Alert
              text={`Minimum borrowing amount exceeds specified Available balance (${firstStepValues.loanAmount} ${firstStepValues.loanToken?.symbol}). Borrowers will not be able to take loans from this order.`}
              type="error"
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              colorScheme={ButtonColor.LIGHT_GREEN}
              onClick={() => setStep(OrderActionStep.FIRST)}
              size={ButtonSize.EXTRA_LARGE}
              fullWidth
            >
              Previous step
            </Button>
            <Button
              disabled={
                (props.values.minimumBorrowingAmount &&
                  +props.values.minimumBorrowingAmount > +firstStepValues.loanAmount) ||
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
              props.setFieldValue("tradingTokens", {
                ...props.values.tradingTokens,
                allowedTokens,
              })
            }
            restrictDisable={firstStepValues.loanToken}
          />
        </form>
      )}
    </Formik>
  );
}
