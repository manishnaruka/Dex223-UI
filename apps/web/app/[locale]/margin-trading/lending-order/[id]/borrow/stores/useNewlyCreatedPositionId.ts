import { create } from "zustand";

interface CreatedPositionIdStore {
  positionId: number | undefined;
  setPositionId: (positionId: number | undefined) => void;
}

export const useNewlyCreatedPositionId = create<CreatedPositionIdStore>((set, get) => ({
  positionId: undefined,

  setPositionId: (positionId) => set({ positionId }),
}));
