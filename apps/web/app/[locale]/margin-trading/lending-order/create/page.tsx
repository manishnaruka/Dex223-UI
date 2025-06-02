"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { ReactNode, useEffect, useMemo } from "react";

import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";
import TokenInput from "@/components/common/TokenInput";
import { Standard } from "@/sdk_bi/standard";

type CreateLendingOrderStep = 1 | 2 | 3;

const stepsLabels: Record<CreateLendingOrderStep, string> = {
  1: "Loan",
  2: "Parameters",
  3: "Liquidation",
};

export function LendingOrderDetailsRow({
  title,
  value,
}: {
  title: string;
  value: string | ReactNode;
  tooltipText?: string;
}) {
  return (
    <div className="flex justify-between items-center text-14 ">
      <div className="flex gap-1 items-center text-secondary-text">{title}</div>
      <span>{value}</span>
    </div>
  );
}

export default function CreateLendingOrderPage() {
  const [step, setStep] = React.useState<CreateLendingOrderStep>(1);

  const [leverage, setLeverage] = React.useState<number>(1);

  const [sliderValue, setSliderValue] = React.useState<number>(1);

  return (
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
            <div>
              <InputLabel label="Loan amount" tooltipText="Tooltip text" />
              <TokenInput
                handleClick={() => {}}
                token={undefined}
                value={"0"}
                onInputChange={() => {}}
                balance0={"0"}
                balance1={"0"}
                label={"No pabel"}
                standard={Standard.ERC223}
                otherStandard={Standard.ERC20}
                setStandard={() => {}}
                setOtherStandard={() => {}}
              />
            </div>
            <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
              <InputLabel label="Period type" />
              <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
                <RadioButton isActive={false} onClick={() => {}}>
                  Fixed period
                </RadioButton>
                <RadioButton isActive={false} onClick={() => {}}>
                  Perpetual period
                </RadioButton>
              </div>
              <TextField label="Lending order deadline" tooltipText="tooltip text" />
              <TextField label="Margin positions duration" tooltipText="tooltip text" />
            </div>
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
              <InputLabel label="Accepted collateral tokens" tooltipText="Tooltip text" />
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

            <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
              <InputLabel label="Token source type" />
              <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
                <RadioButton isActive={false} onClick={() => {}}>
                  Tokens
                </RadioButton>
                <RadioButton isActive={false} onClick={() => {}}>
                  Listing contract
                </RadioButton>
              </div>

              <InputLabel label="Tokens allowed for trading" tooltipText="Tooltip text" />
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
            <TextField
              label="Order currency limit"
              placeholder="Order currency limit"
              tooltipText="Tooltip text"
              isNumeric={true}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                colorScheme={ButtonColor.LIGHT_GREEN}
                onClick={() => setStep(2)}
                size={ButtonSize.EXTRA_LARGE}
                fullWidth
              >
                Previous step
              </Button>
              <Button
                size={ButtonSize.EXTRA_LARGE}
                fullWidth
                onClick={() => alert("Creating lending order")}
              >
                Create lending order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
