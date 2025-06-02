import Alert from "@repo/ui/alert";
import React from "react";

import TextField, { InputLabel } from "@/components/atoms/TextField";
import RadioButton from "@/components/buttons/RadioButton";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";

type PeriodType = "fixed" | "perpetual";
enum PerpetualPeriodType {
  DAYS,
  SECONDS,
}

const labelsMap: Record<PeriodType, string> = {
  fixed: "Fixed period",
  perpetual: "Perpetual period",
};

const periods: PeriodType[] = ["fixed", "perpetual"];

export default function LendingOrderPeriodConfig() {
  const [period, setPeriod] = React.useState<PeriodType>("fixed");
  const [perpetualPeriodType, setPerpetualPeriodType] = React.useState<PerpetualPeriodType>(
    PerpetualPeriodType.DAYS,
  );

  return (
    <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
      <InputLabel label="Period type" />
      <div className="grid grid-cols-2 gap-2 mb-4 mt-1">
        {periods.map((_period) => (
          <RadioButton
            key={_period}
            isActive={_period === period}
            onClick={() => {
              setPeriod(_period);
            }}
          >
            {labelsMap[_period]}
          </RadioButton>
        ))}
      </div>
      {period === "fixed" && (
        <>
          <TextField
            label="Lending order deadline"
            tooltipText="tooltip text"
            placeholder="DD.MM.YYYY hh:mm:ss aa"
          />
          <TextField
            label="Margin positions duration"
            placeholder={"0"}
            tooltipText="tooltip text"
          />
        </>
      )}
      {period === "perpetual" && (
        <div className="w-full">
          <Tabs
            activeTab={perpetualPeriodType}
            setActiveTab={setPerpetualPeriodType}
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
