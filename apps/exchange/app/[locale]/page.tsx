import ExchangePageClient from "@/app/[locale]/components/ExchangePageClient";

export default async function ExchangePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_INTERNAL_API_URL}/simpleswap/get-all-currencies`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    console.error("Failed to fetch initial tokens");
    throw new Error("Failed to fetch initial tokens");
  }

  const initialTokensFrom = await res.json();

  const params = await searchParams;
  const exchangeId = params.exchangeId;

  let dataExchange;

  try {
    const resExchange = await fetch(
      `${process.env.NEXT_PUBLIC_INTERNAL_API_URL}/simpleswap/get-exchange?exchangeId=${exchangeId}`,
    );

    if (resExchange.ok) {
      dataExchange = await resExchange.json();
    }
  } catch (e) {
    console.log(e);
  }

  return <ExchangePageClient tokens={initialTokensFrom} initialExchange={dataExchange} />;
}
