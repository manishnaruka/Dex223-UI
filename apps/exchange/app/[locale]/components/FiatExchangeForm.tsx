import { useCallback, useState } from "react";

import ExchangeForm from "@/app/[locale]/components/ExchangeForm";
import { useFilteredTokens } from "@/app/[locale]/hooks/useFilteredTokens";
import { useMinAmount } from "@/app/[locale]/hooks/useMinAmount";
import { useOutputAmount } from "@/app/[locale]/hooks/useOutputAmount";
import { ExchangeToken } from "@/app/[locale]/types";
import addToast from "@/other/toast";

const defaultCryptoExchangeValues = {
  tokenA: "usd",
  tokenB: "btc",
  amount: "200",
  isFixed: false,
};

const allowedFiats = new Set(["usd", "gbp", "eur", "vnd", "zar", "jpy", "ngn", "mxn"]);

export default function FiatExchangeForm({
  tokenMap,
  tokens,
  setExchange,
}: {
  tokenMap: Map<string, ExchangeToken>;
  tokens: ExchangeToken[];
  setExchange: (exchange: any) => void;
}) {
  const [tokenA, setTokenA] = useState<ExchangeToken | undefined>(
    tokenMap.get(defaultCryptoExchangeValues.tokenA),
  );
  const [tokenB, setTokenB] = useState<ExchangeToken | undefined>(
    tokenMap.get(defaultCryptoExchangeValues.tokenB),
  );
  const [isFixed, setIsFixed] = useState(defaultCryptoExchangeValues.isFixed);

  const { fiatTokens } = useFilteredTokens(tokens);

  const [inputAmount, setInputAmount] = useState(defaultCryptoExchangeValues.amount);
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

  const { availableTokens: tokensTo, loading: tokensToLoading } = useFilteredTokens(tokens, tokenA);

  const handleCreateExchange = useCallback(async () => {
    if (!tokenA || !tokenB) {
      addToast("Tokens are not selected");
      return;
    }

    console.log(tokenA);
    console.log(tokenB);

    const res = await fetch(`/api/simpleswap/create-exchange`, {
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

    if (res.ok) {
      const data = await res.json();
      if (data) {
        setExchange(data);
      }
    }
  }, [inputAmount, isFixed, recipient, setExchange, tokenA, tokenB]);

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
      outputAmountError={outputAmountError}
      isLoadingOutputAmount={isLoadingOutputAmount}
      setRecipient={setRecipient}
      tokensFrom={fiatTokens.filter((t) => allowedFiats.has(t.symbol))}
      tokensTo={tokensTo}
      tokensFromLoading={false}
      tokensToLoading={tokensToLoading}
      isFiat
    />
  );
}
