import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatEther, formatGwei } from "viem";

import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { GasOption, GasSettings } from "@/stores/factories/createGasPriceStore";

const gasOptionTitle: Record<GasOption, any> = {
  [GasOption.CHEAP]: "cheap",
  [GasOption.FAST]: "fast",
  [GasOption.CUSTOM]: "custom",
};

export const RemoveLiquidityGasSettings = ({
  gasPriceOption,
  gasPriceSettings,
  setGasPriceOption,
  setGasPriceSettings,
  estimatedGas,
  customGasLimit,
  setEstimatedGas,
  setCustomGasLimit,
  isAdvanced,
  setIsAdvanced,
  gasPrice,
}: {
  gasPriceOption: GasOption;
  gasPriceSettings: GasSettings;
  setGasPriceOption: (gasOption: GasOption) => void;
  setGasPriceSettings: (gasSettings: GasSettings) => void;
  estimatedGas: bigint;
  customGasLimit: bigint | undefined;
  setEstimatedGas: (estimatedGas: bigint) => void;
  setCustomGasLimit: (customGas: bigint | undefined) => void;
  isAdvanced: boolean;
  setIsAdvanced: (isAdvanced: boolean) => void;
  gasPrice: bigint | undefined;
}) => {
  const chainId = useCurrentChainId();
  const t = useTranslations("GasSettings");

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const gasToUse = customGasLimit || estimatedGas;

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 px-5 py-2 bg-tertiary-bg rounded-3 mb-5">
      {/* First row container with custom 66.67% width */}
      <div className="flex w-full md:w-2/3-custom gap-8 justify-between md:justify-start">
        <div className="flex flex-col">
          <div className="text-secondary-text flex items-center gap-1 text-14">
            {t("gas_price")}
          </div>
          <span className="text-secondary-text text-16">
            {gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI
          </span>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">{t("gas_limit")}</div>
          <span className="text-secondary-text text-16">{gasToUse.toString()}</span>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">{t("network_fee")}</div>
          <span>{`${gasPrice ? formatFloat(formatEther(gasPrice * gasToUse)) : ""} ${getChainSymbol(chainId)}`}</span>
        </div>
      </div>

      {/* Second row container with custom 33.33% width */}
      <div className="flex w-full md:w-1/3-custom items-center gap-2 mt-2 md:mt-0">
        <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border">
          {t(gasOptionTitle[gasPriceOption])}
        </span>
        <Button
          className="w-full md:w-auto h-8 md:h-auto"
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.EXTRA_SMALL}
          onClick={() => setIsOpenedFee(true)}
        >
          {t("edit")}
        </Button>
      </div>

      <NetworkFeeConfigDialog
        isAdvanced={isAdvanced}
        setIsAdvanced={setIsAdvanced}
        estimatedGas={estimatedGas}
        setEstimatedGas={setEstimatedGas}
        gasPriceSettings={gasPriceSettings}
        gasPriceOption={gasPriceOption}
        customGasLimit={customGasLimit}
        setCustomGasLimit={setCustomGasLimit}
        setGasPriceOption={setGasPriceOption}
        setGasPriceSettings={setGasPriceSettings}
        isOpen={isOpenedFee}
        setIsOpen={setIsOpenedFee}
      />
    </div>
  );
};
