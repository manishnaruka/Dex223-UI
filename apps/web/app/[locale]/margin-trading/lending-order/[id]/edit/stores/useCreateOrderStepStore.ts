import { create } from "zustand";

export enum CreateOrderStep {
  FIRST,
  SECOND,
  THIRD,
}

interface CreateOrderStepStore {
  step: CreateOrderStep;
  setStep: (step: CreateOrderStep) => void;
}

export const useCreateOrderStepStore = create<CreateOrderStepStore>((set, get) => ({
  step: CreateOrderStep.FIRST,

  setStep: (step) => set({ step }),
}));
