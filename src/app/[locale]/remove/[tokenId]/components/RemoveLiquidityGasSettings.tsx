import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatEther, formatGwei } from "viem";

import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { GasOption } from "@/stores/factories/createGasPriceStore";

import {
  useRemoveLiquidityGasLimitStore,
  useRemoveLiquidityGasModeStore,
  useRemoveLiquidityGasPrice,
  useRemoveLiquidityGasPriceStore,
} from "../stores/useRemoveLiquidityGasSettings";

const gasOptionTitle: Record<GasOption, any> = {
  [GasOption.CHEAP]: "cheap",
  [GasOption.FAST]: "fast",
  [GasOption.CUSTOM]: "custom",
};

export const RemoveLiquidityGasSettings = () => {
  const chainId = useCurrentChainId();
  const t = useTranslations("GasSettings");

  const [isOpenedFee, setIsOpenedFee] = useState(false);

  const { gasPriceOption, gasPriceSettings, setGasPriceOption, setGasPriceSettings } =
    useRemoveLiquidityGasPriceStore();
  const { estimatedGas, customGasLimit, setEstimatedGas, setCustomGasLimit } =
    useRemoveLiquidityGasLimitStore();

  const gasToUse = customGasLimit || estimatedGas;
  const { isAdvanced, setIsAdvanced } = useRemoveLiquidityGasModeStore();

  const gasPrice = useRemoveLiquidityGasPrice();

  return (
    <div className="flex flex-col items-center gap-2 md:flex-row px-5 py-2 bg-tertiary-bg rounded-3 mb-5">
      <div className="flex w-full gap-8">
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
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border">
          {t(gasOptionTitle[gasPriceOption])}
        </span>
        <Button
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
