import { useQuery } from "@tanstack/react-query";

import type { ReferralData } from "@/app/[locale]/referrals/data/referralData";

async function fetchReferralData(): Promise<ReferralData> {
  const res = await fetch("/api/referrals/me", {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load referral data (${res.status})`);
  }
  return res.json();
}

export function useReferralData(enabled: boolean) {
  return useQuery({
    queryKey: ["referrals", "me"],
    queryFn: fetchReferralData,
    enabled,
    staleTime: 30_000,
  });
}
