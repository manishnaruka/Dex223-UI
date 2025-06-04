import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { usePriceDirectionStore } from "@/app/[locale]/add/stores/usePriceDirectionStore";

export function useDerivedTokens() {
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { invertPrice, setInvertPrice, toggleInvertPrice } = usePriceDirectionStore();

  const sorted = tokenA && tokenB ? tokenA.wrapped.sortsBefore(tokenB.wrapped) : true;

  const baseToken = invertPrice ? (sorted ? tokenB : tokenA) : sorted ? tokenA : tokenB;

  const quoteToken = invertPrice ? (sorted ? tokenA : tokenB) : sorted ? tokenB : tokenA;

  return {
    tokenA,
    tokenB,
    baseToken,
    quoteToken,
    invertPrice,
    setInvertPrice,
    toggleInvertPrice,
  };
}
