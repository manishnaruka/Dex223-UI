import { create } from "zustand";

import { OrderActionStep } from "@/app/[locale]/margin-trading/types";

interface EditOrderStepStore {
  step: OrderActionStep;
  setStep: (step: OrderActionStep) => void;
}

export const useEditOrderStepStore = create<EditOrderStepStore>((set, get) => ({
  step: OrderActionStep.FIRST,

  setStep: (step) => set({ step }),
}));
