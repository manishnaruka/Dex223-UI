import ExchangePageClient from "@/app/[locale]/components/ExchangePageClient";

export default async function ExchangePage() {
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

  return <ExchangePageClient tokens={initialTokensFrom} />;
}
