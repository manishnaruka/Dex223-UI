import create from "zustand";

interface USDPriceStore {
  prices: Record<string, number | undefined>;
  loading: Record<string, boolean>;
  setPrice: (token: string, price: number) => void;
  setLoading: (token: string, isLoading: boolean) => void;
}

export const useUSDPriceStore = create<USDPriceStore>((set, get) => ({
  prices: {}, // Object to store prices { token: price }
  loading: {}, // Object to track loading state { token: boolean }

  setPrice: (token, price) => set((state) => ({ prices: { ...state.prices, [token]: price } })),

  setLoading: (token, isLoading) =>
    set((state) => ({ loading: { ...state.loading, [token]: isLoading } })),
}));
