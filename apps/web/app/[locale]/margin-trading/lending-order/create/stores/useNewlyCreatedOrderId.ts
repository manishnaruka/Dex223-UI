import { create } from "zustand";

interface CreatedOrderIdStore {
  orderId: number | undefined;
  setOrderId: (orderId: number | undefined) => void;
}

export const useNewlyCreatedOrderId = create<CreatedOrderIdStore>((set, get) => ({
  orderId: undefined,

  setOrderId: (orderId) => set({ orderId }),
}));
