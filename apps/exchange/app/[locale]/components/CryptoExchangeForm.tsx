import { useCallback, useState } from "react";

import ExchangeForm from "@/app/[locale]/components/ExchangeForm";
import { useFilteredTokens } from "@/app/[locale]/hooks/useFilteredTokens";
import { useMinAmount } from "@/app/[locale]/hooks/useMinAmount";
import { useOutputAmount } from "@/app/[locale]/hooks/useOutputAmount";
import { ExchangeToken } from "@/app/[locale]/types";
import { usePathname, useRouter } from "@/i18n/routing";
import addToast from "@/other/toast";

const defaultCryptoExchangeValues = {
  tokenA: "btc",
  tokenB: "eth",
  amount: "0.1",
  isFixed: false,
};

export default function CryptoExchangeForm({
  tokenMap,
  tokens,
  setExchange,
}: {
  tokenMap: Map<string, ExchangeToken>;
  tokens: ExchangeToken[];
  setExchange: (exchange: any) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const addQueryParam = useCallback(
    (exchangeId: string) => {
      const params = new URLSearchParams();
      params.set("exchangeId", exchangeId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router],
  );

  const [tokenA, setTokenA] = useState<ExchangeToken | undefined>(
    tokenMap.get(defaultCryptoExchangeValues.tokenA),
  );
  const [tokenB, setTokenB] = useState<ExchangeToken | undefined>(
    tokenMap.get(defaultCryptoExchangeValues.tokenB),
  );
  const [isFixed, setIsFixed] = useState(defaultCryptoExchangeValues.isFixed);

  const [inputAmount, setInputAmount] = useState(defaultCryptoExchangeValues.amount);

  const { availableTokens: tokensFrom, loading: tokensFromLoading } = useFilteredTokens(
    tokens,
    tokenB,
  );
  const { availableTokens: tokensTo, loading: tokensToLoading } = useFilteredTokens(tokens, tokenA);

  const [recipient, setRecipient] = useState("");
  const {
    minAmount,
    maxAmount,
    loading: isLoadingMinAmount,
    error: minAmountError,
  } = useMinAmount(tokenA, tokenB, isFixed);

  const {
    outputAmount,
    loading: isLoadingOutputAmount,
    error: outputAmountError,
  } = useOutputAmount(tokenA, tokenB, inputAmount, isFixed);

  const handleCreateExchange = useCallback(async () => {
    if (!tokenA || !tokenB) {
      addToast("Tokens are not selected");
      return;
    }

    const res = await fetch(`${window.location.origin}/api/simpleswap/create-exchange`, {
      method: "POST",
      body: JSON.stringify({
        fixed: isFixed,
        currency_from: tokenA.symbol,
        currency_to: tokenB.symbol,
        amount: inputAmount,
        address_to: recipient,

        extra_id_to: "",
        user_refund_address: "",
        user_refund_extra_id: "",
      }),
    });

    const data = await res.json();

    setExchange(data);
    addQueryParam(data.id);
  }, [addQueryParam, inputAmount, isFixed, recipient, setExchange, tokenA, tokenB]);

  return (
    <ExchangeForm
      tokenA={tokenA}
      tokenB={tokenB}
      recipient={recipient}
      inputAmount={inputAmount}
      setInputAmount={setInputAmount}
      isLoadingMinAmount={isLoadingMinAmount}
      isFixed={isFixed}
      setIsFixed={setIsFixed}
      setTokenA={setTokenA}
      setTokenB={setTokenB}
      handleCreateExchange={handleCreateExchange}
      minAmount={minAmount}
      maxAmount={maxAmount}
      outputAmount={outputAmount}
      isLoadingOutputAmount={isLoadingOutputAmount}
      setRecipient={setRecipient}
      tokensFrom={tokensFrom}
      tokensTo={tokensTo}
      tokensFromLoading={tokensFromLoading}
      tokensToLoading={tokensToLoading}
      outputAmountError={outputAmountError}
    />
  );
}
