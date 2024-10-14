import { create } from "zustand";

export enum GasFeeModel {
  EIP1559,
  LEGACY,
}
export enum GasOption {
  CHEAP,
  FAST,
  CUSTOM,
}

export type GasSettings =
  | {
      model: GasFeeModel.EIP1559;
      maxFeePerGas: bigint | undefined;
      maxPriorityFeePerGas: bigint | undefined;
    }
  | {
      model: GasFeeModel.LEGACY;
      gasPrice: bigint | undefined;
    };
interface GasPriceSettingsStore {
  gasPriceOption: GasOption;
  gasPriceSettings: GasSettings;
  setGasPriceOption: (gasOption: GasOption) => void;
  setGasPriceSettings: (gasSettings: GasSettings) => void;
}

type GasPriceSettingsData = Pick<GasPriceSettingsStore, "gasPriceOption" | "gasPriceSettings">;

export const initialGasPriceSettings: GasPriceSettingsData = {
  gasPriceOption: GasOption.CHEAP,
  gasPriceSettings: {
    model: GasFeeModel.EIP1559,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  },
};
export const createGasPriceStore = (initialData: GasPriceSettingsData = initialGasPriceSettings) =>
  create<GasPriceSettingsStore>((set, get) => ({
    gasPriceOption: initialData.gasPriceOption,
    gasPriceSettings: initialData.gasPriceSettings,
    setGasPriceOption: (gasPriceOption) => set({ gasPriceOption }),
    setGasPriceSettings: (gasPriceSettings) => set({ gasPriceSettings }),
  }));
