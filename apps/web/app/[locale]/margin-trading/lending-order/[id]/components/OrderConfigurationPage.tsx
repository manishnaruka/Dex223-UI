import clsx from "clsx";
import React, { useCallback } from "react";

import { useLendingOrderRecentTransactionsStore } from "@/app/[locale]/margin-trading/lending-order/create/hooks/useLendingOrderRecentTransactionsStore";
import FirstStep from "@/app/[locale]/margin-trading/lending-order/create/steps/FirstStep";
import SecondStep from "@/app/[locale]/margin-trading/lending-order/create/steps/SecondStep";
import ThirdStep from "@/app/[locale]/margin-trading/lending-order/create/steps/ThirdStep";
import {
  FirstStepValues,
  SecondStepValues,
  ThirdStepValues,
} from "@/app/[locale]/margin-trading/lending-order/create/stores/useCreateOrderConfigStore";
import { OrderActionMode, OrderActionStep } from "@/app/[locale]/margin-trading/types";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";

type Props = {
  step: OrderActionStep;
  setStep: (step: OrderActionStep) => void;
  firstStepValues: FirstStepValues;
  setFirstStepValues: (firstStepValues: FirstStepValues) => void;
  secondStepValues: SecondStepValues;
  setSecondStepValues: (secondStepValues: SecondStepValues) => void;
  thirdStepValues: ThirdStepValues;
  setThirdStepValues: (thirdStepValues: ThirdStepValues) => void;
  openPreviewDialog: () => void;
  mode: OrderActionMode;
};

const stepsLabels: Record<OrderActionStep, string> = {
  [OrderActionStep.FIRST]: "Loan",
  [OrderActionStep.SECOND]: "Parameters",
  [OrderActionStep.THIRD]: "Liquidation",
};

export default function OrderConfigurationPage({
  mode,

  step,
  setStep,

  firstStepValues,
  secondStepValues,
  thirdStepValues,

  setSecondStepValues,
  setFirstStepValues,
  setThirdStepValues,

  openPreviewDialog,
}: Props) {
  useRecentTransactionTracking();

  const renderSteps = useCallback(() => {
    switch (step) {
      case OrderActionStep.FIRST:
        return (
          <FirstStep
            mode={mode}
            firstStepValues={firstStepValues}
            setStep={setStep}
            setFirstStepValues={setFirstStepValues}
          />
        );
      case OrderActionStep.SECOND:
        return (
          <SecondStep
            mode={mode}
            firstStepValues={firstStepValues}
            setStep={setStep}
            secondStepValues={secondStepValues}
            setSecondStepValues={setSecondStepValues}
          />
        );
      case OrderActionStep.THIRD:
        return (
          <ThirdStep
            mode={mode}
            setStep={setStep}
            thirdStepValues={thirdStepValues}
            setThirdStepValues={setThirdStepValues}
            openPreviewDialog={openPreviewDialog}
          />
        );
    }
  }, [
    firstStepValues,
    mode,
    openPreviewDialog,
    secondStepValues,
    setFirstStepValues,
    setSecondStepValues,
    setStep,
    setThirdStepValues,
    step,
    thirdStepValues,
  ]);

  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useLendingOrderRecentTransactionsStore();

  return (
    <>
      <div className="rounded-3 bg-primary-bg w-[600px] mx-auto">
        <div className="py-1.5 px-6 flex justify-between items-center">
          <IconButton iconName="back" />
          <h1 className="text-20 font-bold">
            {mode === OrderActionMode.CREATE ? "New lending order" : "Edit lending order"}
          </h1>
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            active={showRecentTransactions}
            iconName="recent-transactions"
            onClick={() => setShowRecentTransactions(!showRecentTransactions)}
          />
        </div>
        <div className="pb-10 px-10">
          <div className="flex justify-between mb-5 items-center gap-5">
            {[OrderActionStep.FIRST, OrderActionStep.SECOND, OrderActionStep.THIRD].map((_step) => {
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
                  {_step !== OrderActionStep.THIRD && (
                    <div className="h-1 flex-grow bg-quaternary-bg" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {renderSteps()}
        </div>
      </div>
    </>
  );
}
