import { create } from "zustand";

import { TxFlow, TxStepStatus } from "@/components/common/ProcessingTransactionRow";

const swapFlowTemplate: TxFlow = {
  currentStep: 0,
  steps: [{ key: "remove", status: TxStepStatus.IDLE }],
};

interface TxFlowStore {
  flow: TxFlow;
  setStepStatus: (key: string, status: TxStepStatus, hash?: string, error?: string) => void;
  nextStep: () => void;
  resetFlow: () => void;
}

export const useRemoveLiquidityFlowStore = create<TxFlowStore>((set, get) => ({
  flow: swapFlowTemplate,
  setStepStatus: (key, status, hash, error) => {
    const updatedSteps = get().flow.steps.map((step) =>
      step.key === key ? { ...step, status, hash, error } : step,
    );
    set({ flow: { ...get().flow, steps: updatedSteps } });
  },
  nextStep: () => {
    set((state) => ({
      flow: { ...state.flow, currentStep: state.flow.currentStep + 1 },
    }));
  },
  resetFlow: () => set({ flow: swapFlowTemplate }),
}));
