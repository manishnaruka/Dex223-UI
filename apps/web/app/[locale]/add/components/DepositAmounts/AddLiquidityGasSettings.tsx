import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { formatEther, formatGwei } from "viem";

import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/stores/useAddLiquidityAmountsStore";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { Currency } from "@/sdk_bi/entities/currency";
import { CurrencyAmount } from "@/sdk_bi/entities/fractions/currencyAmount";
import { EstimatedGasId, useEstimatedGasStoreById } from "@/stores/useEstimatedGasStore";

import { useLiquidityApprove } from "../../hooks/useLiquidityApprove";
import {
  useAddLiquidityGasLimitStore,
  useAddLiquidityGasModeStore,
  useAddLiquidityGasPrice,
  useAddLiquidityGasPriceStore,
} from "../../stores/useAddLiquidityGasSettings";

export const AddLiquidityGasSettings = ({
  isFormDisabled,
  parsedAmounts,
}: {
  isFormDisabled: boolean;
  parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined };
}) => {
  //
  const chainId = useCurrentChainId();
  const [isOpenedFee, setIsOpenedFee] = useState(false);

  const {
    gasPriceOption,
    gasPriceSettings,
    setGasPriceOption,
    setGasPriceSettings,
    updateDefaultState,
  } = useAddLiquidityGasPriceStore();
  const { estimatedGas, customGasLimit, setEstimatedGas, setCustomGasLimit } =
    useAddLiquidityGasLimitStore();

  useEffect(() => {
    updateDefaultState(chainId);
  }, [chainId, updateDefaultState]);

  const { isAdvanced, setIsAdvanced } = useAddLiquidityGasModeStore();

  const gasPrice = useAddLiquidityGasPrice();

  //
  const t = useTranslations("Liquidity");
  const tGas = useTranslations("GasSettings");
  const { typedValue } = useLiquidityAmountsStore();

  const { approveTotalGasLimit, approveTransactionsCount } = useLiquidityApprove(parsedAmounts);
  const estimatedMintGas = useEstimatedGasStoreById(EstimatedGasId.mint);

  const totalGasLimit = useMemo(() => {
    return approveTotalGasLimit + estimatedMintGas;
  }, [approveTotalGasLimit, estimatedMintGas]);

  const disabledGasSettings = !typedValue;
  //

  return (
    <div className="flex flex-col items-center gap-2 md:flex-row px-5 py-2 bg-tertiary-bg rounded-3">
      <div className="flex w-full md:w-7/8 justify-between md:justify-start gap-8">
        <div className="flex flex-col">
          <div className="text-secondary-text flex items-center gap-1 text-14">
            {t("gas_price")}
            <Tooltip iconSize={20} text={tGas("gas_price_tooltip")} />
          </div>
          {disabledGasSettings ? (
            <span className="text-secondary-text">—</span>
          ) : (
            <span className="text-secondary-text text-16">
              {gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">{t("total_fee")}</div>
          {disabledGasSettings ? (
            <span className="text-secondary-text">—</span>
          ) : (
            <span>{`${gasPrice ? formatFloat(formatEther(gasPrice * totalGasLimit)) : ""} ${getChainSymbol(chainId)}`}</span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">{t("transactions")}</div>
          {disabledGasSettings ? (
            <span className="text-secondary-text">—</span>
          ) : (
            <span>{approveTransactionsCount + 1}</span>
          )}
        </div>
      </div>
      <div className="flex w-full md:w-1/8 items-center gap-2 mt-2 md:mt-0">
        <Button
          className="w-full md:w-auto h-8 md:h-auto disabled:bg-quaternary-bg"
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.EXTRA_SMALL}
          disabled={isFormDisabled || disabledGasSettings}
          onClick={() => setIsOpenedFee(true)}
        >
          Edit
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
