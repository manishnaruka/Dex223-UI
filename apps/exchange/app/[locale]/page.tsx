import ExchangePageClient from "@/app/[locale]/components/ExchangePageClient";

export default async function ExchangePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const apiKey = process.env.SIMPLE_SWAP_API_KEY;
  let initialTokensFrom = [];

  if (!apiKey) {
    console.warn("SIMPLE_SWAP_API_KEY is not set; rendering with empty token list.");
  } else {
    try {
      const res = await fetch(
        `https://api.simpleswap.io/get_all_currencies?api_key=${apiKey}`,
        {
          next: { revalidate: 60 },
        },
      );

      if (!res.ok) {
        console.error("Failed to fetch initial tokens");
      } else {
        initialTokensFrom = await res.json();
      }
    } catch (error) {
      console.error("Failed to fetch initial tokens", error);
    }
  }

  const params = await searchParams;
  const exchangeId = params.exchangeId;

  let dataExchange;

  try {
    if (exchangeId && apiKey) {
      const resExchange = await fetch(
        `https://api.simpleswap.io/get_exchange?id=${exchangeId}&api_key=${apiKey}`,
      );

      if (resExchange.ok) {
        dataExchange = await resExchange.json();
      }
    }
  } catch (e) {
    console.log(e);
  }

  return <ExchangePageClient tokens={initialTokensFrom} initialExchange={dataExchange} />;
}
