import { createGasLimitStore } from "@/stores/factories/createGasLimitStore";
import { createGasPriceStore } from "@/stores/factories/createGasPriceStore";
import { createGasModeStore } from "@/stores/factories/createGasSettingsStore";

export const useCreateOrderGasPriceStore = createGasPriceStore();
export const useCreateOrderGasLimitStore = createGasLimitStore();
export const useCreateOrderGasModeStore = createGasModeStore();
