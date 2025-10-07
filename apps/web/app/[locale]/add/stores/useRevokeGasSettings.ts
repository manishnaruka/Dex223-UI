import { useMemo } from "react";

import { getFormattedGasPrice, getGasSettings } from "@/functions/gasSettings";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useGlobalFees } from "@/shared/hooks/useGlobalFees";
import { createGasLimitStore } from "@/stores/factories/createGasLimitStore";
import { createGasPriceStore } from "@/stores/factories/createGasPriceStore";
import { createGasModeStore } from "@/stores/factories/createGasSettingsStore";

export const useRevokeGasPriceStore = createGasPriceStore();
export const useRevokeGasLimitStore = createGasLimitStore();
export const useWithdrawGasLimitStore = createGasLimitStore();
export const useRevokeGasModeStore = createGasModeStore();

// mb better move this hooks to separete file
export const useRevokeGasPrice = () => {
  const { baseFee, gasPrice, priorityFee } = useGlobalFees();
  const chainId = useCurrentChainId();
  const { gasPriceOption, gasPriceSettings } = useRevokeGasPriceStore();

  const formattedGasPrice = useMemo(() => {
    return getFormattedGasPrice({
      baseFee,
      chainId,
      gasPrice,
      gasPriceOption,
      gasPriceSettings,
    });
  }, [baseFee, chainId, gasPrice, gasPriceOption, gasPriceSettings]);
  return formattedGasPrice;
};

export const useRevokeGasSettings = () => {
  const chainId = useCurrentChainId();
  const { baseFee, gasPrice, priorityFee } = useGlobalFees();
  const { gasPriceOption, gasPriceSettings } = useRevokeGasPriceStore();
  const { customGasLimit } = useRevokeGasLimitStore();

  const gasSettings = useMemo(() => {
    return getGasSettings({
      baseFee,
      chainId,
      gasPrice,
      priorityFee,
      gasPriceOption,
      gasPriceSettings,
    });
  }, [baseFee, chainId, gasPrice, priorityFee, gasPriceOption, gasPriceSettings]);

  return { gasSettings, gasModel: gasPriceSettings.model, customGasLimit };
};

export const useWithdrawGasSettings = () => {
  const chainId = useCurrentChainId();
  const { baseFee, gasPrice, priorityFee } = useGlobalFees();
  const { gasPriceOption, gasPriceSettings } = useRevokeGasPriceStore();
  const { customGasLimit } = useWithdrawGasLimitStore();

  const gasSettings = useMemo(() => {
    return getGasSettings({
      baseFee,
      chainId,
      gasPrice,
      priorityFee,
      gasPriceOption,
      gasPriceSettings,
    });
  }, [baseFee, chainId, gasPrice, priorityFee, gasPriceOption, gasPriceSettings]);

  return { gasSettings, gasModel: gasPriceSettings.model, customGasLimit };
};
