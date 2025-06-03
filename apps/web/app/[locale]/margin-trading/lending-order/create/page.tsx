"use client";

import clsx from "clsx";
import React, { useCallback } from "react";

import ReviewLendingOrderDialog from "@/app/[locale]/margin-trading/lending-order/create/components/ReviewLendingOrderDialog";
import FirstStep from "@/app/[locale]/margin-trading/lending-order/create/steps/FirstStep";
import SecondStep from "@/app/[locale]/margin-trading/lending-order/create/steps/SecondStep";
import ThirdStep from "@/app/[locale]/margin-trading/lending-order/create/steps/ThirdStep";
import { useConfirmCreateOrderDialogStore } from "@/app/[locale]/margin-trading/lending-order/create/stores/useConfirmCreateOrderDialogOpened";
import {
  CreateOrderStep,
  useCreateOrderStepStore,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderStepStore";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";

const stepsLabels: Record<CreateOrderStep, string> = {
  [CreateOrderStep.FIRST]: "Loan",
  [CreateOrderStep.SECOND]: "Parameters",
  [CreateOrderStep.THIRD]: "Liquidation",
};

export default function CreateLendingOrderPage() {
  const { step } = useCreateOrderStepStore((state) => ({ step: state.step }));

  const { isOpen, setIsOpen } = useConfirmCreateOrderDialogStore();

  const renderSteps = useCallback(() => {
    switch (step) {
      case CreateOrderStep.FIRST:
        return <FirstStep />;
      case CreateOrderStep.SECOND:
        return <SecondStep />;
      case CreateOrderStep.THIRD:
        return <ThirdStep />;
    }
  }, [step]);

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
            {[CreateOrderStep.FIRST, CreateOrderStep.SECOND, CreateOrderStep.THIRD].map((_step) => {
              return (
                <React.Fragment key={_step}>
                  <div className="flex items-center gap-2" key={_step}>
                    <span
                      className={clsx(
                        "w-8 h-8  rounded-full text-18 flex items-center justify-center border  ",
                        _step === step
                          ? "border-green bg-green-bg"
                          : "border-quaternary-bg bg-quaternary-bg text-tertiary-text",
                      )}
                    >
                      {_step + 1}
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
                  {_step !== CreateOrderStep.THIRD && (
                    <div className="h-1 flex-grow bg-quaternary-bg" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {renderSteps()}
        </div>
      </div>

      <ReviewLendingOrderDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
