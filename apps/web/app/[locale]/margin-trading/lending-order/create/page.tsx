"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { ReactNode, useEffect, useMemo } from "react";
import { formatEther, formatGwei } from "viem";

import LendingOrderPeriodConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderPeriodConfig";
import LendingOrderTokenSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokenSelect";
import LendingOrderTokensSourceConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderTokensSourceConfig";
import LiquidationFeeConfig from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationFeeConfig";
import LiquidationInitiatorSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationInitiatorSelect";
import LiquidationOracleSelect from "@/app/[locale]/margin-trading/lending-order/create/components/LiquidationOracleSelect";
import ReviewLendingOrderDialog from "@/app/[locale]/margin-trading/lending-order/create/components/ReviewLendingOrderDialog";
import { InputSize } from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Svg from "@/components/atoms/Svg";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";
import TokenInput from "@/components/common/TokenInput";
import { formatFloat } from "@/functions/formatFloat";
import { Standard } from "@/sdk_bi/standard";

import LendingOrderDetailsRow from "./components/LendingOrderDetailsRow";

type CreateLendingOrderStep = 1 | 2 | 3;

const stepsLabels: Record<CreateLendingOrderStep, string> = {
  1: "Loan",
  2: "Parameters",
  3: "Liquidation",
};

export default function CreateLendingOrderPage() {
  const [step, setStep] = React.useState<CreateLendingOrderStep>(1);

  const [leverage, setLeverage] = React.useState<number>(1);

  const [sliderValue, setSliderValue] = React.useState<number>(1);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div className="rounded-3 bg-primary-bg max-w-[600px] mx-auto my-10">
        <div className="py-1.5 px-6 flex justify-between items-center">
          <IconButton iconName="back" />
          <h1 className="text-20 font-bold">New lending order</h1>
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            active={false}
            iconName="recent-transactions"
            onClick={() => {}}
          />
        </div>
        <div className="pb-10 px-10">
          <div className="flex justify-between mb-5 items-center gap-5">
            {([1, 2, 3] as CreateLendingOrderStep[]).map((_step) => {
              return (
                <>
                  <div className="flex items-center gap-2" key={_step}>
                    <span
                      className={clsx(
                        "w-8 h-8  rounded-full text-18 flex items-center justify-center border  ",
                        _step === step
                          ? "border-green bg-green-bg"
                          : "border-quaternary-bg bg-quaternary-bg text-tertiary-text",
                      )}
                    >
                      {_step}
                    </span>
                    <span
                      className={clsx(
                        "text-18",
                        _step === step ? "text-primary-text" : "text-tertiary-text",
                      )}
                    >
                      {stepsLabels[_step]}
                    </span>
                  </div>
                  {_step !== 3 && <div className="h-1 flex-grow bg-quaternary-bg" />}
                </>
              );
            })}
          </div>
          {step === 1 && (
            <>
              <LendingOrderTokenSelect />
              <LendingOrderPeriodConfig />
              <TextField
                label="Interest rate per month"
                placeholder="Interest rate per month"
                internalText="%"
              />

              <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col gap-2 mb-5">
                <LendingOrderDetailsRow title={"Interest rate for the entire period"} value={"—"} />
                <LendingOrderDetailsRow
                  title={"You will receive for the entire period"}
                  value={"—"}
                />
              </div>
              <Button onClick={() => setStep(2)} size={ButtonSize.EXTRA_LARGE} fullWidth>
                Next step
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <TextField
                label="Leverage"
                placeholder="Leverage"
                internalText="x"
                tooltipText={"Tooltip text"}
                value={leverage}
                onChange={(e) => setLeverage(+e.target.value)}
              />
              <div className="mb-4">
                <input
                  min={1}
                  max={100}
                  value={leverage}
                  onChange={(e) => {
                    setLeverage(+e.target.value);
                  }}
                  step={1}
                  type="range"
                  className="w-full mb-1.5"
                  style={{
                    backgroundImage: `linear-gradient(to right, #7DA491 0%, #7DA491 ${leverage}%, #0F0F0F ${leverage}%, #0F0F0F 100%)`,
                  }}
                />
                <div className="z-10 relative flex justify-between text-12 text-secondary-text ">
                  {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((_, i) => (
                    <span
                      key={_}
                      className={clsx(
                        "min-w-[28px] flex justify-center relative before:h-3 before:w-0.5 before:absolute before:left-1/2 before:-top-[16px] before:-translate-x-1/2 before:pointer-events-none",
                        leverage <= _ ? "before:bg-quaternary-bg" : "before:bg-green-hover",
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
                label="Minimum borrowing amount"
                placeholder="Minimum borrowing amount"
                internalText="USDT"
                tooltipText="Tooltip text"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  colorScheme={ButtonColor.LIGHT_GREEN}
                  onClick={() => setStep(1)}
                  size={ButtonSize.EXTRA_LARGE}
                  fullWidth
                >
                  Previous step
                </Button>
                <Button size={ButtonSize.EXTRA_LARGE} fullWidth onClick={() => setStep(3)}>
                  Next step
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
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
                  onClick={() => setStep(2)}
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
          )}
        </div>
      </div>

      <ReviewLendingOrderDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
