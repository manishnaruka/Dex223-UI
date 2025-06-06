import Alert from "@repo/ui/alert";
import React from "react";

import {
  LendingOrderPeriod,
  LendingOrderPeriodType,
  PerpetualPeriodType,
} from "@/app/[locale]/margin-trading/lending-order/create/steps/types";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import RadioButton from "@/components/buttons/RadioButton";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";

const labelsMap: Record<LendingOrderPeriodType, string> = {
  [LendingOrderPeriodType.FIXED]: "Fixed period",
  [LendingOrderPeriodType.PERPETUAL]: "Perpetual period",
};

export default function LendingOrderPeriodConfig({
  values,
  setValues,
}: {
  values: LendingOrderPeriod;
  setValues: (values: LendingOrderPeriod) => void;
}) {
  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
      <InputLabel label="Period type" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {[LendingOrderPeriodType.FIXED, LendingOrderPeriodType.PERPETUAL].map((_period) => (
          <RadioButton
            type="button"
            key={_period}
            isActive={_period === values.type}
            onClick={() => {
              setValues({ ...values, type: _period });
            }}
          >
            {labelsMap[_period]}
          </RadioButton>
        ))}
      </div>
      {values.type === LendingOrderPeriodType.FIXED && (
        <>
          <TextField
            label="Lending order deadline"
            tooltipText="tooltip text"
            placeholder="DD.MM.YYYY hh:mm:ss aa"
            value={values.lendingOrderDeadline}
            onChange={(e) =>
              setValues({
                ...values,
                lendingOrderDeadline: e.target.value,
              })
            }
          />
          <TextField
            label="Margin positions duration"
            placeholder={"0"}
            tooltipText="tooltip text"
            value={values.positionDuration}
            onChange={(e) =>
              setValues({
                ...values,
                positionDuration: e.target.value,
              })
            }
          />
        </>
      )}
      {values.type === LendingOrderPeriodType.PERPETUAL && (
        <div className="w-full">
          <Tabs
            activeTab={values.borrowingPeriod.type}
            setActiveTab={(value: PerpetualPeriodType) =>
              setValues({
                ...values,
                borrowingPeriod: { ...values.borrowingPeriod, type: value },
              })
            }
            fullWidth
            colorScheme={"secondary"}
          >
            <Tab title="Days">
              <div className="mt-4">
                <TextField
                  label="Borrowing period"
                  tooltipText="tooltip text"
                  placeholder="0"
                  internalText={"days"}
                  value={values.borrowingPeriod.borrowingPeriodInDays}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      borrowingPeriod: {
                        ...values.borrowingPeriod,
                        borrowingPeriodInDays: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </Tab>
            <Tab title="Seconds">
              <div className="mt-4">
                <TextField
                  label="Borrowing period"
                  tooltipText="tooltip text"
                  placeholder="0"
                  internalText={"seconds"}
                  helperText={"450000 seconds = 5.2 days"}
                  value={values.borrowingPeriod.borrowingPeriodInSeconds}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      borrowingPeriod: {
                        ...values.borrowingPeriod,
                        borrowingPeriodInSeconds: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </Tab>
          </Tabs>
          <div className="mt-4">
            <Alert
              text="The countdown for each borrower starts when they borrow your assets, not when the lending order is created"
              type="info"
            />
          </div>
        </div>
      )}
    </div>
  );
}
